var express = require('express');
var router = express.Router();
var mysql_dbc = require('../commons/db_conn')();
var connection = mysql_dbc.init();
var QUERY = require('../database/query');
var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
};
require('../commons/helpers');
const async = require('async');

router.get('/', isAuthenticated, function (req, res) {

  async.series(
    [
      function (callback) {
        connection.query(QUERY.COURSE.GetCourseList,
          [req.user.fc_id], function (err, rows) {
            if(err){
              console.error(err);
              callback(err, null);
            }else{
              callback(null, rows);
            }
          });
      },
      function (callback){
        connection.query(QUERY.COURSE.GetTeacherList,
          [req.user.fc_id],
          function (err, rows) {
            if(err){
              console.error(err);
              callback(err, null);
            }else{
              callback(null, rows);
            }
          });
      }
    ],
    function (err, result){
      if(err){
        console.error(err);
      }else{
        res.render('course', {
          current_path: 'Course',
          title: PROJ_TITLE + 'Course',
          loggedIn: req.user,
          list : result[0],
          teacher_list : result[1]
        });
      }
  });
});

router.get('/details', isAuthenticated, function (req, res) {
  var _id = req.query.id;

  async.series(
    [
      function(callback){
        connection.query(QUERY.COURSE.GetCourseListById,
          [req.user.fc_id, _id], function (err, rows) {
            if(err){
              callback(err, null);
              // todo 쿼리에 문제가 일어난 것이므로 500 페이지로 이동시킨다.
            }else{
              callback(null, rows);
            }
          });
      },
      function (callback) {
        connection.query(QUERY.COURSE.GetStarRatingByCourseId,
          [_id],
          function (err, rows) {
            if(err){
              console.error(err);
              callback(err, null);
            }else{
              if(rows.length === 0 || rows === null){
                callback(null, [{course_id : _id ,rate : 0}]);
              }else{
                callback(null, rows);
              }
            }
        });
      },
      function (callback) {
        connection.query(QUERY.COURSE.GetSessionListByCourseId,
          [_id],
          function (err, rows) {
            if(err){
              console.error(err);
              callback(err, null);
            }else{
              callback(null, rows);
            }
        });
      },
      function (callback) {
        connection.query(QUERY.COURSE.GetTeacherInfoByCourseId,
          [_id],
          function (err, rows) {
            if(err){
              console.error(err);
              callback(err, null);
            }else{
              callback(null, rows);
            }
        });
      },
      function (callback){
        connection.query(QUERY.COURSE.GetTeacherList,
          [req.user.fc_id],
          function (err, rows) {
            if(err){
              console.error(err);
              callback(err, null);
            }else{
              callback(null, rows);
            }
          });
      }
    ],
    function (err, result) {
      if(err){
        console.error(err);
      }else{

        console.log(result[1]);

        res.render('course_details', {
          current_path: 'CourseDetails',
          title: PROJ_TITLE + 'Course Details',
          loggedIn: req.user,
          list : result[0],
          //rating: result[1][0].rate,
          rating: result[1],
          session_list: result[2],
          teacher_info : result[3],
          teacher_list : result[4],
	        course_id : _id
        });
      }
  });
});


router.post('/create/teacher', isAuthenticated, function (req, res){
  var _name = req.body.teacher.trim();
  var _desc = req.body.teacher_desc.trim();

  connection.query(QUERY.COURSE.CreateTeacher,
    [_name, _desc, req.user.admin_id],
    function (err, rows) {
      if(err){
        console.error(err);
      }else{
        res.redirect('/course');
      }
  });
});


router.post('/register', isAuthenticated, function (req, res) {
  var course_name = req.body.course_name.trim();
  var course_desc = req.body.course_desc.trim();
  var teacher = req.body.teacher_id.trim();
  var admin_id = req.user.admin_id;

  connection.query(QUERY.COURSE.CreateCourse,
    [
      course_name,
      teacher,
      course_desc,
      admin_id
    ],
    function (err, rows) {
      if(err){
        console.error(err);
      }else{
        res.redirect('/course');
      }
  });
});

