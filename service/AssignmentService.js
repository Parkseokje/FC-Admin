const QUERY = require("../database/query");
const async = require("async");
const Util = require("../util/util");
const AssignmentService = {};
const pool = require("../commons/db_conn_pool");

/**
 * 관리자를 비활성화 한다.
 * @name AssignmentService.deactivateEduAssignmentById
 * @param {*} _id 관리자 아이디
 * @param {*} _callback 콜백
 */
AssignmentService.deactivateEduAssignmentById = (_id, _callback) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    connection.query(QUERY.ASSIGNMENT.DisableLogAssignEduById, [_id], (err, data) => {
      connection.release();
      if (err) throw err;
      _callback(err, null);
    });
  });
};

/**
 * 간편배정 진행상태를 저장하는 API를 호출한다.
 * @name AssignmentService.updateProgress
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
AssignmentService.updateProgress = (req, res, next) => {
  AssignmentService.updateSimpleAssignment(req.body, () => {
    return res.sendStatus(200);
  });
};

/**
 * 교육과정 배정일자를 수정한다. (log_assign_edu id 를 통해)
 * @name AssignmentService.modifyLogAssignEdu
 * @param {*} _data 전달할 데이터
 * @param {*} _callback 콜백
 */
AssignmentService.modifyLogAssignEdu = (_data, _callback) => {
  const logAssignEduId = _data.log_assign_edu_id;
  const trainingStartDate = _data.start_dt + " " + "00:00:00";
  const trainingEndDate = _data.end_dt + " " + "23:59:59";

  pool.getConnection((err, connection) => {
    if (err) throw err;
    connection.query(
      QUERY.ASSIGNMENT.UpdateLogAssignEduById,
      [trainingStartDate, trainingEndDate, logAssignEduId],
      (err, data) => {
        // console.log(q.sql);
        connection.release();
        if (err) throw err;
        _callback(err, data);
      }
    );
  });
};

/**
 * 교육과정 배정일자를 수정한다. (training_edu_id 를 통해)
 * @name AssignmentService.modifyLogAssignEdu2
 * @param {*} _data 전달할 데이터
 * @param {*} _callback 콜백
 */
AssignmentService.modifyLogAssignEdu2 = (_data, _callback) => {
  const trainingEduId = _data.training_edu_id;
  const trainingStartDate = _data.start_dt;
  const trainingEndDate = _data.end_dt;

  pool.getConnection((err, connection) => {
    if (err) throw err;
    let q = connection.query(
      QUERY.ASSIGNMENT.UpdateLogAssignEduByTrainingEduId,
      [trainingStartDate, trainingEndDate, trainingEduId],
      (err, data) => {
        console.log(q.sql);
        connection.release();
        if (err) console.log(err); // throw err;
        _callback(err, data);
      }
    );
  });
};

/**
 * 교육과정 간편배정내역을 생성한다.
 * _data.upload_type 이 'excel' 일 경우,
 * user 를 먼저 생성한다음 user_id를 취득한 후 아래 단계를 진행한다.
 * 1. log_group_user 생성
 * 2. log_bind_users 생성
 * @name AssignmentService.create
 * @param {Object} _connection 전달할 mysql connection
 * @param {Object} _data 전달할 데이터 Object
 * @param {Function} _callback 전달할 콜백
 */
