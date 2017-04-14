
'use strict';

window.requirejs([ 'common' ],
(Util) => {
  window.$(() => {
    Util.initDataTable(window.$('#table-personal-point-rank'), {
      'order': [[ 0, 'asc' ]]
    });

    let template = `
      <div class="col-lg-12">
        <div class="box">
          <div class="box-header with-border">
            <h3 class="box-title checklist-title">체크리스트</h3>
            <div class="box-tools">
              <div class="pull-right">
              </div>
            </div>
          </div>
          <div class="box-body table-responsive">
            <table class="table no-margin table-bordered table-striped checklist" width="100%">
            </table>
          </div>
        </div>
      </div>
    `;

    window.axios.get('/achievement/checklist', {
      params: {
        edu_id: 39
      }
    })
    .then((response) => {
      for (let i = 0; i < response.data.checklists.length; i++) {
        window.$('#checklist_container').append(template);
        Util.initDataTable(window.$('.checklist').last(), {
          data: response.data.checklists[i].rows,
          columns: response.data.checklists[i].columns
        });
        window.$('.checklist-title').last().html('체크리스트 : ' + '<b>' + response.data.checklists[i].checklist_title + '</b>');
      }
    })
    .catch((error) => {
      console.error(error);
    });
  });
});
