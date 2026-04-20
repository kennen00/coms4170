$(document).ready(function () {
    const animateStick = (stick, addClass) => {
        $(stick).addClass(addClass);
        setTimeout(() => $(stick).removeClass(addClass), 200);
    };

    const soundPool = [];
    const poolSize = 5;

    for (let i = 0; i < poolSize; i++) {
        soundPool.push(new Audio('/static/snare_sound.mp3'));
    }

    let currentSoundIndex = 0;

    window.playStick = function (hand) {
        const stick = hand === 'L' ? $('#stick-left') : $('#stick-right');
        const hitClass = hand === 'L' ? 'hit-left' : 'hit-right';
        animateStick(stick, hitClass);

        const sound = soundPool[currentSoundIndex];
        sound.currentTime = 0;
        sound.play().catch(e => console.log('Audio play failed:', e));

        currentSoundIndex = (currentSoundIndex + 1) % poolSize;
    };

    $('#stick-left').on('click', function () {
        window.playStick('L');
        window.onStickInput && window.onStickInput('L');
    });

    $('#stick-right').on('click', function () {
        window.playStick('R');
        window.onStickInput && window.onStickInput('R');
    });

    $(document).on('keydown', function (event) {
        const key = event.key.toLowerCase();
        if (key === 'f' || key === 'arrowleft') {
            event.preventDefault();
            window.playStick('L');
            window.onStickInput && window.onStickInput('L');
        }
        if (key === 'j' || key === 'arrowright') {
            event.preventDefault();
            window.playStick('R');
            window.onStickInput && window.onStickInput('R');
        }
    });
});