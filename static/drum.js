$(document).ready(function () {
    const animateStick = (stick, addClass) => {
        $(stick).addClass(addClass);
        setTimeout(() => $(stick).removeClass(addClass), 200);
    };

    $('#stick-left').on('click', function () {
        animateStick(this, 'hit-left');
    });

    $('#stick-right').on('click', function () {
        animateStick(this, 'hit-right');
    }); 0
});