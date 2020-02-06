var express = require("express");
var router = express.Router();
var mysql_dbc = require("../commons/db_conn")();
var connection = mysql_dbc.init();
var QUERY = require("../database/query");
var isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};
require("../commons/helpers");
var async = require("async");
var fs = require("fs");

var formidable = require("formidable");
var util = require("util");
var Excel = require("exceljs");
var convertExcel = require("excel-as-json").processFile;
var AssignmentService = require("../service/AssignmentService");
var Util = require("../util/util");
const pool = require("../commons/db_conn_pool");
const path = require("path");

router.get("/", isAuthenticated, function(req, res) {
  pool.getConnection(function(err, connInPool) {
    if (err) throw err;
    async.series(
      [
        // 교육대상 그룹
        // results[0]
        function(callback) {
          connInPool.query(
            QUERY.EDU.GetCustomUserList,
            [req.user.fc_id],
            function(err, data) {
              callback(err, data);
            }
          );
        },
        // 직원 리스트
        // results[1]
        function(callback) {
          connInPool.query(
            QUERY.EMPLOYEE.GetEmployeeList,
            [req.user.fc_id],
            function(err, data) {
              callback(err, data);
            }
          );
        }
      ],
      function(err, results) {
        connInPool.release();
        if (err) {
          console.error(err);
        } else {
          res.render("assignment", {
            current_path: "Assignment",
            menu_group: "education",
            title: PROJ_TITLE + "Assignment",
            loggedIn: req.user,
            list: results[0],
            employees: results[1]
          });
        }
      }
    );
  });
});

router.get("/details", isAuthenticated, function(req, res) {
  var _id = req.query.id;
  var _group = req.query.group_id;

  pool.getConnection(function(err, connInPool) {
    if (err) throw err;

    async.series(
      [
        function(callback) {
          connInPool.query(QUERY.EDU.GetAssignmentDataById, [_id], function(
            err,
            rows
          ) {
            if (err) {
              console.error(err);
              callback(err, null);
            } else {
              callback(null, rows);
            }
          });
        },
        function(callback) {
          connInPool.query(QUERY.EDU.GetUserListByGroupId, [_group], function(
            err,
            rows
          ) {
            if (err) {
              console.error(err);
              callback(err, null);
            } else {
              callback(null, rows);
            }
          });
        },
        function(callback) {
          connInPool.query(QUERY.EDU.GetList, [req.user.fc_id], function(
            err,
            rows
          ) {
            if (err) {
              console.error(err);
              callback(err, null);
            } else {
              callback(null, rows);
            }
          });
        }
      ],
      function(err, result) {
        connInPool.release();

        if (err) {
          console.error(err);
          throw new Error(err);
        } else {
          res.render("assignment_details", {
            current_path: "AssignmentDetails",
            menu_group: "education",
            title: PROJ_TITLE + "Assignment Details",
            loggedIn: req.user,
            detail: result[0],
            detail_list: result[1],
            edu_list: result[2]
          });
        }
      }
    );
  });
});

const UserService = require("../service/UserService");

/**
 * 특정 교육생그룹에 교육과정을 배정한다.
 */
router.post("/allocation/edu", function(req, res) {
  var requestData = {
    edu_id: req.body.edu_list,
    log_bind_user_id: req.body.bind_group_id,
    user: req.user
  };

  AssignmentService.allocate(connection, requestData, function(err, data) {
    if (err) {
      console.log(err);
      res.json({
        success: false,
        msg: err
      });
    } else {
      res.redirect("/assignment");
    }
  });
});

// 특정 그룹에 교육을 배정한다. (Deprecated)
router.post("/allocation/edu_x", function(req, res) {
  var groupId = req.body.group_id; // 교육 대상자 그룹 아이디
  var eduId = req.body.edu_list; // 교육 아이디
  var bindUserId = req.body.bind_group_id;

  connection.beginTransaction(function() {
    async.waterfall(
      [
        // todo group_id를 통해서 유저 배열을 들고 온다.
        function(callback) {
          UserService.extractUserIdByGroupId(groupId, function(err, result) {
            if (err) {
              callback(err, null);
              console.error(err);
            } else {
              console.info("extract user info");
              console.info(result);
              callback(null, result);
            }
          });
        },

        // todo  training_edu 테이블에 입력 edu_id
        function(user_id, callback) {
          connection.query(
            QUERY.EDU.InsertTrainingEdu,
            [eduId, req.user.admin_id],
            function(err, result) {
              if (err) {
                callback(err, null);
                throw new Error(err);
              } else {
                console.info("extract training_edu_id");
                console.info(result);
                console.info(result.insertId);

                callback(null, user_id, result);
              }
            }
          );
        },

        // bug 입력 진행이 되지 않는다 이것을 추적할 것 : 원인 진단 -> training_edu id값을 참조하여 training_uesrs에 입력을 해야 하나 참조가 되려면 미리 데이터가 입력되어야 가능하도록 작동중이다
        // 그래서 임의로 일단 참조 관계를 끊어놓는다
        // todo 리턴받은 training_edu_id, user_id를 가지고 training_users 테이블에 입력한다. 이 때 손실된 데이터가 생겼을 경우 다시 로그를 남기고 관리자가 알 수 있도록 해야 한다.
        function(user_id, result, callback) {
          UserService.InsertUsersWithTrainingEduId(
            user_id,
            result.insertId,
            function(err, ret) {
              if (err) {
                console.error(err);
                callback(err, null);
              } else {
                console.log("insert users trainig_users");
                callback(null, result.insertId);
              }
            }
          );
        },

        // todo log_assign_edu 테이블에 log_bind_edu id와 training_edu id를 입력한다.
        function(training_edu_id, callback) {
          // bindUserId
          connection.query(
            QUERY.HISTORY.InsertIntoLogAssignEdu,
            [training_edu_id, bindUserId],
            function(err, ret) {
              if (err) {
                console.error(err);
                callback(err, null);
              } else {
                console.log("log_assign_edu");
                callback(null, ret);
              }
            }
          );
        }
      ],

      function(err, result) {
        if (err) {
          console.error(err);
          connection.rollback();
          throw new Error(err);
        } else {
          // connection.rollback();
          connection.commit();
          res.redirect("/assignment");
        }
      }
    );
  }); // transaction
});