AssignmentService.create = (_connection, _data, _callback) => {
  let userIdCount = 0;
  let simpleAssignmentId = _data.simple_assignment_id;
  const logGroupUserId = _data.groupId === undefined ? Util.publishHashByMD5(new Date()) : _data.groupId;
  let userIds = [];

  _connection.beginTransaction(err => {
    // 트렌젝션 오류 발생
    if (err) _callback(err, null);

    switch (_data.upload_type) {
    case "excel":
      if (_data.excel.length > 0) {
          // 핸드폰 번호로 사용자를 검색한다.
        _connection.query(QUERY.EDU.GetUserDataByPhone, [_data.excel], (err, data) => {
          if (err) throw err;
          if (data.length === 0) {
            _callback(null, null);
            return;
          }
          for (var index = 0; index < data.length; index++) {
            userIds.push(data[index].id);
          }
          async.whilst(
              () => {
                return userIdCount < userIds.length;
              },
              callback => {
                // log_group_user 테이블에 차례대로 입력
                _connection.query(
                  QUERY.EDU.InsertIntoLogGroupUser,
                  [userIds[userIdCount], logGroupUserId],
                  (err, data) => {
                    callback(err, null);
                  }
                );
                userIdCount++;
              },
              (err, data) => {
                if (err) {
                  console.log("----------------------------");
                  console.log("error:InsertIntoLogGroupUser");
                  console.error(err);
                  return _connection.rollback(() => {
                    _callback(err, null);
                    return;
                  });
                }

                // log_bind_users 테이블에 입력
                if (!_data.log_bind_user_id) {
                  _connection.query(
                    QUERY.EDU.InsertIntoLogBindUser,
                    [_data.group_name, _data.group_desc, _data.admin_id, logGroupUserId],
                    (err, result) => {
                      if (err) {
                        console.log("----------------------------");
                        console.log("error:InsertIntoLogBindUser");
                        console.error(err);
                        return _connection.rollback(() => {
                          _callback(err, null);
                          return;
                        });
                      } else {
                        _connection.commit(err => {
                          if (err) {
                            return _connection.rollback(() => {
                              _callback(err, null);
                              return;
                            });
                          } else {
                            _callback(null, {
                              insertId: result.insertId,
                              employeeIds: userIds
                            });
                          }
                        });
                      }
                    }
                  );
                } else {
                  _connection.commit(err => {
                    if (err) {
                      return _connection.rollback(() => {
                        _callback(err, null);
                        return;
                      });
                    } else {
                      _callback(null, null);
                    }
                  });
                }
              }
            );
        });
      } else {
        _callback({ err: "데이터가 존재하지 않습니다." }, null);
      }
      break;

    case "employee":
      if (_data.upload_employee_ids.length === 0) {
        _callback(null, null);
        return;
      }

      userIds = _data.upload_employee_ids.slice(0);

      async.whilst(
          () => {
            return userIdCount < userIds.length;
          },
          callback => {
            _connection.query(QUERY.EDU.InsertIntoLogGroupUser, [userIds[userIdCount], logGroupUserId], (err, data) => {
              callback(err, null);
            });
            userIdCount++;
          },
          (err, data) => {
            if (err) {
              console.log("----------------------------");
              console.log("error:InsertIntoLogGroupUser");
              console.error(err);
              return _connection.rollback(() => {
                _callback(err, null);
                return;
              });
            }

            if (!_data.log_bind_user_id) {
              _connection.query(
                QUERY.EDU.InsertIntoLogBindUser,
                [_data.group_name, _data.group_desc, _data.admin_id, logGroupUserId, simpleAssignmentId],
                (err, result) => {
                  if (err) {
                    console.log("----------------------------");
                    console.log("error:InsertIntoLogBindUser");
                    console.error(err);
                    return _connection.rollback(() => {
                      _callback(err, null);
                      return;
                    });
                  } else {
                    _connection.commit(err => {
                      if (err) {
                        return _connection.rollback(() => {
                          _callback(err, null);
                          return;
                        });
                      } else {
                        // console.log('commit success!');
                        _callback(null, result);
                      }
                    });
                  }
                }
              );
            } else {
              _connection.commit(err => {
                if (err) {
                  return _connection.rollback(() => {
                    _callback(err, null);
                    return;
                  });
                } else {
                  _callback(null, null);
                }
              });
            }
          }
        );
      break;

    default:
      break;
    }
  });
};

/**
 * 교육생그룹에 교육과정을 할당한다.
 * @name AssignmentService.allocate
 * @param {Object} _connection 전달할 mysql connection
 * @param {Object} _data 전달할 데이터 Object
 * @param {Function} _callback 전달할 콜백
 * @deprecated 교육생그룹에 배정하는 기능에서만 사용됨
 */
