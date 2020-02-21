const express = require("express");
const router = express.Router();
const QUERY = require("../database/query");
const async = require("async");
const util = require("../util/util");
const CourseService = require("../service/CourseService");
const pool = require("../commons/db_conn_pool");

router.param("id", CourseService.getDetailsByCourseId);
/**
 * 강의/강사등록 첫 페이지
 */
router.get("/", util.isAuthenticated, util.getLogoInfo, (req, res, next) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    async.series(
      [
        callback => {
          connection.query(
            QUERY.COURSE.GetCourseList,
            [req.user.fc_id],
            (err, rows) => {
              if (err) {
                console.error(err);
                callback(err, null);
              } else {
                callback(null, rows);
              }
            }
          );
        }
      ],
      (err, result) => {
        connection.release();
        if (err) {
          console.error(err);
        } else {
          res.render("course", {
            current_path: "Course",
            title: "강의관리",
            menu_group: "education",
            loggedIn: req.user,
            list: result[0]
          });
        }
      }
    );
  });
});

/**
 * 강의/강사등록 상세페이지
 */
router.get(
  "/details",
  util.isAuthenticated,
  util.getLogoInfo,
  (req, res, next) => {
    const { id: courseId } = req.query;

    pool.getConnection((err, connection) => {
      if (err) throw err;
      async.series(
        [
          // 강의정보 조회
          callback => {
            connection.query(
              QUERY.COURSE.GetCourseListById,
              [req.user.fc_id, courseId],
              (err, row) => {
                callback(err, row);
              }
            );
          },
          callback => {
            // 세션정보 조회
            connection.query(
              QUERY.COURSE.GetSessionListByCourseId,
              [courseId],
              (err, rows) => {
                callback(err, rows);
              }
            );
          }
        ],
        (err, results) => {
          connection.release();
          if (err) {
            console.error(err);
          } else {
            res.render("course_details", {
              current_path: "CourseDetails",
              title: "강의관리",
              menu_group: "education",
              loggedIn: req.user,
              course_id: results[0][0].course_id,
              course_name: results[0][0].course_name,
              course_desc: results[0][0].course_desc,
              teacher_name: results[0][0].teacher_name,
              course_rate: results[0][0].teacher_name,
              teacher_rate: results[0][0].teacher_rate,
              session_list: results[1]
            });
          }
        }
      );
    });
  }
);

/**
 * 강의 세션수를 조회한다.
 */
router.get("/sessioncount", util.isAuthenticated, (req, res, next) => {
  const { id } = req.query;
  pool.getConnection((err, connection) => {
    if (err) throw err;
    connection.query(QUERY.COURSE.GetSessionCount, [id], (err, data) => {
      connection.release();
      if (err) {
        // 쿼리 실패
        return res.json({
          success: false,
          msg: err
        });
      } else {
        // 쿼리 성공
        return res.json({
          success: true,
          session_count: data[0].session_count
        });
      }
    });
  });
});

/**
 * 강의/강사등록 > 강의등록
 */
router.post("/", util.isAuthenticated, CourseService.create);
router.post("/register", util.isAuthenticated, (req, res, next) => {
  const {
    course_name: courseName,
    course_desc: courseDescription,
    teacher_name: teacherName
  } = req.body;
  const adminId = req.user.admin_id;

  pool.getConnection((err, connection) => {
    if (err) throw err;
    connection.query(
      QUERY.COURSE.CreateCourse,
      [courseName, teacherName, courseDescription, adminId],
      (err, rows) => {
        connection.release();
        if (err) {
          console.error(err);
        } else {
          res.redirect("/course");
        }
      }
    );
  });
});

/**
 * 강의/강사등록 > 강의수정
 */