/**
 * 교육배정자 그룹을 저장한다.
 * 방식(2)
 * 1. employee : 직원목록을 이용하여 생성
 * 2. excel : 엑셀 업로드를 이용하여 생성
 */
router.post("/upload", isAuthenticated, function(req, res) {
  var incomingForm = new formidable.IncomingForm({
    encoding: "utf-8",
    keepExtensions: true,
    multiples: false,
    uploadDir: path.join(__dirname, "/../public/uploads/excel")
  });

  incomingForm.on("error", function(err) {
    if (err) {
      res.writeHead(404);
      res.end(JSON.stringify(err));
      return;
    }
  });

  incomingForm.parse(req, function(err, fields, files) {
    var uploadType = fields.upload_type;
    var filePath = files["file-excel"].path;
    var requestData = {
      admin_id: req.user.admin_id,
      upload_type: fields.upload_type,
      upload_employee_ids: JSON.parse("[" + fields.upload_employee_ids + "]"),
      group_name: fields.group_name,
      group_desc: fields.group_desc
    };

    async.series(
      [
        // 엑셀 데이터를 읽어들인다.
        function(callback) {
          switch (uploadType) {
          case "excel_bak":
            convertExcel(filePath, undefined, false, function(err, data) {
              requestData.excel = data;
              callback(err, data);
            });
            break;

          case "excel":
            var wb = new Excel.Workbook();
            wb.xlsx.readFile(filePath).then(function() {
              var ws = wb.getWorksheet(1);
              var phone = [];
              ws.eachRow({ includeEmpty: false }, function(row, rowNumber) {
                row.eachCell(function(cell, colNumber) {
                  if (rowNumber >= 2 && colNumber === 2) {
                    phone.push(cell.value);
                  }
                  console.log(
                      "Row " +
                        rowNumber +
                        ", Cell " +
                        colNumber +
                        " = " +
                        cell.value
                    );
                });
              });
              requestData.excel = phone;
              callback(null, requestData);
            });
            break;

          case "employee":
            callback(null, null);
            break;

          default:
            break;
          }
        },
        // 교육배정 그룹을 생성한다.
        function(callback) {
          AssignmentService.create(connection, requestData, function(
            err,
            result
          ) {
            callback(err, result);
          });
        },
        // 엑셀파일을 삭제한다.
        function(callback) {
          if (requestData.upload_type === "excel") {
            Util.deleteFile(filePath, function(err, result) {
              if (err) {
                console.error(err);
                callback(err, null);
              } else {
                callback(null, result);
              }
            });
          } else {
            callback(null, null);
          }
        }
      ],
      function(err, results) {
        if (err) {
          console.error(err);
          throw new Error("err");
        }
        res.redirect("/assignment");
      }
    );
  });
});

/**
 * 교육생그룹 삭제
 */
router.delete("/", isAuthenticated, function(req, res, next) {
  var queryParams = req.query;

  pool.getConnection(function(err, connInPool) {
    if (err) throw err;
    connInPool.beginTransaction(function(err) {
      // 트렌젝션 오류 발생
      if (err) {
        res.json({
          success: false,
          msg: err
        });
      }
      async.series(
        [
          // log_bind_users 삭제
          function(callback) {
            connInPool.query(
              QUERY.ASSIGNMENT.DisableLogBindUserById,
              [queryParams.id],
              function(err, data) {
                callback(err, data);
              }
            );
          }
        ],
        function(err, results) {
          connInPool.release();
          if (err) {
            // 쿼리 오류 발생
            return connInPool.rollback(function() {
              return res.json({
                success: false,
                msg: err
              });
            });
          } else {
            connInPool.commit(function(err) {
              // 커밋 오류 발생
              if (err) {
                return connInPool.rollback(function() {
                  return res.json({
                    success: false,
                    msg: err
                  });
                });
              }

              // 커밋 성공
              res.json({
                success: true
              });
            });
          }
        }
      );
    });
  });
});

module.exports = router;
