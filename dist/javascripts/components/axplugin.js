"use strict";window.define([],function(){function n(n){return document.getElementById(n)}function e(){var e=n("AquaAxPlugin");console.log("AquaAxPlugin",e.object),console.log(e.checkAquaAxVersion(window.AX_VERSION)),e.object&&!0===e.checkAquaAxVersion(window.AX_VERSION)&&(clearInterval(t),window.location.reload())}var t=0;return{loadAquaAxPlugin:function(){if(console.log("hello"),window.$("html").append('<OBJECT CLASSID="clsid:81C08477-A103-4FDC-B7A6-953940EAD67F"  codebase="'+window.NPLAYER_SETUP_URL+"#version="+window.AX_VERSION+'" width="0" height="0" ID="AquaAxPlugin" ></OBJECT>'),void 0!==window.AquaAxPlugin.InitAuth)return console.log("plugin loaded"),!0;t=setInterval(e,1e3),console.log("plugin checking..",t)},setAquaAxPlugin:function(n,e){return void 0!==window.AquaAxPlugin.InitAuth&&(window.AquaAxPlugin.authParam=e,window.AquaAxPlugin.InitAuth(),window.AquaAxPlugin.mediaURL=n,window.AquaAxPlugin.OpenMedia(),!0)},setMegaSubtitle:function(n,e,t,i,o,u,a,l,r){window.player.setSubtitleFont(n,e),window.player.setSubtitleColor(t,i,o,u),window.player.setSubtitlePosition(a,l),window.player.setSubtitleText(r)},dupPlayerStop:function(){var n=window.NPLAYER_DUP_MSG;window.player.stop(),setTimeout(function(){window.alert(n)},200),this.isDup=!0},getPlayerDuration:function(){var n=window.player.getDuration();return parseInt(1e3*n)},getPlaybackRate:function(){var n=window.player.getCurrentPlaybackRate();return parseInt(1e3*n)},getCurrentPosition:function(){var n=window.player.getCurrentPlaybackTime();return parseInt(1e3*n)}}});
//# sourceMappingURL=../../maps/components/axplugin.js.map
