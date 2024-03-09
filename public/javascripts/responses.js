/* global _  */
$(function () {
    $('[data-bs-toggle="tooltip"]').tooltip();
    $('.select2').select2({
        theme:'bootstrap-5',
        minimumResultsForSearch: 6,
        width:'resolve'
    });
    $('#question-results-select').on('change', showSummaryResults).trigger('change');
    $('#question-individual-select').on('change', showIndividualResults).trigger('change');
    $('#prev-question-response').on('click', showPrevQuestionResponse);
    $('#next-question-response').on('click', showNextQuestionResponse);

    $('#prev-individual-response').on('click', showPrevIndividualResponse);
    $('#next-individual-response').on('click', showNextIndividualResponse);
    $('#current-question').on('change', showSpecificQuestionResponse);
    $('#current-response').on('change', showSpecificIndividualResponse);
});

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function showSpecificQuestionResponse(e){
    const $this = $(this);
    let questionIdx = $this.val();
    if (questionIdx > $('.question-response').length){
        questionIdx = $('.question-response').length;
    } else if (questionIdx < 1){
        questionIdx = 1;
    }
    const $page = $('.question-response').eq(questionIdx-1);
    const questionId = $page.data('questionid');
    $('#question-results-select').val(questionId).trigger('change');

}

function showSummaryResults(e){
    const $this = $(this);
    const questionId = $this.val();
    $('.question-response').hide();
    const $response = $(`#question-response-${questionId}`);
    $response.show();
    const $currentQuestion = $('#current-question');
    const index = $response.index();
    const count = $response.siblings().length;
    if (index === 0){
        $('#prev-question-response').attr('disabled', true);
    } else {
        $('#prev-question-response').attr('disabled', false);
    }
    if (index === count){
        $('#next-question-response').attr('disabled', true);
    } else {
        $('#next-question-response').attr('disabled', false);
    }
    $currentQuestion.val(index + 1);
}

function showPrevQuestionResponse(e){
    e.preventDefault();
    const $responseDiv = $('#question-responses-container');
    const $activeResponse = $responseDiv.find('.question-response:visible');
    const $prevDiv = $activeResponse.prev();
    if ($prevDiv.length){
        const responseId = $prevDiv.data('questionid');
        $('#question-results-select').val(responseId).trigger('change');
    }
}

function showNextQuestionResponse(e){
    e.preventDefault();
    const $responseDiv = $('#question-responses-container');
    const $activeResponse = $responseDiv.find('.question-response:visible');
    const $nextDiv = $activeResponse.next();
    if ($nextDiv.length){
        const responseId = $nextDiv.data('questionid');
        $('#question-results-select').val(responseId).trigger('change');
    }
}

function showSpecificIndividualResponse(e){
    const $this = $(this);
    let responseIdx = $this.val();
    if (responseIdx > $('.individual-response').length){
        responseIdx = $('.individual-response').length;
    } else if (responseIdx < 1){
        responseIdx = 1;
    }
    const $page = $('.individual-response').eq(responseIdx-1);
    const responseId = $page.data('responseid');
    $('#question-individual-select').val(responseId).trigger('change');

}

function showIndividualResults(e){
    const $this = $(this);
    const responseId = $this.val();
    $('.individual-response').hide();
    const $response = $(`#individual-response-${responseId}`);
    $response.show();
    const $currentResponse = $('#current-response');
    const index = $response.index();
    const count = $response.siblings().length;
    if (index === 0){
        $('#prev-individual-response').attr('disabled', true);
    } else {
        $('#prev-individual-response').attr('disabled', false);
    }
    if (index === count){
        $('#next-individual-response').attr('disabled', true);
    } else {
        $('#next-individual-response').attr('disabled', false);
    }
    $currentResponse.val(index + 1);

}

function showPrevIndividualResponse(e){
    e.preventDefault();
    const $responseDiv = $('#individual-responses-container');
    const $activeResponse = $responseDiv.find('.individual-response:visible');
    const $prevDiv = $activeResponse.prev();
    if ($prevDiv.length){
        const responseId = $prevDiv.data('responseid');
        $('#question-individual-select').val(responseId).trigger('change');
    }
}

function showNextIndividualResponse(e){
    e.preventDefault();
    const $responseDiv = $('#individual-responses-container');
    const $activeResponse = $responseDiv.find('.individual-response:visible');
    const $nextDiv = $activeResponse.next();
    if ($nextDiv.length){
        const responseId = $nextDiv.data('responseid');
        $('#question-individual-select').val(responseId).trigger('change');
    }
}
