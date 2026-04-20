$(document).ready(function () {
    const VF = Vex.Flow;
    const container = $('#vexflow-container')[0];
    const resetBtn = $('#quiz-reset');
    const submitBtn = $('#quiz-submit');

    let playedSequence = [];
    let inputLocked = false;

    function renderNotation() {
        $(container).empty();

        const renderer = new VF.Renderer(container, VF.Renderer.Backends.SVG);
        renderer.resize(550, 200);
        const context = renderer.getContext();

        const stave = new VF.Stave(10, 40, 530);
        stave.setContext(context).addClef('percussion').draw();

        if (playedSequence.length === 0) return;

        const notes = playedSequence.map(stroke => {
            const note = new VF.StaveNote({
                clef: 'percussion',
                keys: ['c/5'],
                duration: '8'
            });
            const annotation = new VF.Annotation(stroke)
                .setFont('Arial', 14, 'bold')
                .setJustification('center')
                .setVerticalJustification('below');
            note.addModifier(annotation, 0);
            return note;
        });

        const beams = [];
        for (let i = 0; i < notes.length; i += 4) {
            if (i + 3 < notes.length) {
                beams.push(new VF.Beam([notes[i], notes[i + 1], notes[i + 2], notes[i + 3]]));
            }
        }

        const voice = new VF.Voice({ num_beats: notes.length, beat_value: 8 });
        voice.setStrict(false);
        voice.addTickables(notes);

        const formatter = new VF.Formatter();
        formatter.joinVoices([voice]);
        formatter.format([voice], 480);

        voice.draw(context, stave);
        beams.forEach(beam => beam.setContext(context).draw());
    }

    function handleStickInput(hand) {
        if (inputLocked) return;

        playedSequence.push(hand);
        renderNotation();

        if (playedSequence.length >= expectedLength) {
            inputLocked = true;
            resetBtn.removeClass('d-none');
            submitBtn.removeClass('d-none');
        }
    }

    function reset() {
        playedSequence = [];
        inputLocked = false;
        renderNotation();
        resetBtn.addClass('d-none');
        submitBtn.addClass('d-none');
    }

    function submit() {
        submitBtn.prop('disabled', true);
        resetBtn.prop('disabled', true);

        $.ajax({
            url: '/quiz/' + quizId + '/submit',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ sequence: playedSequence })
        }).done(function (response) {
            window.location = response.next_url;
        }).fail(function () {
            submitBtn.prop('disabled', false);
            resetBtn.prop('disabled', false);
            alert('Submission failed. Please try again.');
        });
    }

    window.onStickInput = handleStickInput;
    resetBtn.on('click', reset);
    submitBtn.on('click', submit);

    renderNotation();
});
