/**
 * Created by yijaejun on 30/11/2016.
 */
'use strict';
requirejs(
	[
		'jquery'
		,'axios'
		,'moment'
		// ,'excellentExport'
		,'bootstrap'
		// ,'jquery_datatable'
		// ,'bootstrap_datatable'
		// ,'select2'
		// ,'daterangepicker'
        ,'bootstrap_datetimepicker'
		,'jquery_ui'
		// ,'adminLTE'
		// ,'fastclick'
	//   ,'common'
	],
	function ($, axios) {

		// avoid to confliction between jquery tooltip and bootstrap tooltip
		$.widget.bridge('uibutton', $.ui.button);

		// todo 교육과정 생성하기를 눌렀을 경우 group_id를 발급받아서 input에 저장한다.
		// 선택한 강의에 대해서 강의 번호를 배열에 담아 놓고 서버로 전달한다
		// group_id를 통해서 선택한 강의를 테이블에 저장하고,
		// course 테이블에 교육명과 교육설명 등을 저정한다

		var btn_create_edu = $('.btn-create-edu');
		var btn_add_course = $('.btn-add-course-edu');
		var select_course_list = $('.select-course-list');
		var course_group_id = $('.course_group_id');
		var courseIdList = [];
		var _course_container = $('#draggablePanelList');
		var _submit = $('.btn-register-course-submit');

        $(function () {
            // $('input[name="daterange"]').daterangepicker();
            $('#start_dt').datetimepicker({
                
            });

            $('#end_dt').datetimepicker({
                
            });            
        });

		btn_create_edu.bind('click', function () {
			var _group_id = null;
			axios.get('/api/v1/course/group/id/create')
				.then(function (res) {
					// console.log(res.data.id);
					_group_id = res.data.id;
					course_group_id.val(_group_id);
				})
				.catch(function (err) {
					console.error(err);
				})
		});

		// 강의를 선택할 때마다 하단에 선택한 강의를 추가할 수 있도록 한다
		btn_add_course.bind('click', function () {
			var _text = select_course_list.find('option:selected').text().trim();
			var _id = select_course_list.find('option:selected').val().trim();
			var elem = '<li class="list-group-item" data-course-id="'+_id+'">';
			elem += '<div class="course">'+_text+'<a href="#" class="btn-delete-course" onclick="education.removeElement(this);"><i class="fa fa-remove text-red"></i></a></div>';
			elem += '</li>';

			if(!checkDuplicateCourseId(_id)){
				_course_container.append(elem);
				courseIdList.push(_id);
			}
		});

		// ref. http://www.bootply.com/dUQiGMggWO
		var panelList = $('#draggablePanelList');
		panelList.sortable({
			handle: '.course',
			update: function() {
				courseIdList = reCountCourseList();
			}
		});


		window.education = {
			removeElement : function (el) {
				$(el).parent().parent().remove();
				courseIdList = reCountCourseList();
				return false;
			}
		};

		// 추가한 강의중에 중복이 있는지 확인을 한다.
		function checkDuplicateCourseId(id){
			for(var i= 0,len=courseIdList.length;i<len;i++){
				if(courseIdList[i] === id){
					return true;
				}
			}
			return false;
		}

		// 강의 리스트를 다시 점검한다
		function reCountCourseList(){
			var _tmp = [];
			$('.list-group-item', panelList).each(function(index, elem) {
				var _id = $(elem).attr('data-course-id');
				_tmp.push(_id);
			});
			return _tmp;
		}

		var courseName = $('.course-name');
		var courseDesc = $('.course-desc');

		_submit.bind('click', function (e) {
			e.preventDefault();

			if(courseName.val() === ''){
				alert('강의명을 입력하세요.');
				courseName.focus();
				return;
			}

			if(courseDesc.val() === ''){
				alert('강의소개를 입력해주세요.');
				courseDesc.focus();
				return;
			}

			if(courseIdList.length <= 0){
				alert('강의를 추가하세요.');
				return;
			}

			// todo axios로 전송을 한다.
			//axios.post('/education/create/edu', {
			//		course_group_id : course_group_id.val(),
			//		course_name : courseName.val().trim(),
			//		course_desc : courseDesc.val().trim(),
			//		course_list : courseIdList
			//	})
			//	.then(function (res){
			//		console.log('client return');
			//		console.info(res);
			//	})
			//	.catch(function (err){
			//		console.error(err);
			//	});


			axios({
				method : 'post',
				url: '/education/create/edu',
				data : {
					course_group_id : course_group_id.val(),
					course_name : courseName.val().trim(),
					course_desc : courseDesc.val().trim(),
					course_list : courseIdList
				}
			}).then(function (res){
				if(res.data.success == true){
					//
				}else{
					alert('알 수 없는 오류가 발생했습니다. 잠시 후에 다시 시도해주세요.');
				}

				window.location.reload();

			});

		});
		//window.reCountCourseList = reCountCourseList;
		//window.courseIdList = courseIdList;

	}); // end of func