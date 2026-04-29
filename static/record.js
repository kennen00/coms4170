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

        const parentWidth = $(container).parent().width() || 800;
        const maxLineWidth = Math.max(550, parentWidth);
        const noteSpacing = 45;
        const clefPad = 100;
        const capacity = Math.max(4, Math.floor((maxLineWidth - clefPad) / noteSpacing));
        const notesPerLine = Math.max(4, Math.floor(capacity / 4) * 4);

        const noteCount = recordedSequence.length;
        const willWrap = noteCount > notesPerLine;
        const lineWidth = willWrap
            ? maxLineWidth
            : Math.max(550, 80 + noteCount * noteSpacing);

        const lineCount = Math.max(1, Math.ceil(noteCount / notesPerLine));
        const lineHeight = 120;
        const topPadding = 40;
        const bottomPadding = 20;
        const totalHeight = topPadding + lineHeight * lineCount + bottomPadding;

        const renderer = new VF.Renderer(container, VF.Renderer.Backends.SVG);
        renderer.resize(lineWidth, totalHeight);
        const context = renderer.getContext();

        for (let lineIdx = 0; lineIdx < lineCount; lineIdx++) {
            const y = topPadding + lineIdx * lineHeight;
            const isFirstLine = lineIdx === 0;
            const startIdx = lineIdx * notesPerLine;
            const lineStrokes = recordedSequence.slice(startIdx, startIdx + notesPerLine);

            const clefOverhead = isFirstLine ? 80 : 40;
            const naturalStaveWidth = Math.max(
                isFirstLine ? 530 : 150,
                clefOverhead + lineStrokes.length * noteSpacing
            );
            const staveWidth = Math.min(lineWidth - 20, naturalStaveWidth);

            const stave = new VF.Stave(10, y, staveWidth);
            if (isFirstLine) {
                stave.addClef('percussion');
            }
            stave.setContext(context).draw();

            if (lineStrokes.length === 0) continue;

            const notes = lineStrokes.map(stroke => {
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
            formatter.format([voice], staveWidth - clefOverhead);

            voice.draw(context, stave);
            beams.forEach(beam => beam.setContext(context).draw());
        }
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
    $(window).on('resize', renderNotation);

    renderNotation();
    updateExportButton();
});
