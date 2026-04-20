$(document).ready(function () {
    const VF = Vex.Flow;
    const container = $('#vexflow-container')[0];
    const resetBtn = $('#record-reset');
    const nameInput = $('#rudiment-name');
    const nameDisplay = $('#rudiment-name-display');

    let recordedSequence = [];

    function renderNotation() {
        $(container).empty();

        const noteCount = recordedSequence.length;
        const width = Math.max(550, 80 + noteCount * 45);

        const renderer = new VF.Renderer(container, VF.Renderer.Backends.SVG);
        renderer.resize(width, 200);
        const context = renderer.getContext();

        const stave = new VF.Stave(10, 40, width - 20);
        stave.setContext(context).addClef('percussion').draw();

        if (noteCount === 0) return;

        const notes = recordedSequence.map(stroke => {
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
        formatter.format([voice], width - 80);

        voice.draw(context, stave);
        beams.forEach(beam => beam.setContext(context).draw());
    }

    function handleStickInput(hand) {
        recordedSequence.push(hand);
        renderNotation();
        resetBtn.removeClass('d-none');
    }

    function reset() {
        recordedSequence = [];
        renderNotation();
        resetBtn.addClass('d-none');
    }

    nameInput.on('input', function () {
        nameDisplay.text(nameInput.val());
    });

    window.onStickInput = handleStickInput;
    resetBtn.on('click', reset);

    renderNotation();
});