router.post('/modify', isAuthenticated, function (req, res) {
  var _course_id = req.body.course_id.trim();
  var _course_name = req.body.course_name.trim();
  var _course_desc = req.body.course_desc.trim();
  var _teacher_id = req.body.teacher_id.trim();

  connection.query(QUERY.COURSE.UpdateCourse,
    [
      _course_name,
      _teacher_id,
      _course_desc,
      req.user.admin_id,
      new Date(),
      _course_id
    ],
    function (err, rows) {
      if(err){
        console.error(err);
      }else{
        res.redirect('/course/details?id=' + _course_id);
      }
  });
});


/**
 * 등록된 비디오 보기
 */
router.get('/video', isAuthenticated, function (req, res) {
  var _video_id = req.query.id;

	connection.query(QUERY.COURSE.GetVideoDataById,
		[_video_id],
		function (err, rows) {
			if(err){
				console.error(err);
			}else{

				console.info(rows);

				res.render('winpops/win_video', {
					current_path: 'winpop',
					title: PROJ_TITLE + 'Video',
					loggedIn: req.user,
					video : rows
				});
			}
	});
});

var CourseService = require('../service/CourseService');
router.get('/quiz', isAuthenticated, function (req, res) {
	var _quiz_group_id = req.query.id;
	var _title = req.query.title;
	var _type = req.query.type;

	connection.query(QUERY.COURSE.GetQuizDataByGroupId,
		[_quiz_group_id],
		function (err, rows) {
			if(err){
				console.error(err);
			}else{

				// console.info(rows);

				const _quiz = CourseService.makeQuizList(rows);

				res.render('winpops/win_quiz', {
					current_path: 'winpop',
					title: PROJ_TITLE + 'Quiz',
					loggedIn: req.user,
					quiz_title : _title,
					quiz : _quiz,
					type : _type
				});
			}
		});
});


router.get('/create/video', isAuthenticated, function (req, res) {
	var _course_id = req.query.course_id;

	res.render('winpops/win_create_video', {
		current_path: 'winpop',
		title: PROJ_TITLE + 'Register Video',
		loggedIn: req.user,
		course_id: _course_id
	});
});


// Interface for type in course list table
const COURSE_LIST = {
	VIDEO : 'VIDEO',
	QUIZ : 'QUIZ',
	FINAL : 'FINAL'
};

/**
 * 비디오 등록하기
 */
router.post('/create/video', isAuthenticated, function(req, res){

	/**
	 * video table에 name, type, url, admin을 먼저 입력하고
	 * 리턴받은 video_id를 가지고
	 * course_list 테이블에
	 * course_id, type(VIDEO), title(=name), quiz_group_id(null), video_id, order는 기본값
	 * 으로 설정하고 트랜잭션을 걸어서 처리한다.
	 *
	 */
	var _course_id = req.body.course_id.trim();
	var _video_name = req.body.video_name.trim();
	var _video_provider = req.body.video_provider.trim();
	var _video_code = req.body.video_code.trim();
	var _admin_id = req.user.admin_id;

	connection.beginTransaction(function () {
		async.waterfall(
			[
				function(callback){
					connection.query(QUERY.COURSE.CreateVideo,
						[
							_video_name,
							_video_provider,
							_video_code,
							_admin_id
						],
						function(err, result){
							if(err){
								console.error(err);
								callback(err, null);
							}else{
								callback(null, result);
							}
					});
				},

				function (ret, callback){
					var _video_id = ret.insertId;
					connection.query(QUERY.COURSE.InsertIntoCourseListForVideo,
						[
							_course_id,
							COURSE_LIST.VIDEO,
							_video_name,
							_video_id
						],
						function (err, result){
							if(err){
								console.error(err);
								callback(err, null);
							}else{
								callback(null, result);
							}
					});
				}
			],
			function (err, result){
				if(err){
					connection.rollback();
				}else{
					if(result){
						//console.info(result);
						connection.commit();
						// todo 팝업을 닫고 parent창을 리프레시를 해야 한다 그럼 어떻게 처리해야 하는가? ajax밖에 없겠군...
						res.redirect('/course/details?id=' + _course_id);
					}
				}

				connection.rollback();
		});
	});
});

module.exports = router;