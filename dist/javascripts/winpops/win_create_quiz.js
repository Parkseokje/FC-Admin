"use strict";window.requirejs(["common","quiz_service"],function(i){function n(){return window.axios.get("/api/v1/course/group/id/create")}function e(){var i=window.$("input[name=course_id]").val();return window.axios.get("/course/sessioncount",{params:{id:i}})}var t=require("quiz_service");window.$.widget.bridge("uibutton",window.$.ui.button);var o=window.$("#btn-add-quiz-a"),d=window.$("#btn-add-quiz-b"),a=window.$("#btn-add-quiz-c"),r=window.$("#regist-quiz"),u=window.$("#createQuiz"),w=document.getElementById("quiz-container");window.$(function(){window.axios.all([n(),e()]).then(window.axios.spread(function(i,n){var e={root_wrapper:u,wrapper:w},o={course_id:window.$("input[name=course_id]").val(),course_list_id:null,quiz_group_id:i.data.id,quiz_list:null,type:u.data("type"),title:window.$("#title").val(),session_count:n.data.session_count};t=new t(e,o,function(i){window.alert("퀴즈를 등록하였습니다."),window.parent.opener.location.reload(),window.close()})}))}),window.$(".connectedSortable").sortable({placeholder:"sort-highlight",connectWith:".connectedSortable",handle:".box-header",forcePlaceholderSize:!0,zIndex:999999,start:function(i,n){window.$(this).attr("data-previndex",n.item.index())},update:function(i,n){var e=n.item.index(),o=window.$(this).attr("data-previndex");window.$(this).removeAttr("data-previndex"),t.moveQuizIndexes(o,e)}}),o.bind("click",function(){t.addQuizSingleAnswer()}),d.bind("click",function(){t.addQuizMultiOptionWithOneAnswer()}),a.bind("click",function(){t.addQuizMultiOptionWithMultiAnswer()}),r.bind("click",function(){t.saveSessionAndQuiz()})});
//# sourceMappingURL=../../maps/winpops/win_create_quiz.js.map
