$(document).ready(function () {
    const animateStick = (stick, addClass) => {
        $(stick).addClass(addClass);
        setTimeout(() => $(stick).removeClass(addClass), 200);
    };

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioCtx();
    let snareBuffer = null;

    fetch('/static/snare_sound.mp3')
        .then(response => response.arrayBuffer())
        .then(data => audioCtx.decodeAudioData(data))
        .then(buffer => { snareBuffer = buffer; })
        .catch(e => console.log('Audio load failed:', e));

    function playSnare() {
        if (!snareBuffer) return;
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        const source = audioCtx.createBufferSource();
        source.buffer = snareBuffer;
        source.connect(audioCtx.destination);
        source.start(audioCtx.currentTime + 0.05);
    }

    window.playStick = function (hand) {
        const stick = hand === 'L' ? $('#stick-left') : $('#stick-right');
        const hitClass = hand === 'L' ? 'hit-left' : 'hit-right';
        animateStick(stick, hitClass);
        playSnare();
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
