const CODE_RUN_TIMEOUT = 50000;
$(function () {
    let IndicatorCtr = new IndCtrl('list_menu', 'editor', 'worker.js');
    $('#btn_new_indicator').on('click', IndicatorCtr.addNewIndicator.bind(IndicatorCtr));
    $('#trash-btn').on('click', IndicatorCtr.trashIndicator.bind(IndicatorCtr));
    $('#btn_editor_run').on('click', IndicatorCtr.saveIndicator.bind(IndicatorCtr));
});
