function pug_attr(t,e,n,r){if(!1===e||null==e||!e&&("class"===t||"style"===t))return"";if(!0===e)return" "+(r?t:t+'="'+t+'"');var f=typeof e;return"object"!==f&&"function"!==f||"function"!=typeof e.toJSON||(e=e.toJSON()),"string"==typeof e||(e=JSON.stringify(e),n||-1===e.indexOf('"'))?(n&&(e=pug_escape(e))," "+t+'="'+e+'"'):" "+t+"='"+e.replace(/'/g,"&#39;")+"'"}
function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_match_html=/["&<>]/;
function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}function signupslistTemplate(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {"views\u002Fsurvey\u002Ftemplates\u002FsignupsList.pug":"include ..\u002F..\u002Fpartials\u002Fsurvey\n\nblock content\n    +questionEvents(events, userEvents)\n","views\u002Fpartials\u002Fsurvey.pug":"mixin questionDisplay(question)\n    case question.type\n        when 'shorttext'\n            +questionShorttext(question)\n        when 'text'\n            +questionText(question)\n        when 'boolean'\n            +questionBoolean(question)\n        when 'scale'\n            +questionScale(question)\n        when 'dropdown'\n            +questionDropdown(question)\n        when 'events'\n            +questionEventsStub(question)\n\n\nmixin questionShorttext(question)\n    label.control-label(for=\"question-\" + question.id)=question.question\n    input.form-control(\n        type=\"text\"\n        name=`response[responses][q-${question.id}]`\n        value=getValue(question.id)\n        id='question-' + question.id,\n        required=question.required\n        disabled=response.complete\n        )\n    if question.description\n        .form-text=question.description\n\n    div.invalid-feedback Please choose a valid value for this item\n    \n\nmixin questionText(question)\n    label.control-label(for=\"question-\" + question.id)=question.question\n    if question.description\n        .form-text=question.description\n    textarea.form-control(\n        name=`response[responses][q-${question.id}]`\n        id='question-' + question.id\n        required=question.required\n        disabled=response.complete\n        rows=question.config && question.config.rows?question.config.rows:5\n    )\n        = getValue(question.id)\n\nmixin questionBoolean(question)\n    \u003C!-- Default checked --\u003E\n    .form-check.form-switch\n        input.form-check-input(\n            type=\"checkbox\"\n            name=`response[responses][q-${question.id}]`\n            checked=getValue(question.id)\n            id='question-' + question.id\n            disabled=response.complete\n            )\n        label.form-check-label(for=\"question-\" + question.id)=question.question\n        if question.description\n            .form-text=question.description\n\nmixin questionDropdown(question)\n    label.control-label(for=\"question-\" + question.id)=question.question\n    select.form-select.select2.question(\n        data-placeholder=question.config.placeholder\n        name=`response[responses][q-${question.id}]`\n        disabled=response.complete\n        required=question.required\n        )\n        option\n        each option, idx in question.config.options\n            option(value=idx selected=Number(getValue(question.id))===idx )= option\n\nmixin questionScale(question)\n    label.control-label(for=\"question-\" + question.id)=question.question\n    if question.description\n            .form-text=question.description\n\n    div(id=`question-${question.id}`)\n        if (!questionrequired)\n            .form-check.form-check-inline.mx-3.px-2.border-end\n                input.form-check-input(type=\"radio\" name=`response[responses][q-${question.id}]` value=-1 id=`question-${question.id}-nr` checked=getValue(question.id)===null || Number(getValue(question.id)) === -1 disabled=response.complete)\n                label.form-check-label(for=`question-${question.id}-nr`) No Response\n        if question.config && question.config.options\n            each option, idx in question.config.options\n                .form-check.form-check-inline.mx-2\n                    input.form-check-input(type=\"radio\" name=`response[responses][q-${question.id}]` value=idx id=`question-${question.id}-${idx}` checked=Number(getValue(question.id))===idx  disabled=response.complete)\n                    label.form-check-label(for=`question-${question.id}-${idx}`)= option\n\n        else\n            .form-check.form-check-inline.mx-2\n                input.form-check-input(type=\"radio\" name=`response[responses][q-${question.id}]` value=1 id=`question-${question.id}-1` checked=Number(getValue(question.id))===1  disabled=response.complete)\n                label.form-check-label(for=`question-${question.id}-1`) Strong Negative (1)\n            .form-check.form-check-inline.mx-2\n                input.form-check-input(type=\"radio\" name=`response[responses][q-${question.id}]` value=2 id=`question-${question.id}-2` checked=Number(getValue(question.id))===2  disabled=response.complete)\n                label.form-check-label(for=`question-${question.id}-2`) Negative (2)\n            .form-check.form-check-inline.mx-2\n                input.form-check-input(type=\"radio\" name=`response[responses][q-${question.id}]` value=3 id=`question-${question.id}-3` checked=Number(getValue(question.id))===3  disabled=response.complete)\n                label.form-check-label(for=`question-${question.id}-3`) Neutral (3)\n            .form-check.form-check-inline.mx-2\n                input.form-check-input(type=\"radio\" name=`response[responses][q-${question.id}]` value=4 id=`question-${question.id}-4` checked=Number(getValue(question.id))===4  disabled=response.complete)\n                label.form-check-label(for=`question-${question.id}-4`) Positive (4)\n            .form-check.form-check-inline.mx-2\n                input.form-check-input(type=\"radio\" name=`response[responses][q-${question.id}]` value=5 id=`question-${question.id}-5` checked=Number(getValue(question.id))===5 disabled=response.complete)\n                label.form-check-label(for=`question-${question.id}-5`) Strongly Positive (5)\n\nmixin questionEventsStub(question)\n    #questionEvents(style='display:none')\n    .col-sm-6.offset-sm-3.text-center#signupsLoading\n        .spinner-border.m-5(role=\"status\" style=\"width: 3rem; height: 3rem;\")\n            .visually-hidden Table is Loading\n\n\nmixin questionEvents()\n    .table-responsive\n        table.table.table-sm.table-striped\n            thead\n                th Category\n                th Event Name\n                th.text-end Actions\n            tbody\n                for userEvent in userEvents\n                    -\n                        const event = userEvent.event\n                        if (!event) { continue }\n                        const feedback = userEvent.feedback\n\n                        let hasFeedback = false;\n                        if (feedback){\n                            if (feedback.recommend && feedback.recommend !== -1){\n                                hasFeedback = true;\n                            } else if (feedback.gm && feedback.gm !== ''){\n                                hasFeedback = true;\n                            } else if (feedback.concom && feedback.concom !== ''){\n                                hasFeedback = true;\n                            }\n\n                        }\n                    tr\n                        td\n                            small= event.event_category.name\n                        td= event.title\n                            if hasFeedback\n                                .badge.text-bg-success.ms-2\n                                    i.fas.fa-check-circle.me-1\n                                    | Feedback Provided\n                        td.text-end\n                            button.btn.btn-sm.btn-outline-primary.feedback-edit(\n                                role='button'\n                                data-eventid=event.id\n                                disabled=disabled\n                            )\n                                i.fas.fa-edit.me-1.feedback-icon\n                                if hasFeedback\n                                    | Edit Feedback\n                                else\n                                    | Provide Feedback\n                            button.btn.btn-sm.btn-outline-danger.ms-1.feedback-remove(\n                                role='button'\n                                data-eventid= event.id\n                                data-toggle='tooltip'\n                                title=\"Remove from List\"\n                                disabled=disabled\n                            )\n                                i.fas.fa-trash.fa-fw.feedback-icon\n\n            tfoot\n                tr\n                    td(colspan=3)\n                        .input-group.my-2.eventPicker\n                            select.form-select.select2.event-select(data-placeholder='Select an event to add')\n                                option\n                                for event in events\n                                    option(value=event.id)= event.event_category.name + ': '+ event.title\n\n                            button.btn.btn-outline-success.feedback-add( type=\"button\")\n                                span.fa.fa-plus\n                                |  Add Event\n\nmixin surveyModal()\n    .modal.modal-fullscreen-lg-down.fade#surveyModal(role=\"dialog\" tabindex=\"-1\" aria-labelledby=\"popupModalLabel\" aria-hidden=\"true\" data-bs-backdrop=\"static\" data-bs-keyboard=\"false\")\n        .modal-dialog.modal-xl.modal-dialog-centered(role=\"document\")\n            .modal-content\n                .modal-header\n                    h5.modal-title\n                    button.btn-close#dismissPopupModal(type=\"button\", data-bs-dismiss=\"modal\" area-label=\"Close\")\n                .modal-body\n                .modal-footer\n                    button.btn.btn-secondary(type=\"button\", data-bs-dismiss=\"modal\") Cancel\n                    span.extra-buttons\n                    button.btn.btn-primary.save-btn(type=\"submit\") Save\n"};
;var locals_for_with = (locals || {});(function (Number, disabled, events, getValue, questionrequired, response, userEvents) {;pug_debug_line = 1;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";






























;pug_debug_line = 17;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_mixins["questionShorttext"] = pug_interp = function(question){
var block = (this && this.block), attributes = (this && this.attributes) || {};
;pug_debug_line = 18;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Clabel" + (" class=\"control-label\""+pug_attr("for", "question-" + question.id, true, false)) + "\u003E";
;pug_debug_line = 18;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = question.question) ? "" : pug_interp)) + "\u003C\u002Flabel\u003E";
;pug_debug_line = 19;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Cinput" + (" class=\"form-control\""+" type=\"text\""+pug_attr("name", `response[responses][q-${question.id}]`, true, false)+pug_attr("value", getValue(question.id), true, false)+pug_attr("id", 'question-' + question.id, true, false)+pug_attr("required", question.required, true, false)+pug_attr("disabled", response.complete, true, false)) + "\u002F\u003E";
;pug_debug_line = 27;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
if (question.description) {
;pug_debug_line = 28;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Cdiv class=\"form-text\"\u003E";
;pug_debug_line = 28;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = question.description) ? "" : pug_interp)) + "\u003C\u002Fdiv\u003E";
}
;pug_debug_line = 30;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Cdiv class=\"invalid-feedback\"\u003E";
;pug_debug_line = 30;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "Please choose a valid value for this item\u003C\u002Fdiv\u003E";
};
;pug_debug_line = 33;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_mixins["questionText"] = pug_interp = function(question){
var block = (this && this.block), attributes = (this && this.attributes) || {};
;pug_debug_line = 34;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Clabel" + (" class=\"control-label\""+pug_attr("for", "question-" + question.id, true, false)) + "\u003E";
;pug_debug_line = 34;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = question.question) ? "" : pug_interp)) + "\u003C\u002Flabel\u003E";
;pug_debug_line = 35;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
if (question.description) {
;pug_debug_line = 36;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Cdiv class=\"form-text\"\u003E";
;pug_debug_line = 36;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = question.description) ? "" : pug_interp)) + "\u003C\u002Fdiv\u003E";
}
;pug_debug_line = 37;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Ctextarea" + (" class=\"form-control\""+pug_attr("name", `response[responses][q-${question.id}]`, true, false)+pug_attr("id", 'question-' + question.id, true, false)+pug_attr("required", question.required, true, false)+pug_attr("disabled", response.complete, true, false)+pug_attr("rows", question.config && question.config.rows?question.config.rows:5, true, false)) + "\u003E";
;pug_debug_line = 44;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = getValue(question.id)) ? "" : pug_interp)) + "\u003C\u002Ftextarea\u003E";
};
;pug_debug_line = 46;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_mixins["questionBoolean"] = pug_interp = function(question){
var block = (this && this.block), attributes = (this && this.attributes) || {};
;pug_debug_line = 47;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003C!-- Default checked --\u003E";
;pug_debug_line = 48;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Cdiv class=\"form-check form-switch\"\u003E";
;pug_debug_line = 49;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Cinput" + (" class=\"form-check-input\""+" type=\"checkbox\""+pug_attr("name", `response[responses][q-${question.id}]`, true, false)+pug_attr("checked", getValue(question.id), true, false)+pug_attr("id", 'question-' + question.id, true, false)+pug_attr("disabled", response.complete, true, false)) + "\u002F\u003E";
;pug_debug_line = 56;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Clabel" + (" class=\"form-check-label\""+pug_attr("for", "question-" + question.id, true, false)) + "\u003E";
;pug_debug_line = 56;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = question.question) ? "" : pug_interp)) + "\u003C\u002Flabel\u003E";
;pug_debug_line = 57;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
if (question.description) {
;pug_debug_line = 58;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Cdiv class=\"form-text\"\u003E";
;pug_debug_line = 58;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = question.description) ? "" : pug_interp)) + "\u003C\u002Fdiv\u003E";
}
pug_html = pug_html + "\u003C\u002Fdiv\u003E";
};
;pug_debug_line = 60;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_mixins["questionDropdown"] = pug_interp = function(question){
var block = (this && this.block), attributes = (this && this.attributes) || {};
;pug_debug_line = 61;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Clabel" + (" class=\"control-label\""+pug_attr("for", "question-" + question.id, true, false)) + "\u003E";
;pug_debug_line = 61;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = question.question) ? "" : pug_interp)) + "\u003C\u002Flabel\u003E";
;pug_debug_line = 62;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Cselect" + (" class=\"form-select select2 question\""+pug_attr("data-placeholder", question.config.placeholder, true, false)+pug_attr("name", `response[responses][q-${question.id}]`, true, false)+pug_attr("disabled", response.complete, true, false)+pug_attr("required", question.required, true, false)) + "\u003E";
;pug_debug_line = 68;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Coption\u003E\u003C\u002Foption\u003E";
;pug_debug_line = 69;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
// iterate question.config.options
;(function(){
  var $$obj = question.config.options;
  if ('number' == typeof $$obj.length) {
      for (var idx = 0, $$l = $$obj.length; idx < $$l; idx++) {
        var option = $$obj[idx];
;pug_debug_line = 70;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Coption" + (pug_attr("value", idx, true, false)+pug_attr("selected", Number(getValue(question.id))===idx, true, false)) + "\u003E";
;pug_debug_line = 70;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = option) ? "" : pug_interp)) + "\u003C\u002Foption\u003E";
      }
  } else {
    var $$l = 0;
    for (var idx in $$obj) {
      $$l++;
      var option = $$obj[idx];
;pug_debug_line = 70;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Coption" + (pug_attr("value", idx, true, false)+pug_attr("selected", Number(getValue(question.id))===idx, true, false)) + "\u003E";
;pug_debug_line = 70;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = option) ? "" : pug_interp)) + "\u003C\u002Foption\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Fselect\u003E";
};
;pug_debug_line = 72;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_mixins["questionScale"] = pug_interp = function(question){
var block = (this && this.block), attributes = (this && this.attributes) || {};
;pug_debug_line = 73;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Clabel" + (" class=\"control-label\""+pug_attr("for", "question-" + question.id, true, false)) + "\u003E";
;pug_debug_line = 73;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = question.question) ? "" : pug_interp)) + "\u003C\u002Flabel\u003E";
;pug_debug_line = 74;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
if (question.description) {
;pug_debug_line = 75;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Cdiv class=\"form-text\"\u003E";
;pug_debug_line = 75;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = question.description) ? "" : pug_interp)) + "\u003C\u002Fdiv\u003E";
}
;pug_debug_line = 77;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Cdiv" + (pug_attr("id", `question-${question.id}`, true, false)) + "\u003E";
;pug_debug_line = 78;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
if ((!questionrequired)) {
;pug_debug_line = 79;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Cdiv class=\"form-check form-check-inline mx-3 px-2 border-end\"\u003E";
;pug_debug_line = 80;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Cinput" + (" class=\"form-check-input\""+" type=\"radio\""+pug_attr("name", `response[responses][q-${question.id}]`, true, false)+" value=\"-1\""+pug_attr("id", `question-${question.id}-nr`, true, false)+pug_attr("checked", getValue(question.id)===null || Number(getValue(question.id)) === -1, true, false)+pug_attr("disabled", response.complete, true, false)) + "\u002F\u003E";
;pug_debug_line = 81;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Clabel" + (" class=\"form-check-label\""+pug_attr("for", `question-${question.id}-nr`, true, false)) + "\u003E";
;pug_debug_line = 81;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "No Response\u003C\u002Flabel\u003E\u003C\u002Fdiv\u003E";
}
;pug_debug_line = 82;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
if (question.config && question.config.options) {
;pug_debug_line = 83;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
// iterate question.config.options
;(function(){
  var $$obj = question.config.options;
  if ('number' == typeof $$obj.length) {
      for (var idx = 0, $$l = $$obj.length; idx < $$l; idx++) {
        var option = $$obj[idx];
;pug_debug_line = 84;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Cdiv class=\"form-check form-check-inline mx-2\"\u003E";
;pug_debug_line = 85;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Cinput" + (" class=\"form-check-input\""+" type=\"radio\""+pug_attr("name", `response[responses][q-${question.id}]`, true, false)+pug_attr("value", idx, true, false)+pug_attr("id", `question-${question.id}-${idx}`, true, false)+pug_attr("checked", Number(getValue(question.id))===idx, true, false)+pug_attr("disabled", response.complete, true, false)) + "\u002F\u003E";
;pug_debug_line = 86;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Clabel" + (" class=\"form-check-label\""+pug_attr("for", `question-${question.id}-${idx}`, true, false)) + "\u003E";
;pug_debug_line = 86;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = option) ? "" : pug_interp)) + "\u003C\u002Flabel\u003E\u003C\u002Fdiv\u003E";
      }
  } else {
    var $$l = 0;
    for (var idx in $$obj) {
      $$l++;
      var option = $$obj[idx];
;pug_debug_line = 84;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Cdiv class=\"form-check form-check-inline mx-2\"\u003E";
;pug_debug_line = 85;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Cinput" + (" class=\"form-check-input\""+" type=\"radio\""+pug_attr("name", `response[responses][q-${question.id}]`, true, false)+pug_attr("value", idx, true, false)+pug_attr("id", `question-${question.id}-${idx}`, true, false)+pug_attr("checked", Number(getValue(question.id))===idx, true, false)+pug_attr("disabled", response.complete, true, false)) + "\u002F\u003E";
;pug_debug_line = 86;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Clabel" + (" class=\"form-check-label\""+pug_attr("for", `question-${question.id}-${idx}`, true, false)) + "\u003E";
;pug_debug_line = 86;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = option) ? "" : pug_interp)) + "\u003C\u002Flabel\u003E\u003C\u002Fdiv\u003E";
    }
  }
}).call(this);

}
else {
;pug_debug_line = 89;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Cdiv class=\"form-check form-check-inline mx-2\"\u003E";
;pug_debug_line = 90;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Cinput" + (" class=\"form-check-input\""+" type=\"radio\""+pug_attr("name", `response[responses][q-${question.id}]`, true, false)+" value=\"1\""+pug_attr("id", `question-${question.id}-1`, true, false)+pug_attr("checked", Number(getValue(question.id))===1, true, false)+pug_attr("disabled", response.complete, true, false)) + "\u002F\u003E";
;pug_debug_line = 91;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Clabel" + (" class=\"form-check-label\""+pug_attr("for", `question-${question.id}-1`, true, false)) + "\u003E";
;pug_debug_line = 91;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "Strong Negative (1)\u003C\u002Flabel\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 92;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Cdiv class=\"form-check form-check-inline mx-2\"\u003E";
;pug_debug_line = 93;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Cinput" + (" class=\"form-check-input\""+" type=\"radio\""+pug_attr("name", `response[responses][q-${question.id}]`, true, false)+" value=\"2\""+pug_attr("id", `question-${question.id}-2`, true, false)+pug_attr("checked", Number(getValue(question.id))===2, true, false)+pug_attr("disabled", response.complete, true, false)) + "\u002F\u003E";
;pug_debug_line = 94;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Clabel" + (" class=\"form-check-label\""+pug_attr("for", `question-${question.id}-2`, true, false)) + "\u003E";
;pug_debug_line = 94;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "Negative (2)\u003C\u002Flabel\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 95;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Cdiv class=\"form-check form-check-inline mx-2\"\u003E";
;pug_debug_line = 96;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Cinput" + (" class=\"form-check-input\""+" type=\"radio\""+pug_attr("name", `response[responses][q-${question.id}]`, true, false)+" value=\"3\""+pug_attr("id", `question-${question.id}-3`, true, false)+pug_attr("checked", Number(getValue(question.id))===3, true, false)+pug_attr("disabled", response.complete, true, false)) + "\u002F\u003E";
;pug_debug_line = 97;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Clabel" + (" class=\"form-check-label\""+pug_attr("for", `question-${question.id}-3`, true, false)) + "\u003E";
;pug_debug_line = 97;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "Neutral (3)\u003C\u002Flabel\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 98;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Cdiv class=\"form-check form-check-inline mx-2\"\u003E";
;pug_debug_line = 99;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Cinput" + (" class=\"form-check-input\""+" type=\"radio\""+pug_attr("name", `response[responses][q-${question.id}]`, true, false)+" value=\"4\""+pug_attr("id", `question-${question.id}-4`, true, false)+pug_attr("checked", Number(getValue(question.id))===4, true, false)+pug_attr("disabled", response.complete, true, false)) + "\u002F\u003E";
;pug_debug_line = 100;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Clabel" + (" class=\"form-check-label\""+pug_attr("for", `question-${question.id}-4`, true, false)) + "\u003E";
;pug_debug_line = 100;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "Positive (4)\u003C\u002Flabel\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 101;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Cdiv class=\"form-check form-check-inline mx-2\"\u003E";
;pug_debug_line = 102;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Cinput" + (" class=\"form-check-input\""+" type=\"radio\""+pug_attr("name", `response[responses][q-${question.id}]`, true, false)+" value=\"5\""+pug_attr("id", `question-${question.id}-5`, true, false)+pug_attr("checked", Number(getValue(question.id))===5, true, false)+pug_attr("disabled", response.complete, true, false)) + "\u002F\u003E";
;pug_debug_line = 103;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Clabel" + (" class=\"form-check-label\""+pug_attr("for", `question-${question.id}-5`, true, false)) + "\u003E";
;pug_debug_line = 103;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "Strongly Positive (5)\u003C\u002Flabel\u003E\u003C\u002Fdiv\u003E";
}
pug_html = pug_html + "\u003C\u002Fdiv\u003E";
};
;pug_debug_line = 105;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_mixins["questionEventsStub"] = pug_interp = function(question){
var block = (this && this.block), attributes = (this && this.attributes) || {};
;pug_debug_line = 106;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Cdiv id=\"questionEvents\" style=\"display:none\"\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 107;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Cdiv class=\"col-sm-6 offset-sm-3 text-center\" id=\"signupsLoading\"\u003E";
;pug_debug_line = 108;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Cdiv class=\"spinner-border m-5\" role=\"status\" style=\"width: 3rem; height: 3rem;\"\u003E";
;pug_debug_line = 109;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Cdiv class=\"visually-hidden\"\u003E";
;pug_debug_line = 109;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "Table is Loading\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E";
};
;pug_debug_line = 112;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_mixins["questionEvents"] = pug_interp = function(){
var block = (this && this.block), attributes = (this && this.attributes) || {};
;pug_debug_line = 113;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Cdiv class=\"table-responsive\"\u003E";
;pug_debug_line = 114;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Ctable class=\"table table-sm table-striped\"\u003E";
;pug_debug_line = 115;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Cthead\u003E";
;pug_debug_line = 116;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Cth\u003E";
;pug_debug_line = 116;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "Category\u003C\u002Fth\u003E";
;pug_debug_line = 117;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Cth\u003E";
;pug_debug_line = 117;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "Event Name\u003C\u002Fth\u003E";
;pug_debug_line = 118;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Cth class=\"text-end\"\u003E";
;pug_debug_line = 118;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "Actions\u003C\u002Fth\u003E\u003C\u002Fthead\u003E";
;pug_debug_line = 119;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Ctbody\u003E";
;pug_debug_line = 120;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
// iterate userEvents
;(function(){
  var $$obj = userEvents;
  if ('number' == typeof $$obj.length) {
      for (var pug_index2 = 0, $$l = $$obj.length; pug_index2 < $$l; pug_index2++) {
        var userEvent = $$obj[pug_index2];
;pug_debug_line = 121;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
const event = userEvent.event
if (!event) { continue }
const feedback = userEvent.feedback

let hasFeedback = false;
if (feedback){
    if (feedback.recommend && feedback.recommend !== -1){
        hasFeedback = true;
    } else if (feedback.gm && feedback.gm !== ''){
        hasFeedback = true;
    } else if (feedback.concom && feedback.concom !== ''){
        hasFeedback = true;
    }

}
;pug_debug_line = 137;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Ctr\u003E";
;pug_debug_line = 138;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Ctd\u003E";
;pug_debug_line = 139;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Csmall\u003E";
;pug_debug_line = 139;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = event.event_category.name) ? "" : pug_interp)) + "\u003C\u002Fsmall\u003E\u003C\u002Ftd\u003E";
;pug_debug_line = 140;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Ctd\u003E";
;pug_debug_line = 140;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = event.title) ? "" : pug_interp));
;pug_debug_line = 141;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
if (hasFeedback) {
;pug_debug_line = 142;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Cdiv class=\"badge text-bg-success ms-2\"\u003E";
;pug_debug_line = 143;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Ci class=\"fas fa-check-circle me-1\"\u003E\u003C\u002Fi\u003E";
;pug_debug_line = 144;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "Feedback Provided\u003C\u002Fdiv\u003E";
}
pug_html = pug_html + "\u003C\u002Ftd\u003E";
;pug_debug_line = 145;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Ctd class=\"text-end\"\u003E";
;pug_debug_line = 146;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Cbutton" + (" class=\"btn btn-sm btn-outline-primary feedback-edit\""+" role=\"button\""+pug_attr("data-eventid", event.id, true, false)+pug_attr("disabled", disabled, true, false)) + "\u003E";
;pug_debug_line = 151;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Ci class=\"fas fa-edit me-1 feedback-icon\"\u003E\u003C\u002Fi\u003E";
;pug_debug_line = 152;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
if (hasFeedback) {
;pug_debug_line = 153;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "Edit Feedback";
}
else {
;pug_debug_line = 155;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "Provide Feedback";
}
pug_html = pug_html + "\u003C\u002Fbutton\u003E";
;pug_debug_line = 156;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Cbutton" + (" class=\"btn btn-sm btn-outline-danger ms-1 feedback-remove\""+" role=\"button\""+pug_attr("data-eventid", event.id, true, false)+" data-toggle=\"tooltip\" title=\"Remove from List\""+pug_attr("disabled", disabled, true, false)) + "\u003E";
;pug_debug_line = 163;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Ci class=\"fas fa-trash fa-fw feedback-icon\"\u003E\u003C\u002Fi\u003E\u003C\u002Fbutton\u003E\u003C\u002Ftd\u003E\u003C\u002Ftr\u003E";
      }
  } else {
    var $$l = 0;
    for (var pug_index2 in $$obj) {
      $$l++;
      var userEvent = $$obj[pug_index2];
;pug_debug_line = 121;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
const event = userEvent.event
if (!event) { continue }
const feedback = userEvent.feedback

let hasFeedback = false;
if (feedback){
    if (feedback.recommend && feedback.recommend !== -1){
        hasFeedback = true;
    } else if (feedback.gm && feedback.gm !== ''){
        hasFeedback = true;
    } else if (feedback.concom && feedback.concom !== ''){
        hasFeedback = true;
    }

}
;pug_debug_line = 137;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Ctr\u003E";
;pug_debug_line = 138;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Ctd\u003E";
;pug_debug_line = 139;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Csmall\u003E";
;pug_debug_line = 139;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = event.event_category.name) ? "" : pug_interp)) + "\u003C\u002Fsmall\u003E\u003C\u002Ftd\u003E";
;pug_debug_line = 140;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Ctd\u003E";
;pug_debug_line = 140;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = event.title) ? "" : pug_interp));
;pug_debug_line = 141;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
if (hasFeedback) {
;pug_debug_line = 142;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Cdiv class=\"badge text-bg-success ms-2\"\u003E";
;pug_debug_line = 143;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Ci class=\"fas fa-check-circle me-1\"\u003E\u003C\u002Fi\u003E";
;pug_debug_line = 144;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "Feedback Provided\u003C\u002Fdiv\u003E";
}
pug_html = pug_html + "\u003C\u002Ftd\u003E";
;pug_debug_line = 145;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Ctd class=\"text-end\"\u003E";
;pug_debug_line = 146;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Cbutton" + (" class=\"btn btn-sm btn-outline-primary feedback-edit\""+" role=\"button\""+pug_attr("data-eventid", event.id, true, false)+pug_attr("disabled", disabled, true, false)) + "\u003E";
;pug_debug_line = 151;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Ci class=\"fas fa-edit me-1 feedback-icon\"\u003E\u003C\u002Fi\u003E";
;pug_debug_line = 152;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
if (hasFeedback) {
;pug_debug_line = 153;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "Edit Feedback";
}
else {
;pug_debug_line = 155;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "Provide Feedback";
}
pug_html = pug_html + "\u003C\u002Fbutton\u003E";
;pug_debug_line = 156;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Cbutton" + (" class=\"btn btn-sm btn-outline-danger ms-1 feedback-remove\""+" role=\"button\""+pug_attr("data-eventid", event.id, true, false)+" data-toggle=\"tooltip\" title=\"Remove from List\""+pug_attr("disabled", disabled, true, false)) + "\u003E";
;pug_debug_line = 163;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Ci class=\"fas fa-trash fa-fw feedback-icon\"\u003E\u003C\u002Fi\u003E\u003C\u002Fbutton\u003E\u003C\u002Ftd\u003E\u003C\u002Ftr\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Ftbody\u003E";
;pug_debug_line = 165;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Ctfoot\u003E";
;pug_debug_line = 166;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Ctr\u003E";
;pug_debug_line = 167;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Ctd colspan=\"3\"\u003E";
;pug_debug_line = 168;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Cdiv class=\"input-group my-2 eventPicker\"\u003E";
;pug_debug_line = 169;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Cselect class=\"form-select select2 event-select\" data-placeholder=\"Select an event to add\"\u003E";
;pug_debug_line = 170;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Coption\u003E\u003C\u002Foption\u003E";
;pug_debug_line = 171;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
// iterate events
;(function(){
  var $$obj = events;
  if ('number' == typeof $$obj.length) {
      for (var pug_index3 = 0, $$l = $$obj.length; pug_index3 < $$l; pug_index3++) {
        var event = $$obj[pug_index3];
;pug_debug_line = 172;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Coption" + (pug_attr("value", event.id, true, false)) + "\u003E";
;pug_debug_line = 172;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = event.event_category.name + ': '+ event.title) ? "" : pug_interp)) + "\u003C\u002Foption\u003E";
      }
  } else {
    var $$l = 0;
    for (var pug_index3 in $$obj) {
      $$l++;
      var event = $$obj[pug_index3];
;pug_debug_line = 172;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Coption" + (pug_attr("value", event.id, true, false)) + "\u003E";
;pug_debug_line = 172;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = event.event_category.name + ': '+ event.title) ? "" : pug_interp)) + "\u003C\u002Foption\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Fselect\u003E";
;pug_debug_line = 174;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Cbutton class=\"btn btn-outline-success feedback-add\" type=\"button\"\u003E";
;pug_debug_line = 175;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + "\u003Cspan class=\"fa fa-plus\"\u003E\u003C\u002Fspan\u003E";
;pug_debug_line = 176;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";
pug_html = pug_html + " Add Event\u003C\u002Fbutton\u003E\u003C\u002Fdiv\u003E\u003C\u002Ftd\u003E\u003C\u002Ftr\u003E\u003C\u002Ftfoot\u003E\u003C\u002Ftable\u003E\u003C\u002Fdiv\u003E";
};
;pug_debug_line = 178;pug_debug_filename = "views\u002Fpartials\u002Fsurvey.pug";





























;pug_debug_line = 3;pug_debug_filename = "views\u002Fsurvey\u002Ftemplates\u002FsignupsList.pug";
;pug_debug_line = 4;pug_debug_filename = "views\u002Fsurvey\u002Ftemplates\u002FsignupsList.pug";
pug_mixins["questionEvents"](events, userEvents);}.call(this,"Number" in locals_for_with?locals_for_with.Number:typeof Number!=="undefined"?Number:undefined,"disabled" in locals_for_with?locals_for_with.disabled:typeof disabled!=="undefined"?disabled:undefined,"events" in locals_for_with?locals_for_with.events:typeof events!=="undefined"?events:undefined,"getValue" in locals_for_with?locals_for_with.getValue:typeof getValue!=="undefined"?getValue:undefined,"questionrequired" in locals_for_with?locals_for_with.questionrequired:typeof questionrequired!=="undefined"?questionrequired:undefined,"response" in locals_for_with?locals_for_with.response:typeof response!=="undefined"?response:undefined,"userEvents" in locals_for_with?locals_for_with.userEvents:typeof userEvents!=="undefined"?userEvents:undefined));} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);};return pug_html;}