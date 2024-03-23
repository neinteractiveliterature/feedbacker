/* globals signupslistTemplate questionpreviewTemplate */
$(function(){
    $('.select2').select2({
        theme:'bootstrap-5',
        minimumResultsForSearch: 6,
        width:'resolve'
    });
    $('[data-bs-toggle="tooltip"]').tooltip();
    $('#question_type').on('change', showQuestionTypeOptions).trigger('change');
    $('#questionForm').find('input').on('change', prevewQuestion);
    $('#questionForm').find('select').on('change', prevewQuestion);
    $('#question_question').trigger('change');
});


function showQuestionTypeOptions(e){
    const $this = $(this);
    const type = $this.val();
    $('.question-options').hide();
    $(`.question-${type}-options`).show();
}

function prevewQuestion(e){
    const $form = $('#questionForm');
    const question = {
        question: $('#question_question').val(),
        type: $('#question_type').val(),
        required: $('#question_required').is(':checked'),
        description: $('#question_description').val(),
        config:{
            rows: Number($('#question_config_rows').val()),
            placeholder: $('#question_config_placeholder').val(),
            border: $('#question_config_border').is(':checked'),
            options: ($('#question_config_options').val()).split(/\s*,\s*/)
        },
        disabled:false
    };
    const data = {
        question: question,
        userEvents:[],
        response: {complete:false},
        getValue: function(questionId) {
            if (question.type === 'scale'  || question.type === 'dropdown'){ return null; }
            return '';
        }
    };
    $('#preview-container').html(questionpreviewTemplate(data));

    if (question.type === 'events'){
        const eventData = {
            events: [
                {
                    id:0,
                    title: 'Fake Larp',
                    event_category: { name: 'Larp'}
                },
                {
                    id:1,
                    title: 'Fake Social Event',
                    event_category: { name: 'Social event'}
                }
            ],
            userEvents : [{
                id: 0,
                event: {
                    title: 'Fake Larp',
                    event_category: { name: 'Larp'}
                }
            }],
            disabled: true
        };

        $('#questionEvents').html(signupslistTemplate(eventData));
        $('#signupsLoading').hide();
        $('#questionEvents').show();
    }
    $('#preview-container').find('.select2').select2({
        theme:'bootstrap-5',
        minimumResultsForSearch: 6,
        width:'resolve'
    });
}