AssignmentService.allocate = (_connection, _data, _callback) => {
  const eduId = _data.edu_id;
  const logBindUserId = parseInt(_data.log_bind_user_id);
  const trainingStartDate = _data.start_dt;
  const trainingEndDate = _data.end_dt;
  const userData = _data.user;
  let trainingEduId = _data.training_edu_id;

  // console.log(_data);
  // console.log(_connection);

  async.series(
    [
      // callback => {
      //   _connection.query(QUERY.EDU.GetEduInfoById, [eduId], (err, data) => {
      //     console.log(data);
      //     callback(err, data);
      //   });
      // },
      callback => {
        // 신규 입력 또는 교육과정 불러오기를 통한 신규입력일 경우
        if (!_data.isUpdate || _data.is_existed_edu) {
          console.log("trainining_edu 입력");
          _connection.query(QUERY.EDU.InsertTrainingEdu, [eduId, userData.admin_id], (err, data) => {
            if (data.insertId !== undefined) {
              trainingEduId = data.insertId;
            }
            callback(err, data);
          });
        } else {
          callback(null, null);
        }
      },
      callback => {
        if (_data.isUpdate && trainingEduId) {
          console.log("training_users 삭제");
          _connection.query(
            QUERY.ASSIGNMENT.DeleteTrainingUsersByTrainingEduId2,
            [trainingEduId, logBindUserId],
            (err, data) => {
              callback(err, data);
            }
          );
        } else {
          callback(null, null);
        }
      },
      callback => {
        console.log("training_users 입력");
        _connection.query(QUERY.EDU.InsertUserIdInTrainingUsers, [trainingEduId, logBindUserId], (err, data) => {
          if (err) throw err;
          callback(err, data);
        });
      },
      callback => {
        console.log("log_assign_edu 입력/수정");
        // 신규 입력 또는 교육과정 불러오기를 통한 신규입력일 경우
        if (!_data.isUpdate || _data.is_existed_edu) {
          // log_assign_edu 테이블에 입력
          _connection.query(
            QUERY.HISTORY.InsertIntoLogAssignEdu,
            [
              trainingEduId,
              logBindUserId,
              userData.admin_id,
              trainingStartDate, // + ' ' + '00:00:00',
              trainingEndDate // + ' ' + '23:59:59'
            ],
            (err, data) => {
              callback(err, data);
            }
          );
        } else {
          // training_edu_id 로 log_assign_edu 수정
          // console.log('modifyLogAssignEdu2 : ', trainingStartDate, trainingEndDate);
          AssignmentService.modifyLogAssignEdu2(
            {
              start_dt: trainingStartDate,
              end_dt: trainingEndDate,
              training_edu_id: trainingEduId
            },
            (err, data) => {
              callback(err, data);
            }
          );
        }
      }
    ],
    (err, results) => {
      if (err) {
        throw err;
      } else {
        _callback(null, { trainingEduId: trainingEduId });
      }
    }
  );
};

/**
 * 배정을 취소한다.
 * @name AssignmentService.deleteAllocation
 * @param {Object} _connection 전달할 mysql connection
 * @param {Object} 전달할 데이터 Object (trainingEduId, assignmentId)
 * @param {Function} _callback 전달할 콜백
 */
AssignmentService.deleteAllocation = (_connection, { trainingEduId, assignmentId }, _callback) => {
  async.series(
    [
      callback => {
        _connection.query(QUERY.ASSIGNMENT.DeleteTrainingUsersByTrainingEduId, [trainingEduId], (err, rows) => {
          callback(err, rows);
        });
      },
      callback => {
        _connection.query(QUERY.ASSIGNMENT.DeleteLogAssignEduByTrainingEduId, [trainingEduId], (err, rows) => {
          callback(err, rows);
        });
      },
      callback => {
        AssignmentService.deleteAssignment({ id: assignmentId }, (err, result) => {
          callback(err, null);
        });
      },
      callback => {
        _connection.query(QUERY.ASSIGNMENT.DeleteTrainingEduById, [trainingEduId], (err, rows) => {
          callback(err, rows);
        });
      }
    ],
    (err, results) => {
      if (err) {
        throw err;
      } else {
        _callback(null, null);
      }
    }
  );
};

