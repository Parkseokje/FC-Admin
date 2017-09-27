"use strict";window.define(["common","jquery.iframe-transport","jquery-ui/ui/widget","jquery.fileupload"],function(o){function t(o){n=this,n.extendOptions(o),n.init()}var n,e,a=a||window.$,i=i||window.axios;return t.prototype={options:{},extend:function(o,t){for(var n in t)t.hasOwnProperty(n)&&(o[n]=t[n]);return o},extendOptions:function(o){this.options=this.extend({},this.options),this.extend(this.options,o)},init:function(){n.getUploadInfo(),a("#cancel-button").attr("disabled",!0)},getUploadInfo:function(){i.get("/api/v1/fineuploader/token").then(function(o){var t=o.data.uploadInfo;t&&(n.options.uploadUrl=t.uploadUrl.replace("v4","cdnovp"),n.options.uploadCancelUrl=t.uploadCancelUrl,n.options.token=t.token,n.setJqueryFileUploader())})},cancelUpload:function(){i.post(n.options.uploadCancelUrl+"?token="+n.options.token,{token:n.options.token}).then(function(o){window.alert("업로드 취소"),a("#upload-button").attr("disabled",!1),a("#cancel-button").attr("disabled",!0),n.getUploadInfo()}).catch(function(o){console.log(o)})},setJqueryFileUploader:function(){a("#fileupload").attr("data-url",n.options.uploadUrl+"?token="+n.options.token),a("#fileupload").fileupload({dataType:"json",singleFileUploads:!0,autoUpload:!1,acceptFileTypes:/(\.|\/)(mp4|avi)$/i,formData:{token:n.options.token,folder:2004661,pkg:1006241,target_path:n.options.uploadFolder},replaceFileInput:!1,add:function(o,t){a("#upload-button").off("click").on("click",function(){a("#upload-button").attr("disabled",!0),a("#cancel-button").attr("disabled",!1),e=t.submit()})},done:function(o,t){var e=t.jqXHR.responseJSON;"None"===e.uploadInfo.errorInfo.errorCode?(window.alert("업로드 성공"),a("#fineUploader").modal("hide"),n.options.callback(t)):window.alert(e.uploadInfo.errorInfo.errorMessage),a("#upload-button").attr("disabled",!1),a("#cancel-button").attr("disabled",!0)},progressall:function(o,t){var n=parseInt(t.loaded/t.total*100,10);a("#progress-value").html(n+"%"),a("#progress .jquery-file-progress-bar").css("width",n+"%")}}),a("#fileupload").bind("fileuploadadd",function(o,t){a.each(t.files,function(o,t){a("#aqua-video-code").val("onm_"+t.name)}),a("#cancel-button").on("click",function(o){e.abort()})}),a("#fileupload").bind("fileuploadfail",function(o,t){"abort"===t.errorThrown&&n.cancelUpload()})}},t});
//# sourceMappingURL=../../maps/components/jquery_uploader_service.js.map
