"use strict";window.requirejs(["common","nplayer_conf"],function(n){function i(n){window.open("/api/v1/aqua","AquaNPlayer","left=0, top=0, width=900, height=600, menubar=no, directories=no, resizable=yes, status=no, scrollbars=no").focus()}function o(i,o){if(navigator.userAgent.match(/iPhone/i)||navigator.userAgent.match(/iPad/i))return void window.alert("PC에서만 재생이 가능합니다.");if(navigator.userAgent.match(/Android/i))return void window.alert("PC에서만 재생이 가능합니다.");if(navigator.userAgent.match(/Mac/i))return void window.alert("Windows OS에서만 재생이 가능합니다.");var e,r="";for(e in o)r+=e+"="+o[e]+"&";var a="nplayer://launch?"+r+"url="+encodeURIComponent(i);if("ActiveXObject"in window){window.open(i,"AquaNPlayer","left=0, top=0, width=900, height=600, menubar=no, directories=no, resizable=yes, status=no, scrollbars=no").focus()}else n.launchUri(a,function(){},function(){t()},function(){t()})}function t(){window.NPLAYER_SETUP_URL,confirm("동영상을 재생하기 위해서 재생플레이어를 설치하여야 합니다.\n설치하시겠습니까?")&&(window.location.href=window.NPLAYER_SETUP_URL)}function e(){var n;if(navigator.userAgent.match(/iPhone/i)||navigator.userAgent.match(/iPad/i))n="iOS";else{if(!navigator.userAgent.match(/Android/i))return void window.alert("모바일에서만 재생이 가능합니다.");n="Android"}window.location.href="mobile/player.asp?mtype="+n}var r=r||window.$;r("#launch").on("click",function(){o("http://cdntech.cdnetworks.co.kr/public/promotion/player.asp",{left:0,top:0,width:900,height:600,title:"AquaNPlayer",noresize:0})}),r("#launch_html5").on("click",function(){i("http://eng-media-02.cdngc.net/cdnlab/cs1/tsbox/CSS_1500k.mp4")}),r("#start_player").on("click",function(){e()})});
//# sourceMappingURL=../maps/aquaplayer_demo.js.map