/**
 * 간편배정내역을 리턴한다.
 * @name AssignmentService.getSimpleAssignmentList
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
AssignmentService.getSimpleAssignmentList = (req, res, next) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    async.series(
      [
        callback => {
          connection.query(QUERY.ASSIGNMENT.SelectSimpleAssignments, [req.user.fc_id], (err, rows) => {
            if (err) {
              callback(err, null);
            } else {
              callback(null, rows);
            }
          });
        }
      ],
      (err, results) => {
        connection.release();
        if (err) {
          console.error(err);
          throw new Error(err);
        } else {
          return res.render("simple-assignment", {
            title: "교육개설",
            current_path: "SimpleAssignment",
            menu_group: "education",
            loggedIn: req.user,
            list: results[0]
          });
        }
      }
    );
  });
};

/**
 * 간편배정내역에 추가할 강의목록을 반환한다. (이미 추가된 강의는 제외)
 * @name AssignmentService.getCoursesToAdd
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
AssignmentService.getCoursesToAdd = (req, res, next) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    async.series(
      [
        callback => {
          connection.query(QUERY.ASSIGNMENT.SelectCoursesToAdd, [req.user.fc_id, req.query.edu_id], (err, rows) => {
            if (err) {
              callback(err, null);
            } else {
              callback(null, rows);
            }
          });
        }
      ],
      (err, results) => {
        connection.release();
        if (err) {
          console.error(err);
          throw new Error(err);
        } else {
          return res.send({
            success: true,
            courses: results[0]
          });
        }
      }
    );
  });
};

/**
 * 간편배정내역에 강의를 추가한다.
 * @name AssignmentService.addCourses
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
AssignmentService.addCourses = (req, res, next) => {
  const arrCourses = JSON.parse("[" + req.body.course_ids + "]");
  let courseIdCount = 0;
  let eduCourseGroupId;

  pool.getConnection((err, connection) => {
    if (err) throw err;

    connection.query(QUERY.EDU.GetEduInfoById, [req.body.edu_id], (err, row) => {
      if (err) throw err;
      if (row) {
        eduCourseGroupId = row[0].course_group_key;

        // 강의를 입력한다.
        async.whilst(
          () => {
            return courseIdCount < arrCourses.length;
          },
          callback => {
            connection.query(
              QUERY.EDU.InsertCourseGroupBySelect,
              [eduCourseGroupId, arrCourses[courseIdCount], eduCourseGroupId],
              (err, data) => {
                callback(err, null);
              }
            );
            courseIdCount++;
          },
          (err, results) => {
            connection.release();
            if (err) {
              console.error(err);
              throw new Error(err);
            } else {
              // success
              return res.json({
                success: true
              });
            }
          }
        );
      }
    });
  });
};

/**
 * 간편배정내역을 아이디를 통해 조회하여 반환.
 * @name AssignmentService.getSimpleAssignmentById
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
AssignmentService.getSimpleAssignmentById = (req, res, next, id) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    connection.query(QUERY.ASSIGNMENT.SelectSimpleAssignmentById, [id], (err, result) => {
      connection.release();
      if (err) {
        throw new Error(err);
      } else if (!result) {
        return res.sendStatus(400);
      } else {
        req.assignment = result[0];
        return next();
      }
    });
  });
};

/**
 * 간편배정내역을 생성한다.
 * @name AssignmentService.createSimpleAssignment
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
AssignmentService.createSimpleAssignment = (req, res, next) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;

    connection.beginTransaction(err => {
      if (err) {
        return res.status(500).send({
          success: false,
          message: err
        });
      }

      async.series(
        [
          callback => {
            connection.query(QUERY.ASSIGNMENT.InsertSimpleAssignment, [req.user.admin_id], (err, rows) => {
              if (err) {
                callback(err, null);
              } else {
                callback(null, rows);
              }
            });
          }
        ],
        (err, results) => {
          connection.release();
          if (err) {
            connection.rollback(() => {
              return res.status(500).send({
                success: false,
                message: err
              });
            });
          } else {
            connection.commit(err => {
              if (err) {
                return res.status(500).send({
                  success: false,
                  message: err
                });
              } else {
                // success code
                return res.redirect(`/simple_assignment/${results[0].insertId}`);
              }
            });
          }
        }
      );
    });
  });
};

/**
 * 간편배정내역을 삭제한다.
 * @name AssignmentService.deleteSimpleAssignment
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
AssignmentService.deleteSimpleAssignment = (req, res, next) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;

    connection.beginTransaction(err => {
      if (err) {
        return res.status(500).send({
          success: false,
          message: err
        });
      }

      async.series(
        [
          callback => {
            connection.query(QUERY.ASSIGNMENT.DeleteSimpleAssignment, [req.query.id], (err, result) => {
              callback(err, result);
            });
          },
          callback => {
            if (req.query.log_bind_user_id) {
              connection.query(QUERY.ASSIGNMENT.DisableLogBindUserById, [req.query.log_bind_user_id], (err, result) => {
                callback(err, result);
              });
            } else {
              callback(null, null);
            }
          },
          callback => {
            if (req.query.edu_id) {
              connection.query(QUERY.EDU.DisableEduById, [req.query.edu_id], (err, result) => {
                callback(err, result);
              });
            } else {
              callback(null, null);
            }
          }
        ],
        (err, results) => {
          connection.release();
          if (err) {
            connection.rollback(() => {
              return res.status(500).send({
                success: false,
                message: err
              });
            });
          } else {
            connection.commit(err => {
              if (err) {
                return res.status(500).send({
                  success: false,
                  message: err
                });
              } else {
                return res.status(200).send({
                  success: true
                });
              }
            });
          }
        }
      );
    });
  });
};

/**
 * 간편배정 진행상태를 저장한다.
 * @name AssignmentService.updateSimpleAssignment
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
AssignmentService.updateSimpleAssignment = (data, _callback) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;

    connection.beginTransaction(err => {
      if (err) throw err;

      async.series(
        [
          callback => {
            connection.query(QUERY.ASSIGNMENT.UpdateSimpleAssignment(data), [], (err, rows) => {
              callback(err, rows);
            });
          }
        ],
        (err, results) => {
          connection.release();
          if (err) {
            connection.rollback(() => {
              throw err;
            });
          } else {
            connection.commit(err => {
              if (err) {
                throw err;
              } else {
                _callback();
              }
            });
          }
        }
      );
    });
  });
};

/**
 * 배정내역을 삭제한다.
 * @name AssignmentService.deleteAssignment
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @deprecated 교육생그룹 교육과정 배정시 사용
 */
