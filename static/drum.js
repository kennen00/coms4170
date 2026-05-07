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

    const heldKeys = new Set();

    $(document).on('keydown', function (event) {
        const key = event.key.toLowerCase();
        const isLeft = key === 'f' || key === 'arrowleft';
        const isRight = key === 'j' || key === 'arrowright';
        if (!isLeft && !isRight) return;

        event.preventDefault();
        if (heldKeys.has(key)) return;
        heldKeys.add(key);

        const hand = isLeft ? 'L' : 'R';
        window.playStick(hand);
        window.onStickInput && window.onStickInput(hand);
    });

    $(document).on('keyup', function (event) {
        heldKeys.delete(event.key.toLowerCase());
    });
});
