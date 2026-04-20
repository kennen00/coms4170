$(document).ready(function () {
    let currentStep = 0;
    const sequence = rudiment.sequence;
    let isPlaying = false;
    let hasError = false;

    function updateNotationHighlight() {
        $('#current-stroke').text(sequence[currentStep]);
    }

    function showError() {
        const correctHand = sequence[currentStep] === 'R' ? 'right' : 'left';
        $('#correct-hand').text(correctHand);
        $('#error-message').removeClass('error-hidden').addClass('error-visible');
        if (window.updateNotationArrow) {
            window.updateNotationArrow(currentStep, true);
        }
    }

    function nextStep() {
        currentStep++;
        if (currentStep >= sequence.length) {
            currentStep = 0;
        }
        updateNotationHighlight();
        hasError = false;
        $('#error-message').removeClass('error-visible').addClass('error-hidden');
        if (window.updateNotationArrow) {
            window.updateNotationArrow(currentStep);
        }
    }

    function handleStickInput(hand) {
        if (sequence[currentStep] === hand) {
            nextStep();
        } else {
            const stick = hand === 'L' ? $('#stick-left') : $('#stick-right');
            stick.addClass('error');
            setTimeout(() => stick.removeClass('error'), 200);
            hasError = true;
            showError();
            $.ajax({
                url: '/learn/mistake',
                type: 'POST',
            });
        }
    }

    window.onStickInput = handleStickInput;

    updateNotationHighlight();
    if (window.updateNotationArrow) {
        window.updateNotationArrow(0);
    }
});