AssignmentService.deleteAssignment = (data, _callback) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;

    connection.beginTransaction(err => {
      if (err) throw err;

      async.series(
        [
          callback => {
            connection.query(QUERY.ASSIGNMENT.DeleteGroupUserBySimpleAssignId(data), [], (err, rows) => {
              callback(err, rows);
            });
          },
          callback => {
            connection.query(QUERY.ASSIGNMENT.DeleteBindUserBySimpleAssignId(data), [], (err, rows) => {
              callback(err, rows);
            });
          }
        ],
        (err, results) => {
          connection.release();
          if (err) {
            connection.rollback(() => {
              throw err;
            });
          } else {
            connection.commit(err => {
              if (err) {
                throw err;
              } else {
                _callback();
              }
            });
          }
        }
      );
    });
  });
};

/**
 * 배정내역을 교육생그룹아이디를 통해 삭제한다.
 * @name AssignmentService.deleteGroupUserByGroupId
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @deprecated 교육생그룹 교육과정 배정시 사용
 */
AssignmentService.deleteGroupUserByGroupId = ({ groupId }, _callback) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;

    connection.beginTransaction(err => {
      if (err) throw err;

      async.series(
        [
          callback => {
            connection.query(QUERY.ASSIGNMENT.DeleteLogGroupUserByGroupId, [groupId], (err, result) => {
              callback(err, result);
            });
          }
        ],
        (err, results) => {
          connection.release();
          if (err) {
            connection.rollback(() => {
              throw err;
            });
          } else {
            connection.commit(err => {
              if (err) {
                throw err;
              } else {
                _callback();
              }
            });
          }
        }
      );
    });
  });
};

/**
 * 배정된 교육생그룹을 반환한다.
 * @name AssignmentService.getBindUser
 * @param {Object} logBindUserId
 * @param {*} _callback
 * @deprecated 교육생그룹 교육과정 배정시 사용
 */
AssignmentService.getBindUser = ({ logBindUserId }, _callback) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    connection.query(QUERY.EDU.GetAssignmentDataById, [logBindUserId], (err, result) => {
      connection.release();
      if (err) {
        throw new Error(err);
      } else {
        _callback(result);
      }
    });
  });
};

module.exports = AssignmentService;
