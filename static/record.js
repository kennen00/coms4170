$(document).ready(function () {
    const VF = Vex.Flow;
    const container = $('#vexflow-container')[0];
    const resetBtn = $('#record-reset');
    const exportBtn = $('#record-export');
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

    function updateExportButton() {
        const hasTitle = nameInput.val().trim().length > 0;
        const hasNotes = recordedSequence.length > 0;
        exportBtn.prop('disabled', !(hasTitle && hasNotes));
    }

    function handleStickInput(hand) {
        recordedSequence.push(hand);
        renderNotation();
        resetBtn.removeClass('d-none');
        updateExportButton();
    }

    function reset() {
        recordedSequence = [];
        renderNotation();
        resetBtn.addClass('d-none');
        updateExportButton();
    }

    function escapeXml(str) {
        return str.replace(/[<>&'"]/g, c => ({
            '<': '&lt;',
            '>': '&gt;',
            '&': '&amp;',
            "'": '&apos;',
            '"': '&quot;',
        })[c]);
    }

    function exportSvg() {
        const title = nameInput.val().trim();
        if (!title || recordedSequence.length === 0) return;

        const originalSvg = container.querySelector('svg');
        if (!originalSvg) return;

        const width = parseInt(originalSvg.getAttribute('width'), 10);
        const height = parseInt(originalSvg.getAttribute('height'), 10);
        const titleHeight = 50;
        const totalHeight = height + titleHeight;

        const serializer = new XMLSerializer();
        const innerContent = Array.from(originalSvg.children)
            .map(child => serializer.serializeToString(child))
            .join('');

        const svgString = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${totalHeight}" viewBox="0 0 ${width} ${totalHeight}">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <text x="${width / 2}" y="32" text-anchor="middle" font-family="Merriweather, serif" font-size="20" font-weight="bold" fill="#333333">${escapeXml(title)}</text>
  <g transform="translate(0, ${titleHeight})">${innerContent}</g>
</svg>`;

        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const filename = title.replace(/[^a-z0-9]+/gi, '_').toLowerCase() || 'rudiment';
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    nameInput.on('input', function () {
        nameDisplay.text(nameInput.val());
        updateExportButton();
    });

    window.onStickInput = handleStickInput;
    resetBtn.on('click', reset);
    exportBtn.on('click', exportSvg);

    renderNotation();
    updateExportButton();
});
