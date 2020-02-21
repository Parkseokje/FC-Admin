"use strict";

requirejs([
  "common",
  "Vimeo",
  // 'jqueryUploaderService'
  "jqueryFormUploaderService"
], function (Util, Vimeo, JqueryFormUploaderService) {
  var $ = $ || window.$;
  var $btnModifyVideo = $("#modify-video");
  var $btnUploadVideo = $("#uploadVideo");
  var $btnPlayVideo = $("#play-video");
  var $selectVideoProvider = $("#video-provider");
  var $setAquaPlayer = $(".aquaplayer-settings");
  var $setVimeoPlayer = $(".vimeo-settings");
  var $aquaPlayerFrame = $("#aquaplayer_frame");
  // datatable 설정
  var tableVideos = Util.initDataTable($("#table_add_video"), { buttons: [] });
  var $btnChangeVideo = $("#btnApplyVideo");
  var $fileUpload = $("#fileupload");

  $(function () {
    // 보안플레이어 영상 업로더 초기화
    var options = {
      uploadFolder: $("#upload_folder").val(),
      callback: function (data) {
        if (data.success) {
          // displayVideo();
        }
      }
    };

    JqueryFormUploaderService = new JqueryFormUploaderService(options);

    setVideoOptions();
    displayVideo();
  });

  // 보안 플레이어에서 파일 선택 시 파일명이 세션명으로 자동 등록된다.
  $fileUpload.change(function () {
    var fileName = $("#fileupload").get(0).files[0].name;
    $("#video-title").val(fileName.replace(/.[^.]+$/, ""));
  });

  $btnChangeVideo.bind("click", function (e) {
    e.preventDefault();

    var videoInfo = $("input:first:checked", tableVideos.rows({
      search: "applied"
    }).nodes()).data();

    if (videoInfo !== undefined) {
      if (window.confirm("적용하시겠습니까?")) {
        // 모달창 종료
        $("#addVideo").modal("hide");
        $("#aqua-video-code").val(videoInfo.url);
        $aquaPlayerFrame.attr("src", "/api/v1/aqua?os=" + Util.getOSName() + "&video_id=" + videoInfo.id);
      }
    } else {
      window.alert("비디오를 선택하세요.");
    }
  });

  $selectVideoProvider.on("change", function () {
    setVideoOptions();
  });

  function setVideoOptions () {
    var option = $selectVideoProvider.val();

    if (option === "VIMEO" || option === "YOUTUBE") {
      $setVimeoPlayer.removeClass("blind");
      $setAquaPlayer.addClass("blind");
      $(".video-preview").addClass("blind");
    } else if (option === "AQUA") {
      $setAquaPlayer.removeClass("blind");
      $setVimeoPlayer.addClass("blind");
      $(".video-preview").removeClass("blind");
    }
  }

  $btnUploadVideo.on("click", function () {
  });

  $("#video-code").bind("keypress", function (e) {
    var key = e.which || e.keyCode;
    if (key === 13) {
      displayVideo();
    }
  });

  $btnPlayVideo.bind("click", function (e) {
    displayVideo();
  });

  $btnModifyVideo.bind("click", function (e) {
    e.preventDefault();

    if (!validateForm()) { return false; }
    if (!window.confirm("저장하시겠습니까?")) { return false; }

    var videoProvider = $("#video-provider").val();
    var videoCode;

    if (videoProvider === "VIMEO" || videoProvider === "YOUTUBE") {
      videoCode = $("input[name='vimeo_video_code']").val();
    } else if (videoProvider === "AQUA") {
      videoCode = $("input[name='aqua_video_code']").val();
    }

    window.axios.post("/course/modify/video", {
      course_id: $("input[name='course_id']").val(),
      course_list_id: $(this).data("course-list-id"),
      video_name: $("input[name='video_name']").val(),
      video_provider: videoProvider,
      video_code: videoCode,
      video_id: $(this).data("video-id")
    })
      .then(function (response) {
        window.alert("비디오를 저장하였습니다.");
        window.parent.opener.winpop_listener(true);
        window.close();
      })
      .catch(function (error) {
        console.log(error);
        return false;
      });

    // legacy

    // var params = $('form').serializeArray();
    // params.push({
    //   name: 'course_list_id',
    //   value: $(this).data('course-list-id')
    // });
    // params.push({
    //   name: 'video_id',
    //   value: $(this).data('video-id')
    // });

    // // console.log(params);
    // // return false;

    // $.ajax({
    //   url: $('form').attr('action'),
    //   type: 'PUT',
    //   data: params,
    //   contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
    //   dataType: 'html',
    //   success: function (response) {
    //     alert('비디오를 저장하였습니다.');
    //     // window.parent.opener.location.reload(); // 부모폼을 reload 한다.
    //     window.parent.opener.winpop_listener(true);
    //     _confirm = false;
    //     window.close();
    //   }
    // });
  });

  /**
   * 폼 validate
   */
    /**
     * 폼 validate
     */
  function validateForm () {
    var videoTitle = $("#video-title");

    if (!videoTitle.val()) {
      window.alert("비디오 강좌명을 입력하세요.");
      videoTitle.focus();
      return false;
    }

    var videoProvider = $("#video-provider").val();
    var $videoCode;

    if (videoProvider === "VIMEO" || videoProvider === "YOUTUBE") {
      $videoCode = $("#vimeo-video-code");
    } else if (videoProvider === "AQUA") {
      $videoCode = $("#aqua-video-code");
    }

    if (!$videoCode.val()) {
      window.alert("비디오 코드를 입력하세요.");
      $videoCode.focus();
      return false;
    }

    return true;
  }

  /**
   * 비디오를 표시한다.
   */
  function displayVideo () {
    var videoProvider = $("#video-provider").val();
    var videoCode;
    var $videoPlayer;

    console.log(videoProvider);

    switch (videoProvider) {
    case "YOUTUBE":
      videoCode = $("#vimeo-video-code").val();
      $videoPlayer = $("#video-player");

      if (!videoCode) return false;

      $videoPlayer.html("<iframe width=\"100%\" height=\"600\" src=\"/api/v1/youtube?id=" + videoCode + "\"" +
                    "frameborder=\"0\" allowfullscreen></iframe>");
      break;

    case "VIMEO":
      videoCode = $("#vimeo-video-code").val();
      $videoPlayer = $("#video-player");

      if (!videoCode) return false;

      $videoPlayer.html("<iframe src=\"https://player.vimeo.com/video/" + videoCode + "\"?title=0&byline=0&portrait=0\" " +
          "width=\"100%\" height=\"600\" frameborder=\"0\" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>");
      break;

    case "AQUA":
      videoCode = $("#modify-video").data("video-id");
      $aquaPlayerFrame.attr("src", "/api/v1/aqua?os=" + Util.getOSName() + "&video_id=" + videoCode);
      break;

    default:
      break;
    }
  }

  /**
   * 윈도우 팝업창 종료 시 발생
   *
   */
  window.onbeforeunload = function (event) {
    if (_confirm) {
      return confirm("진행중인 작업이 모두 사라집니다. 계속하시겠습니까?");
    }
  };
});