router.put("/", util.isAuthenticated, CourseService.update);
router.post("/modify", util.isAuthenticated, (req, res, next) => {
  const {
    course_id: courseId,
    course_name: courseName,
    course_desc: courseDescription,
    teacher_name: teacherName
  } = req.body;
  const adminId = req.user.admin_id;

  pool.getConnection((err, connection) => {
    if (err) throw err;
    connection.query(
      QUERY.COURSE.UpdateCourse,
      [
        courseName,
        teacherName,
        courseDescription,
        adminId,
        new Date(),
        courseId
      ],
      (err, rows) => {
        connection.release();
        if (err) {
          console.error(err);
        } else {
          res.redirect("/course/details?id=" + courseId);
        }
      }
    );
  });
});

/** 강의 비활성화 */
router.delete("/deactivate", util.isAuthenticated, (req, res, next) => {
  CourseService.deactivateById(req.query.id, (err, data) => {
    if (err) {
      return res.json({
        success: false,
        msg: err
      });
    }
    return res.json({
      success: true
    });
  });
});

/**
 * 강의/강사등록 상세페이지 > 강사등록
 */
router.post("/create/teacher", util.isAuthenticated, (req, res, next) => {
  const _name = req.body.teacher.trim();
  const _desc = req.body.teacher_desc.trim();

  pool.getConnection((err, connection) => {
    if (err) throw err;
    connection.query(
      QUERY.COURSE.CreateTeacher,
      [_name, _desc, req.user.admin_id],
      (err, rows) => {
        connection.release();
        if (err) {
          console.error(err);
        } else {
          res.redirect("/course");
        }
      }
    );
  });
});

/** 교육과정 비활성화 */
router.delete("/teacher", util.isAuthenticated, (req, res, next) => {
  CourseService.deactivateTeacherById(req.query.id, (err, data) => {
    if (err) {
      return res.json({
        success: false,
        msg: err
      });
    }
    return res.json({
      success: true
    });
  });
});

/**
 * 강의/강사등록 상세페이지 > 강사수정
 */
router.post("/modify/teacher", util.isAuthenticated, (req, res, next) => {
  const _id = req.body.id;
  const _name = req.body.teacher.trim();
  const _desc = req.body.teacher_desc.trim();

  pool.getConnection((err, connection) => {
    if (err) throw err;
    connection.query(
      QUERY.COURSE.UpdateTeacher,
      [_name, _desc, _id],
      (err, rows) => {
        connection.release();
        if (err) {
          console.error(err);
        } else {
          res.redirect("/course");
        }
      }
    );
  });
});

/**
 * 강의/강사등록 상세페이지 > 등록된 비디오 보기
 */
router.get(
  "/video",
  util.isAuthenticated,
  util.getLogoInfo,
  (req, res, next) => {
    const { id: videoId } = req.query;
    pool.getConnection((err, connection) => {
      if (err) throw err;
      connection.query(
        QUERY.COURSE.GetVideoDataById,
        [videoId],
        (err, results) => {
          connection.release();
          if (err) {
            console.error(err);
          } else {
            res.render("winpops/win_show_video", {
              current_path: "winpop",
              module_type: "show_video",
              title: "비디오 미리보기",
              loggedIn: req.user,
              video: results[0]
            });
          }
        }
      );
    });
  }
);

/**
 * 강의/강사등록 상세페이지 > 비디오 등록 팝업
 */
router.get(
  "/create/video",
  util.isAuthenticated,
  util.getLogoInfo,
  (req, res, next) => {
    const { course_id: courseId } = req.query;

    pool.getConnection((err, connection) => {
      if (err) throw err;
      connection.query(
        QUERY.VIDEO.SelectVideos,
        [req.user.fc_id],
        (err, rows) => {
          connection.release();
          if (err) {
            console.error(err);
          } else {
            return res.render("winpops/win_create_video", {
              current_path: "winpop",
              module_type: "create_video",
              title: "비디오 등록",
              loggedIn: req.user,
              course_id: courseId,
              videos: rows
            });
          }
        }
      );
    });
  }
);

/**
 * 비디오 등록하기
 */
