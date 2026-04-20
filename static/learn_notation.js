$(document).ready(function () {
    const VF = Vex.Flow;

    function renderExample(containerId, options) {
        const container = $('#' + containerId)[0];
        if (!container) return;

        const renderer = new VF.Renderer(container, VF.Renderer.Backends.SVG);
        renderer.resize(220, 140);
        const context = renderer.getContext();

        const stave = new VF.Stave(10, 20, 200);
        stave.setContext(context).addClef('percussion').draw();

        if (!options.note) return;

        const note = new VF.StaveNote({
            clef: 'percussion',
            keys: ['c/5'],
            duration: '8'
        });

        if (options.annotation) {
            const annotation = new VF.Annotation(options.annotation)
                .setFont('Arial', 14, 'bold')
                .setJustification('center')
                .setVerticalJustification('below');
            note.addModifier(annotation, 0);
        }

        const voice = new VF.Voice({ num_beats: 1, beat_value: 8 });
        voice.setStrict(false);
        voice.addTickables([note]);

        const formatter = new VF.Formatter();
        formatter.joinVoices([voice]);
        formatter.format([voice], 120);

        voice.draw(context, stave);
    }

    renderExample('notation-clef', { note: false });
    renderExample('notation-note', { note: true });
    renderExample('notation-right', { note: true, annotation: 'R' });
    renderExample('notation-left', { note: true, annotation: 'L' });
});
