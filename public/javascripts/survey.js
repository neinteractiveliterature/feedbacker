/* global _ editFeedbackTemplate newFeedbackTemplate signupslistTemplate */
$(function () {
    $('[data-toggle="popover"]').popover();
    $('.question.select2').select2({
        theme:'bootstrap-5',
        minimumResultsForSearch: 6,
        width:'resolve'
    });
    $('#survey-submit').confirmation({'title':'Finalize and Submit this Survey Response?'});
    $('#survey-unsubmit').confirmation({'title':'Reopen this Survey Response?'});

    $('#surveyModal').find('.save-btn').on('click', submitFeedbackModal);
    $('#response-anonymous').on('change', displaySurveyUserName).trigger('change');
    loadSignups();
});

let eventList = {};
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

async function showEventFeedback(e){
    e.preventDefault();
    e.stopPropagation();
    const $this = $(this);
    const eventId = $this.data('eventid');
    const responseId = $('#response-id').val();
    const base_url = $('#base-url').val();
    $this.find('.feedback-icon').removeClass('fa-edit').addClass('fa-sync').addClass('fa-spin');

    const result = await fetch(`/feedback/${responseId}/${eventId}/api`);
    const data = await result.json();
    data.base_url = base_url;
    data.capitalize = capitalize;
    data.modal = true;
    data.backto = 'modal';

    const $modal = $('#surveyModal');

    $modal.find('.modal-title').text(`Edit Feedback for ${data.event.title}`);
    if (data.feedback.id){
        $modal.find('.modal-body').html(editFeedbackTemplate(data));
    } else {
        $modal.find('.modal-body').html(newFeedbackTemplate(data));
    }

    prepFeedbackForm($modal.find('form'));
    $modal.modal('show');

    $modal.on('hidden.bs.modal', function(e){
        $modal.modal('dispose');
        $this.find('.feedback-icon').removeClass('fa-sync').addClass('fa-edit').removeClass('fa-spin');
    });

}

function prepFeedbackForm($form){
    $form.find('.select2').select2({
        theme:'bootstrap-5',
        minimumResultsForSearch: 6,
        width:'resolve',
        dropdownParent: $form,
    });
}

async function submitFeedbackModal(e) {
    e.preventDefault();
    const $modal = $('#surveyModal');
    const form = $modal.find('.modal-body').find('form')[0];
    const data = new URLSearchParams();
    for (const pair of new FormData(form)) {
        data.append(pair[0], pair[1]);
    }

    const request = await fetch(form.action,{method:form.method, body: data});
    const result = await request.json();

    if (!result.success){
        console.log(result.error);
        $modal.modal('hide');

    }

    loadSignups();
    $modal.modal('hide');
}

async function removeEventFeedback(e){
    e.preventDefault();
    e.stopPropagation();
    const $this = $(this);
    const responseId = $('#response-id').val();
    const eventId = $this.data('eventid');

    const url = `/feedback/${responseId}/remove/${eventId}`;

    const data = JSON.stringify({
        _method: 'DELETE',
        _csrf: $('#csrf').val(),
    });
    const request = await fetch(url,{
        headers: {
            'Content-Type': 'application/json',
        },
        method:'DELETE',
        body: data
    });
    const result = await request.json();

    if (!result.success){
        console.log(result.error);
    }
    loadSignups();
}

async function addEventFeedback(e){
    e.preventDefault();
    e.stopPropagation();
    const $this = $(this);
    const responseId = $('#response-id').val();
    const eventId = $this.closest('.eventPicker').find('.event-select').val();
    if (!eventId) { return; }

    const url = `/feedback/${responseId}/add/${eventId}`;

    const data = JSON.stringify({
        _method: 'POST',
        _csrf: $('#csrf').val(),
    });
    const request = await fetch(url,{
        headers: {
            'Content-Type': 'application/json',
        },
        method:'POST',
        body: data
    });
    const result = await request.json();

    if (!result.success){
        console.log(result.error);
    }
    loadSignups();
}

async function loadSignups(){
    const responseId = $('#response-id').val();
    if (!_.keys(eventList).length){
        const eventsResult = await fetch(`/response/${responseId}/events`);
        eventList = (await eventsResult.json()).events;
    }
    const signupsResult = await fetch(`/response/${responseId}/signups`);
    const complete = $('#response-complete').val();
    const data = {
        events: eventList,
        userEvents : (await signupsResult.json()).userEvents,
        disabled: complete === 'true'
    };
    console.log(data);

    $('#questionEvents').html(signupslistTemplate(data));
    $('#signupsLoading').hide();
    $('#questionEvents').show();
    $('.feedback-edit').on('click', showEventFeedback);
    $('.feedback-remove').confirmation({title: 'Remove from List?'}).on('click', removeEventFeedback);
    $('.feedback-add').on('click', addEventFeedback);
    $('[data-bs-toggle="tooltip"]').tooltip();
    $('#questionEvents').find('.select2').select2({
        theme:'bootstrap-5',
        minimumResultsForSearch: 6,
        width: $( this ).data( 'width' ) ? $( this ).data( 'width' ) : $( this ).hasClass( 'w-100' ) ? '100%' : 'style'
    });
}

function displaySurveyUserName(e){
    const $this = $(this);
    const checked = $this.is(':checked');
    if (checked){
        $('#survey-user').hide();
        $('#survey-user-anon').show();
    } else {
        $('#survey-user').show();
        $('#survey-user-anon').hide();
    }
}