router.post("/create/video", util.isAuthenticated, (req, res, next) => {
  console.log(req.body);
  const {
    course_id: courseId,
    video_name: videoName,
    video_provider: videoProvider,
    video_code: videoCode
  } = req.body;
  const adminId = req.user.admin_id;

  pool.getConnection((err, connection) => {
    if (err) throw err;
    connection.beginTransaction(() => {
      async.waterfall(
        [
          callback => {
            connection.query(
              QUERY.COURSE.CreateVideo,
              [videoName, videoProvider, videoCode, adminId],
              (err, result) => {
                if (err) {
                  console.error(err);
                  callback(err, null);
                } else {
                  callback(null, result);
                }
              }
            );
          },
          (ret, callback) => {
            let videoId = ret.insertId;
            connection.query(
              QUERY.COURSE.InsertIntoCourseListForVideo,
              [courseId, "VIDEO", videoName, videoId, courseId],
              (err, result) => {
                if (err) {
                  console.error(err);
                  callback(err, null);
                } else {
                  callback(null, result);
                }
              }
            );
          }
        ],
        (err, result) => {
          if (err) {
            connection.rollback();
            return res.json({
              success: false,
              msg: err
            });
          } else {
            if (result) {
              connection.commit();
              connection.release();
              return res.json({
                success: true
              });
            }
          }
        }
      );
    });
  });
});

/**
 * 강의/강사등록 상세페이지 > 비디오 수정 팝업
 */
router.get(
  "/modify/video",
  util.isAuthenticated,
  util.getLogoInfo,
  (req, res, next) => {
    const queryParams = req.query;

    pool.getConnection((err, connection) => {
      if (err) throw err;

      async.series(
        [
          callback => {
            connection.query(
              QUERY.COURSE.GetVideoDataById,
              [queryParams.video_id],
              (err, data) => {
                callback(err, data);
              }
            );
          },
          callback => {
            connection.query(
              QUERY.VIDEO.SelectVideos,
              [req.user.fc_id],
              (err, data) => {
                callback(err, data);
              }
            );
          }
        ],
        (err, results) => {
          connection.release();
          if (err) {
            console.error(err);
            throw new Error(err);
          } else {
            return res.render("winpops/win_modify_video", {
              current_path: "winpop",
              module_type: "modify_video",
              title: "비디오 수정",
              loggedIn: req.user,
              current_video: results[0][0],
              videos: results[1],
              course_id: queryParams.course_id,
              course_list_id: queryParams.course_list_id
            });
          }
        }
      );
    });
  }
);

/**
 * 강의/강사등록 상세페이지 > 비디오 수정
 */
