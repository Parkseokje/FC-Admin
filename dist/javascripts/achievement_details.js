"use strict";window.requirejs(["common"],function(i){window.$(function(){i.initDataTable(window.$("#table-personal-point-rank"),{order:[[0,"asc"]]});window.axios.get("/achievement/checklist",{params:{edu_id:window.$("#checklist_container").data("edu-id")}}).then(function(t){if(null!==t.data.checklists)for(var n=0;n<t.data.checklists.length;n++)window.$("#checklist_container").append('\n      <div class="col-lg-12">\n        <div class="box">\n          <div class="box-header with-border">\n            <h3 class="box-title checklist-title">체크리스트</h3>\n            <div class="box-tools">\n              <div class="pull-right">\n              </div>\n            </div>\n          </div>\n          <div class="box-body table-responsive">\n            <table class="table display nowrap no-margin table-bordered table-striped checklist" width="100%">\n            </table>\n          </div>\n        </div>\n      </div>\n    '),i.initDataTable(window.$(".checklist").last(),{data:t.data.checklists[n].rows,columns:t.data.checklists[n].columns,scrollX:!0}),window.$(".checklist-title").last().html("체크리스트 : <b>"+t.data.checklists[n].checklist_title+"</b>")}).catch(function(i){console.error(i)})})});
//# sourceMappingURL=../maps/achievement_details.js.map
