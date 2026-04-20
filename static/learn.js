$(document).ready(function () {
    const VF = Vex.Flow;
    const rawSequence = $('#vexflow-container').attr('data-sequence');
    const sequence = JSON.parse(rawSequence);

    function renderNotation() {
        const container = $('#vexflow-container')[0];

        const renderer = new VF.Renderer(container, VF.Renderer.Backends.SVG);
        renderer.resize(550, 200);
        const context = renderer.getContext();

        const stave = new VF.Stave(10, 40, 530);
        stave.setContext(context).addClef('percussion').draw();

        const notes = sequence.map((stroke, index) => {
            const note = new VF.StaveNote({
                clef: "percussion",
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

        const voice = new VF.Voice({ num_beats: 4, beat_value: 4 });
        voice.addTickables(notes);

        const formatter = new VF.Formatter();
        formatter.joinVoices([voice]);
        formatter.format([voice], 480);

        voice.draw(context, stave);
        beams.forEach(beam => beam.setContext(context).draw());
    }

    renderNotation();
});