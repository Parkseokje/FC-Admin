"use strict";window.define(["common","nplayer","nplayer_ui","cdnproxy","nplayer_conf"],function(e){function n(e){o=this,o.extendOptions(e),o.init()}var t,i,o=null;return n.prototype={options:{},extend:function(e,n){for(var t in n)n.hasOwnProperty(t)&&(e[t]=n[t]);return e},extendOptions:function(e){this.options=this.extend({},this.options),this.extend(this.options,e)},init:function(){o.getEncodedParam()},initPlayer:function(){i=new window.NPlayer("video",{controlBox:"nplayer_control.html",visible:!1,mode:"html5"}),window.initNPlayerUI(i),i.bindEvent("Ready",function(){o.reportMessage("ready"),window.proxy_init(function(){window.setPlayerStart(!0),window.setNPlayer(i),window.mygentAuthCall(function(e){window.setMediaInfo(o.options.fileUrl,e);var n=window.getMediaURL(!1);i.open({URL:encodeURI(n)})},t)},window.indicateInstall,window.indicateUpdate)}),i.bindEvent("OpenStateChanged",function(e){switch(o.reportMessage("OpenStateChanged"),e){case window.NPlayer.OpenState.Opened:i.setVisible(!0),window.starthtml5State();break;case window.NPlayer.OpenState.Closed:window.Stophtml5State(window.NPlayer.OpenState.Closed)}}),i.bindEvent("PlayStateChanged",function(e){switch(o.reportMessage("PlayStateChanged"),e){case window.NPlayer.PlayState.Playing:i.setVisible(!0);break;case window.NPlayer.PlayState.Stopped:i.setVisible(!1);break;case window.NPlayer.PlayState.Paused:i.setVisible(!0)}}),i.bindEvent("GuardCallback",function(e,n){o.reportMessage("GuardCallback - "+e+" : "+n)}),i.bindEvent("Error",function(e){o.reportMessage("Error - "+e)})},getEncodedParam:function(){window.axios.get("/api/v1/player/encparam").then(function(e){t=e.data.encparam,o.reportMessage(t),o.initPlayer()}).catch(function(e){o.reportError(e)})},reportMessage:function(e){console.log("aquaservice : "+e)},reportError:function(e){console.log("aquaservice : "+e)}},n});
//# sourceMappingURL=../../maps/components/aquaplayer_service.js.map
