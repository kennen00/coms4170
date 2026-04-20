$(document).ready(function () {
    const animateStick = (stick, addClass) => {
        $(stick).addClass(addClass);
        setTimeout(() => $(stick).removeClass(addClass), 200);
    };

    let currentStep = 0;
    const sequence = rudiment.sequence;
    let isPlaying = false;
    let hasError = false;

    function updateNotationHighlight() {
        $('#current-stroke').text(sequence[currentStep]);
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

    $('#stick-left').on('click', function () {
        if (sequence[currentStep] === 'L') {
            animateStick(this, 'hit-left');
            nextStep();
        } else {
            $(this).addClass('error');
            setTimeout(() => $(this).removeClass('error'), 200);
            hasError = true;
            const correctHand = sequence[currentStep] === 'R' ? 'right' : 'left';
            $('#correct-hand').text(correctHand);
            $('#error-message').removeClass('error-hidden').addClass('error-visible');
            if (window.updateNotationArrow) {
                window.updateNotationArrow(currentStep, true);
            }
        }
    });

    $('#stick-right').on('click', function () {
        if (sequence[currentStep] === 'R') {
            animateStick(this, 'hit-right');
            nextStep();
        } else {
            $(this).addClass('error');
            setTimeout(() => $(this).removeClass('error'), 200);
            hasError = true;
            const correctHand = sequence[currentStep] === 'R' ? 'right' : 'left';
            $('#correct-hand').text(correctHand);
            $('#error-message').removeClass('error-hidden').addClass('error-visible');
            if (window.updateNotationArrow) {
                window.updateNotationArrow(currentStep, true);
            }
        }
    });

    updateNotationHighlight();
    if (window.updateNotationArrow) {
        window.updateNotationArrow(0);
    }
});