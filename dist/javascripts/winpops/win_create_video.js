"use strict";requirejs(["common","Vimeo"],function(e,r){function o(){var e=$("#video-title"),r=$("#video-code");return e.val()?!!r.val()||(alert("비디오 코드를 입력하세요."),r.focus(),!1):(alert("비디오 강좌명을 입력하세요."),e.focus(),!1)}function i(){var e=$("#video-code").val(),r=$("#video-provider").val(),o=$("#video-player");if(!e)return!1;switch(r){case"YOUTUBE":o.html('<iframe width="100%" height="600" src="https://www.youtube.com/embed/'+e+'"frameborder="0" allowfullscreen></iframe>');break;case"VIMEO":o.html('<iframe src="https://player.vimeo.com/video/'+e+'"?title=0&byline=0&portrait=0" width="100%" height="600" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>')}}var t=$("#regist-video"),a=$("#play-video"),n=!0;$("#video-code").bind("keypress",function(e){var r=e.which||e.keyCode;13===r&&i()}),a.bind("click",function(e){i()}),t.bind("click",function(e){if(e.preventDefault(),!o())return!1;if(!confirm("저장하시겠습니까?"))return!1;var r=$("form").serialize();$.ajax({url:$("form").attr("action"),type:"POST",data:r,contentType:"application/x-www-form-urlencoded; charset=UTF-8",dataType:"html",success:function(e){alert("비디오를 저장하였습니다."),window.parent.opener.location.reload(),n=!1,window.close()}})}),window.onbeforeunload=function(e){if(n)return confirm("진행중인 작업이 모두 사라집니다. 계속하시겠습니까?")}});