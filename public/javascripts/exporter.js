/* global _  */
$(function () {
    $('.export-btn').on('click', exportResponseCSV);
});


function exportResponseCSV(e){
    e.preventDefault();
    const $this = $(this);
    const url = $this.attr('url');
    window.open(url, '_self');
    $(this).blur();
}
