"use strict";window.requirejs(["common"],function(i){function t(i){window.axios.delete("/course/courselist",{params:i}).then(function(i){i.data.success?(window.alert("세션을 삭제하였습니다."),window.location.reload()):window.alert("진행한 이력이 있어 세션을 삭제하지 못했습니다. 관리자에게 문의해주시기 바랍니다.")}).catch(function(i){console.log(i)})}function e(i){return window.axios({method:"put",url:"/course/courselist",data:{title:i.children().children("a").data("title"),course_list_id:i.children().children("a").data("id"),course_list_order:i.index()}})}function o(){for(var i=[],t=window.$(".session-list"),o=0;o<t.length;o++)i.push(e(window.$(t[o])));window.axios.all(i).then(function(i){i.forEach(function(i){})})}var n="scrollbars=yes, toolbar=no, location=no, status=no, menubar=no, resizable=yes, width=1040, height=760, left=0, top=0",d=window.$(".btn-watch-video"),a=window.$(".btn-solve-quiz"),c=window.$(".btn-preview-checklist"),r=window.$(".btn-create-video"),s=window.$(".btn-create-quiz"),u=window.$(".btn-create-final"),w=window.$(".btn-create-checklist"),l=window.$(".btn-delete-session"),p=window.$(".btn-modify-session"),h=window.$("#btnDeleteCourse");window.$(function(){window.$(".course-session").sortable({placeholder:"sort-highlight",handle:".handle",forcePlaceholderSize:!0,zIndex:999999,start:function(i,t){window.$(this).attr("data-previndex",t.item.index())},update:function(i,t){window.$(this).removeAttr("data-previndex"),o()}})}),c.bind("click",function(t){t.preventDefault();var e=window.$(this).parent("span").data("course-list-id");i.createWindowPopup("/course/checklist?course_list_id="+e,"Checklist",n)}),d.bind("click",function(t){t.preventDefault();var e=window.$(this).attr("data-video-id");i.createWindowPopup("/course/video?id="+e,"Video",n)}),h.bind("click",function(){if(!window.confirm("삭제 시 되돌릴 수 없습니다. 정말 삭제하시겠습니까?"))return!1;var i={course_id:window.$(this).data("course-id")};window.axios.delete("/course/deactivate",{params:i}).then(function(i){i.data.success?(window.alert("강의를 삭제하였습니다."),window.location.href="/course"):window.alert("강의를 삭제하였습니다.")}).catch(function(i){console.log(i)})}),r.bind("click",function(t){t.preventDefault();var e=window.$(this).attr("data-course-id");i.createWindowPopup("/course/create/video?course_id="+e,"Video",n)}),a.bind("click",function(t){t.preventDefault();var e=window.$(this).attr("data-quiz-group"),o=window.$(this).attr("data-title"),d=window.$(this).attr("data-type");i.createWindowPopup("/course/quiz?id="+e+"&title="+o+"&type="+d,"Quiz",n)}),s.bind("click",function(t){t.preventDefault();var e=window.$(this).attr("data-course-id");i.createWindowPopup("/course/create/quiz?course_id="+e+"&type=QUIZ","Quiz",n)}),u.bind("click",function(t){t.preventDefault();var e=window.$(this).attr("data-course-id");i.createWindowPopup("/course/create/quiz?course_id="+e+"&type=FINAL","Final",n)}),w.bind("click",function(t){t.preventDefault();var e=window.$(this).attr("data-course-id");i.createWindowPopup("/course/create/checklist?course_id="+e+"&type=CHECK","Checklist",n)}),l.bind("click",function(i){if(i.preventDefault(),!window.confirm("삭제 시 되돌릴 수 없습니다. 정말 삭제하시겠습니까?"))return!1;var e={};switch(e.course_list_id=window.$(this).parent("span").data("course-list-id"),e.course_list_type=window.$(this).parent("span").data("type"),window.$(this).parent("span").data("type")){case"QUIZ":case"FINAL":e.quiz_group_id=window.$(this).data("quiz-group");break;case"VIDEO":e.video_id=window.$(this).data("video-id");break;case"CHECKLIST":e.checklist_group_id=window.$(this).data("checklist-group")}t(e)}),p.bind("click",function(t){t.preventDefault();var e=window.$(this).parent("span").data("course-id"),o=window.$(this).parent("span").data("course-list-id"),d=window.$(this).data("video-id"),a=window.$(this).data("quiz-group"),c=window.$(this).data("checklist-group"),r=window.$(this).parent("span").data("type");"VIDEO"===r?i.createWindowPopup("/course/modify/video?course_id="+e+"&course_list_id="+o+"&video_id="+d,"Video",n):"QUIZ"===r||"FINAL"===r?i.createWindowPopup("/course/modify/quiz?course_id="+e+"&course_list_id="+o+"&type="+r+"&quiz_group_id="+a,"Quiz",n):"CHECKLIST"===r&&i.createWindowPopup("/course/modify/checklist?course_id="+e+"&course_list_id="+o+"&type="+r+"&checklist_group_id="+c,"Checklist",n)})});
//# sourceMappingURL=../maps/course_details.js.map
