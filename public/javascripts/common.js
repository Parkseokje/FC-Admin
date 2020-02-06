/**
 * Created by yijaejun on 30/11/2016.
 */
"use strict";
define([
  "jquery",
  "jszip",
  "axios",
  "moment",
  "bootstrap",
  "bootstrap_datetimepicker",
  "jquery_ui",
  "datatables.net",
  "datatables.net-bs",
  // 'datatables.net-buttons',
  "../vendor/plugins/datatables.net-buttons-bs/js/buttons.bootstrap",
  "../vendor/plugins/datatables.net-buttons/js/buttons.html5",
  "../vendor/plugins/datatables.net-buttons/js/buttons.print",
  "datatables.net-responsive",
  "../vendor/plugins/datatables.net-responsive-bs/js/responsive.bootstrap",
  "select2",
  "adminLTE",
  "fastclick",
  "es6-promise",
  "tinymce"
], function($, jszip, axios, moment) {
  $.widget.bridge("uibutton", $.ui.button);

  // 전역으로 선언해야 동작되는 라이브러리들을 window 객체에 할당한다.
  window.JSZip = jszip;
  window.axios = axios;
  window.moment = moment;

  // https://github.com/stefanpenner/es6-promise 참고
  require("es6-promise").polyfill();

  // show modal to reset password
  $(".btn-modify-password").bind("click", function() {
    $("#frm_set_employee_password .user_id").val($(this).attr("data-user-id"));
    $("#frm_set_employee_password .user_name").val($(this).attr("data-user-name"));
    $("#frm_set_employee_password").attr("action", $(this).attr("data-url"));
  });

  tinymce.init({
    // selector: 'textarea',
    mode: "specific_textareas",
    editor_selector: "editor",
    theme: "simple",
    height: 200,
    theme: "modern",
    plugins: [
      "link image textcolor lists"
      // 'advlist autolink lists link image charmap print preview hr anchor pagebreak',
      // 'searchreplace wordcount visualblocks visualchars code fullscreen',
      // 'insertdatetime media nonbreaking save table contextmenu directionality',
      // 'emoticons template paste textcolor colorpicker textpattern imagetools codesample toc'
    ],
    toolbar1:
      "bold italic | alignleft aligncenter alignright alignjustify | bullist numlist | link image | forecolor backcolor",
    // toolbar1: 'undo redo | insert | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',
    // toolbar2: 'print preview media | forecolor backcolor emoticons | codesample',
    // image_advtab: true,
    menubar: false,
    statusbar: false,
    // templates: [
    //     { title: 'Test template 1', content: 'Test 1' },
    //     { title: 'Test template 2', content: 'Test 2' }
    // ],
    // content_css: [
    //     '//fonts.googleapis.com/css?family=Lato:300,300i,400,400i',
    //     '//www.tinymce.com/css/codepen.min.css'
    // ],
    language: "ko_KR"
  });

  var validation = {};

  return {
    // text editor 를 초기화 한다.
    initTextEditor: function(_selector, options) {
      tinymce.init({
        selector: _selector
      });
    },
    initDataTable: function(element, options) {
      var table = null,
        _options = {};

      if (options == null) {
        _options.order = [[0, ""]];
      } else {
        _options = options;
      }
      // _options.deferRender = false;
      _options.responsive = true;
      // _options.language = { "url": "https://cdn.datatables.net/plug-ins/1.10.13/i18n/Korean.json" };
      _options.language = {
        sEmptyTable: "데이터가 없습니다",
        sInfo: "_START_ - _END_ / _TOTAL_",
        sInfoEmpty: "0 - 0 / 0",
        sInfoFiltered: "(총 _MAX_ 개)",
        sInfoPostFix: "",
        sInfoThousands: ",",
        sLengthMenu: "페이지당 줄수: _MENU_",
        sLoadingRecords: "읽는중...",
        sProcessing: "처리중...",
        sSearch: "검색:",
        sZeroRecords: "검색 결과가 없습니다",
        oPaginate: {
          sFirst: "처음",
          sLast: "마지막",
          sNext: "다음",
          sPrevious: "이전"
        },
        oAria: {
          sSortAscending: ": 오름차순 정렬",
          sSortDescending: ": 내림차순 정렬"
        }
      };
      _options.dom =
        "<'row'<'col-sm-3'l><'col-sm-3 text-center'B><'col-sm-6'f>>" +
        "<'row'<'col-sm-12'tr>>" +
        "<'row'<'col-sm-5'i><'col-sm-7'p>>";

      if (_options.buttons == null) {
        _options.buttons = [
          {
            text: '<i class="fa fa-copy"></i> 복사',
            extend: "copy",
            className: "btn-sm btn-default"
          },
          {
            text: '<i class="fa fa-download"></i> 엑셀',
            extend: "excel",
            className: "btn-sm btn-default"
          }
        ];
      }

      table = element.DataTable(_options);

      return table;
    },
    createWindowPopup: function(url, title, option) {
      window.open(url, title, option);
    }
  };
}); // end of func