router.post("/modify/video", util.isAuthenticated, (req, res, next) => {
  const _inputs = req.body;
  let _query = null;

  pool.getConnection((err, connection) => {
    if (err) throw err;
    connection.beginTransaction(err => {
      // 트렌젝션 오류 발생
      if (err) {
        res.json({
          success: false,
          msg: err
        });
      }
      async.series(
        [
          // 세션 수정
          callback => {
            _query = connection.query(
              QUERY.COURSE.UpdateSessionTitleById,
              [_inputs.video_name, _inputs.course_list_id],
              (err, data) => {
                // console.log(_query.sql);
                callback(err, data);
              }
            );
          },
          // 비디오 수정
          callback => {
            _query = connection.query(
              QUERY.COURSE.UpdateVideoById,
              [
                _inputs.video_name,
                _inputs.video_provider,
                _inputs.video_code,
                _inputs.video_id
              ],
              (err, data) => {
                // console.log(_query.sql);
                callback(err, data);
              }
            );
          }
        ],
        (err, results) => {
          if (err) {
            // 쿼리 오류
            return connection.rollback(() => {
              res.json({
                success: false,
                msg: err
              });
            });
          } else {
            connection.commit(err => {
              // 커밋 오류
              if (err) {
                return connection.rollback(() => {
                  res.json({
                    success: false,
                    msg: err
                  });
                });
              }
              connection.release();
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

/**
 * 퀴즈 보기 페이지를 제공한다.
 */
router.get(
  "/quiz",
  util.isAuthenticated,
  util.getLogoInfo,
  (req, res, next) => {
    var _inputs = req.query;

    pool.getConnection((err, connection) => {
      if (err) throw err;
      connection.query(
        QUERY.COURSE.GetQuizDataByGroupId,
        [_inputs.id],
        (err, data) => {
          connection.release();
          if (err) {
            // 쿼리 실패
            console.error(err);
          } else {
            let quizList = CourseService.makeQuizList(data);

            // 쿼리 성공
            res.render("winpops/win_show_quiz", {
              current_path: "winpop",
              module_type: "show_quiz",
              title: "퀴즈 미리보기",
              loggedIn: req.user,
              type: _inputs.type,
              quiz_title: _inputs.title,
              quiz: quizList
            });
          }
        }
      );
    });
  }
);

/**
 * 강의/강사등록 상세페이지 > 퀴즈/파이널테스트 등록 팝업
 */
router.get(
  "/create/quiz",
  util.isAuthenticated,
  util.getLogoInfo,
  (req, res, next) => {
    const { course_id: courseId } = req.query;

    res.render("winpops/win_create_quiz", {
      current_path: "winpop",
      module_type: "create_quiz",
      type: req.query.type,
      title: "퀴즈/파이널테스트 등록",
      loggedIn: req.user,
      course_id: courseId
    });
  }
);

/**
 * 강의세션을 등록한다.
 */
router.post("/quiz/courselist", util.isAuthenticated, (req, res, next) => {
  const inputs = req.body;

  pool.getConnection((err, connection) => {
    if (err) throw err;
    connection.query(
      QUERY.COURSE.InsertIntoCourseListForQuiz,
      [
        inputs.course_id,
        inputs.type,
        inputs.title,
        inputs.quiz_group_id,
        inputs.order
      ],
      (err, data) => {
        connection.release();
        if (err) {
          // console.log(err);
          throw err;
        }
        inputs.course_list_id = data.insertId;
        if (err) {
          return res.json({
            success: false,
            msg: err
          });
        } else {
          inputs.course_list_id = data.insertId;
          return res.json({
            success: true,
            inputs: inputs
          });
        }
      }
    );
  });
});

/**
 * 강의/강사등록 상세페이지 > 퀴즈 등록 팝업 > 퀴즈 그룹 등록
 * 진행순서
 * 1. 퀴즈 (quiz)를 등록.
 * 2. 퀴즈 그룹 (quiz_group)을 생생.
 * 3. 보기 (quiz_option)를 등록. (선택형/다답형)
 * @return quiz_id
 */
router.post("/quiz", util.isAuthenticated, (req, res, next) => {
  const inputs = req.body;

  pool.getConnection((err, connection) => {
    if (err) throw err;
    connection.beginTransaction(err => {
      if (err) {
        res.json({
          success: false,
          msg: err
        });
      }

      async.series(
        [
          // 퀴즈를 등록한다.
          callback => {
            if (inputs.quiz.options.length) {
              // 선택형, 다답형
              connection.query(
                QUERY.COURSE.CreateQuizWithOption,
                [
                  inputs.quiz.type,
                  inputs.quiz.quiz_type,
                  inputs.quiz.question,
                  inputs.quiz.option_group_id
                ],
                (err, data) => {
                  inputs.quiz.quiz_id = data.insertId;
                  callback(err, data);
                }
              );
            } else {
              // 단답형
              connection.query(
                QUERY.COURSE.CreateQuizNoOption,
                [
                  inputs.quiz.type,
                  inputs.quiz.quiz_type,
                  inputs.quiz.question,
                  inputs.quiz.answer_desc
                ],
                (err, data) => {
                  inputs.quiz.quiz_id = data.insertId;
                  callback(err, data);
                }
              );
            }
          },
          // 퀴즈 그룹을 생생한다.
          callback => {
            if (inputs.quiz.quiz_id) {
              connection.query(
                QUERY.COURSE.InsertOrUpdateQuizGroup,
                [
                  inputs.quiz_group_id,
                  inputs.quiz.quiz_id,
                  inputs.quiz.order,
                  inputs.quiz.order
                ],
                (err, data) => {
                  callback(err, data); // results[1]
                }
              );
            } else {
              callback(null, null);
            }
          },
          // 퀴즈 보기를 등록한다.
          callback => {
            if (inputs.quiz.options.length) {
              CourseService.InsertOrUpdateQuizOptions(
                connection,
                inputs.quiz.options,
                (err, data) => {
                  callback(err, data);
                }
              );
            } else {
              callback(null, null);
            }
          }
        ],
        (err, results) => {
          if (err) {
            // 쿼리 오류 발생
            return connection.rollback(() => {
              res.json({
                success: false,
                msg: err
              });
            });
          } else {
            connection.commit(err => {
              // 커밋 오류 발생
              if (err) {
                return connection.rollback(() => {
                  res.json({
                    success: false,
                    msg: err
                  });
                });
              }
              connection.release();
              // 커밋 성공
              res.json({
                success: true,
                inputs: inputs
              });
            });
          }
        }
      );
    });
  });
});

/**
 * 강의/강사등록 상세페이지 > 퀴즈 등록 팝업 > 퀴즈 그룹 등록
 *
 * 진행순서
 * 1. 퀴즈 (quiz)를 수정.
 * 2. 보기 (quiz_option)를 재등록. (선택형/다답형)
 */
router.put("/quiz", util.isAuthenticated, (req, res, next) => {
  const inputs = req.body;
  let _query = null;

  pool.getConnection((err, connection) => {
    if (err) throw err;
    connection.beginTransaction(err => {
      if (err) {
        res.json({
          success: false,
          msg: err
        });
      }

      async.series(
        [
          // 퀴즈를 수정한다.
          callback => {
            if (inputs.quiz.options.length) {
              // 선택형, 다답형
              _query = connection.query(
                QUERY.COURSE.UpdateQuizWithOption,
                [inputs.quiz.question, inputs.quiz.quiz_id],
                (err, data) => {
                  // console.log(_query.sql);
                  callback(err, data);
                }
              );
            } else {
              // 단답형
              _query = connection.query(
                QUERY.COURSE.UpdateQuizWithNoOption,
                [
                  inputs.quiz.question,
                  inputs.quiz.answer_desc,
                  inputs.quiz.quiz_id
                ],
                (err, data) => {
                  // console.log(_query.sql);
                  callback(err, data);
                }
              );
            }
          },
          // 퀴즈 그룹을 수정한다.
          callback => {
            if (inputs.quiz.quiz_id) {
              _query = connection.query(
                QUERY.COURSE.InsertOrUpdateQuizGroup,
                [
                  inputs.quiz_group_id,
                  inputs.quiz.quiz_id,
                  inputs.quiz.order,
                  inputs.quiz.order
                ],
                (err, data) => {
                  // console.log(_query.sql);
                  callback(err, data);
                }
              );
            } else {
              callback(null, null);
            }
          },
          // 퀴즈 보기를 수정한다.
          callback => {
            if (inputs.quiz.quiz_id) {
              CourseService.InsertOrUpdateQuizOptions(
                connection,
                inputs.quiz.options,
                (err, data) => {
                  callback(err, data);
                }
              );
            } else {
              callback(null, null);
            }
          }
        ],
        (err, results) => {
          if (err) {
            console.log(err);
            // 쿼리 오류 발생
            return connection.rollback(() => {
              res.json({
                success: false,
                msg: err
              });
            });
          } else {
            connection.commit(err => {
              // 커밋 오류 발생
              if (err) {
                return connection.rollback(() => {
                  res.json({
                    success: false,
                    msg: err
                  });
                });
              }
              connection.release();
              // 커밋 성공
              res.json({
                success: true,
                inputs: inputs
              });
            });
          }
        }
      );
    });
  });
});

/**
 * 퀴즈를 삭제한다.
 */
router.delete("/quiz", util.isAuthenticated, (req, res, next) => {
  const inputs = req.query;

  pool.getConnection((err, connection) => {
    if (err) throw err;
    connection.beginTransaction(err => {
      // 트렌젝션 오류 발생시 처리
      if (err) {
        res.json({
          success: false,
          msg: err
        });
      }

      async.series(
        [
          // 1.퀴즈 보기(quiz_option) 삭제
          callback => {
            connection.query(
              QUERY.COURSE.DeleteQuizOptionByOptionGroupId,
              [inputs.option_group_id],
              (err, data) => {
                // console.log(query.sql);
                callback(err, data);
              }
            );
          },
          // 2.퀴즈(quiz) 를 삭제한다.
          callback => {
            connection.query(
              QUERY.COURSE.DeleteQuizById,
              [inputs.quiz_id],
              (err, data) => {
                // console.log(query.sql);
                callback(err, data);
              }
            );
          }
          // 3.퀴즈 보기 그룹(quiz_group) 삭제 (CASCADE 제약으로 함께 삭제된다.)
        ],
        (err, results) => {
          if (err) {
            // 쿼리 오류
            return connection.rollback(() => {
              res.json({
                success: false,
                msg: err
              });
            });
          } else {
            connection.commit(err => {
              // 커밋 오류
              if (err) {
                return connection.rollback(() => {
                  res.json({
                    success: false,
                    msg: err
                  });
                });
              }
              connection.release();
              // 커밋 성공
              return res.json({
                success: true
              });
            });
          }
        }
      );
    });
  });
});

/**
 * 퀴즈/파이널테스트 수정페이지를 보여준다.
 * @req.query
 * course_id, course_list_id, type: QUIZ/FINAL, quiz_group_id
 */
router.get(
  "/modify/quiz",
  util.isAuthenticated,
  util.getLogoInfo,
  (req, res, next) => {
    const { course_list_id: courseListId } = req.query;

    pool.getConnection((err, connection) => {
      if (err) throw err;
      async.series(
        [
          callback => {
            connection.query(
              QUERY.COURSE.GetSessionById,
              [courseListId],
              (err, data) => {
                callback(err, data);
              }
            );
          }
        ],
        (err, results) => {
          connection.release();
          if (err) {
            console.error(err);
          } else {
            res.render("winpops/win_modify_quiz", {
              current_path: "winpop",
              module_type: "modify_quiz",
              type: req.query.type,
              title: "퀴즈/파이널테스트 수정",
              loggedIn: req.user,
              course_list: results[0][0]
            });
          }
        }
      );
    });
  }
);

/**
 * 퀴즈 보기를 개별삭제한다.
 */
router.delete("/quiz/option", util.isAuthenticated, (req, res, next) => {
  const inputs = req.query;
  let query = null;

  pool.getConnection((err, connection) => {
    if (err) throw err;
    connection.beginTransaction(err => {
      // 트렌젝션 오류 발생시 처리
      if (err) {
        res.json({
          success: false,
          msg: err
        });
      }

      async.series(
        [
          // 1.퀴즈 보기(quiz_option) 삭제
          callback => {
            query = connection.query(
              QUERY.COURSE.DeleteQuizOptionById,
              [inputs.option_id],
              (err, data) => {
                // console.log(query.sql);
                callback(err, data);
              }
            );
          }
        ],
        (err, results) => {
          if (err) {
            // 쿼리 오류
            return connection.rollback(() => {
              res.json({
                success: false,
                msg: err
              });
            });
          } else {
            connection.commit(err => {
              // 커밋 오류
              if (err) {
                return connection.rollback(() => {
                  res.json({
                    success: false,
                    msg: err
                  });
                });
              }
              connection.release();
              // 커밋 성공
              return res.json({
                success: true
              });
            });
          }
        }
      );
    });
  });
});

/**
 * 체크리스트 보기 페이지를 제공한다.
 */
router.get(
  "/checklist",
  util.isAuthenticated,
  util.getLogoInfo,
  (req, res, next) => {
    const { course_list_id: courseListId } = req.query;

    pool.getConnection((err, connection) => {
      if (err) throw err;
      connection.query(
        QUERY.COURSE.GetChecklistByCourseListId,
        [courseListId],
        (err, data) => {
          connection.release();
          if (err) {
            // 쿼리 실패
            console.error(err);
          } else {
            // 선택형, 다답형일 경우 보기를 배열로 변환한다.
            // console.log(data);
            for (let i = 0; i < data.length; i++) {
              if (data[i].item_type !== "write" && data[i].sample !== "") {
                // data[i].sample = JSON.parse('[' + data[i].sample + ']');
                data[i].sample = data[i].sample.split(",");
              }
            }
            // 쿼리 성공
            console.log(data[data.length - 1]);
            res.render("winpops/win_show_checklist", {
              current_path: "winpop",
              module_type: "show_checklist",
              title: "체크리스트 미리보기",
              loggedIn: req.user,
              checklist: data,
              sessionTitle: data[data.length - 1].title,
              sessionDesc: data[data.length - 1].desc
            });
          }
        }
      );
    });
  }
);

/**
 * 강의/강사등록 상세페이지 > 퀴즈/파이널테스트 등록 팝업
 */
router.get(
  "/create/checklist",
  util.isAuthenticated,
  util.getLogoInfo,
  (req, res, next) => {
    const { course_id: courseId } = req.query;
    res.render("winpops/win_create_checklist", {
      current_path: "winpop",
      module_type: "create_checklist",
      type: req.query.type,
      title: "체크리스트 등록",
      loggedIn: req.user,
      course_id: courseId
    });
  }
);

/**
 * 체크리스트를 저정한다.
 */
router.post("/checklist", util.isAuthenticated, (req, res, next) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    connection.beginTransaction(err => {
      if (err) throw err;
      CourseService.InsertOrUpdateChecklist(
        connection,
        req.body,
        (err, result) => {
          if (err) {
            connection.rollback();
            return res.json({
              success: false,
              msg: err
            });
          } else {
            if (result) {
              connection.commit();
              return res.send({
                success: true
              });
            }
          }
        }
      );
    });
  });
});

/**
 * 체크리스트 수정페이지를 보여준다.
 * @req.query
 * course_id, course_list_id, type: QUIZ/FINAL, quiz_group_id
 */
router.get(
  "/modify/checklist",
  util.isAuthenticated,
  util.getLogoInfo,
  (req, res, next) => {
    const {
      course_list_id: courseListId,
      checklist_group_id: groupId
    } = req.query;

    pool.getConnection((err, connection) => {
      if (err) throw err;
      async.series(
        [
          callback => {
            connection.query(
              QUERY.COURSE.GetSessionById,
              [courseListId],
              (err, data) => {
                callback(err, data);
              }
            );
          },
          callback => {
            connection.query(
              QUERY.COURSE.GetChecklistByGroupId,
              [groupId],
              (err, data) => {
                callback(err, data);
              }
            );
          }
        ],
        (err, results) => {
          connection.release();
          if (err) {
            console.error(err);
          } else {
            res.render("winpops/win_modify_checklist", {
              current_path: "winpop",
              module_type: "modify_checklist",
              type: req.query.type,
              title: "체크리스트 수정",
              loggedIn: req.user,
              course_list: results[0][0],
              checklists: results[1]
            });
          }
        }
      );
    });
  }
);

/**
 * 체크리스트를 삭제한다.
 */
router.delete("/checklist", util.isAuthenticated, (req, res, next) => {
  const { checklist_id: checklistId, checklist_group_id: groupId } = req.query;

  pool.getConnection((err, connection) => {
    if (err) throw err;
    connection.beginTransaction(err => {
      // 트렌젝션 오류 발생시 처리
      if (err) {
        res.json({
          success: false,
          msg: err
        });
      }

      async.series(
        [
          // todo log_session_progress, log_user_checklist 선 제거(FK 참조)
          callback => {
            connection.query(
              QUERY.COURSE.DeleteChecklistGroup,
              [groupId, checklistId],
              (err, data) => {
                callback(err, data);
              }
            );
          },
          callback => {
            connection.query(
              QUERY.COURSE.DeleteChecklist,
              [checklistId],
              (err, data) => {
                callback(err, data);
              }
            );
          }
        ],
        (err, results) => {
          console.log(err);
          if (err) {
            // 쿼리 오류
            return connection.rollback(() => {
              res.json({
                success: false,
                msg: err
              });
            });
          } else {
            connection.commit(err => {
              // 커밋 오류
              if (err) {
                return connection.rollback(() => {
                  res.json({
                    success: false,
                    msg: err
                  });
                });
              }
              // 커밋 성공
              connection.release();
              return res.json({
                success: true
              });
            });
          }
        }
      );
    });
  });
});

/**
 * 강의세션을 수정한다.
 */
router.put("/courselist", util.isAuthenticated, (req, res, next) => {
  const inputs = req.body;
  console.log(inputs);

  pool.getConnection((err, connection) => {
    if (err) throw err;
    connection.query(
      QUERY.COURSE.UpdateSession,
      [inputs.title, inputs.course_list_order, inputs.course_list_id],
      (err, data) => {
        connection.release();
        if (err) {
          return res.json({
            success: false,
            msg: err
          });
        } else {
          return res.json({
            success: true
          });
        }
      }
    );
  });
});

/**
 * 퀴즈를 삭제한다.
 */
router.delete("/courselist", util.isAuthenticated, (req, res, next) => {
  const _inputs = req.query;
  pool.getConnection((err, connection) => {
    if (err) throw err;
    connection.beginTransaction(err => {
      // 트렌젝션 오류 발생시 처리
      if (err) {
        res.json({
          success: false,
          msg: err
        });
      }

      async.series(
        [
          // 1. 세션정보 삭제
          callback => {
            connection.query(
              QUERY.COURSE.DeleteCourseListId,
              [_inputs.course_list_id],
              (err, data) => {
                callback(err, data);
              }
            );
          },
          // 2. 퀴즈 보기 삭제
          callback => {
            if (
              _inputs.course_list_type === "QUIZ" ||
              _inputs.course_list_type === "FINAL"
            ) {
              connection.query(
                QUERY.COURSE.DeleteQuizOptionByGroupId,
                [_inputs.quiz_group_id],
                (err, data) => {
                  callback(err, data);
                }
              );
            } else if (_inputs.course_list_type === "VIDEO") {
              callback(null, null);
            } else if (_inputs.course_list_type === "CHECKLIST") {
              callback(null, null);
            }
          },
          // 3.퀴즈/비디오 를 삭제한다.
          callback => {
            if (
              _inputs.course_list_type === "QUIZ" ||
              _inputs.course_list_type === "FINAL"
            ) {
              connection.query(
                QUERY.COURSE.DeleteQuizByGroupId,
                [_inputs.quiz_group_id],
                (err, data) => {
                  callback(err, data);
                }
              );
            } else if (_inputs.course_list_type === "VIDEO") {
              connection.query(
                QUERY.COURSE.DeleteVideoById,
                [_inputs.video_id],
                (err, data) => {
                  callback(err, data);
                }
              );
            } else if (_inputs.course_list_type === "CHECKLIST") {
              connection.query(
                QUERY.COURSE.DeleteChecklistByGroupId,
                [_inputs.checklist_group_id],
                (err, data) => {
                  callback(err, data);
                }
              );
            }
          }
          // 4.퀴즈 보기 그룹(quiz_group) 삭제 (CASCADE 제약으로 함께 삭제된다.)
          // (callback) => {
          //     var query = connection.query(QUERY.COURSE.DeleteQuizGroupByGroupId, [inputs.quiz_group_id], (err, data) => {
          //         console.log(query.sql);
          //         callback(err, data);
          //     });
          // }
        ],
        (err, results) => {
          if (err) {
            console.log(err);
            // 쿼리 오류
            return connection.rollback(() => {
              res.json({
                success: false,
                msg: err
              });
            });
          } else {
            connection.commit(err => {
              // 커밋 오류
              if (err) {
                return connection.rollback(() => {
                  res.json({
                    success: false,
                    msg: err
                  });
                });
              }
              // 커밋 성공
              connection.release();
              return res.json({
                success: true
              });
            });
          }
        }
      );
    });
  });
});

router.get("/:id", util.isAuthenticated, (req, res, next) => {
  return res.send(req.data);
});

module.exports = router;
