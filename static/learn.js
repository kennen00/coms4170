$(document).ready(function () {
    const VF = Vex.Flow;
    const rawSequence = $('#vexflow-container').attr('data-sequence');
    const sequence = JSON.parse(rawSequence);
    let currentArrowIndex = 0;
    let arrowElement = null;

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
        if ($('#vexflow-container').closest('.container').find('.drum-container').length > 0) {
            addArrowIndicators(container, notes);
        }
    }

    function addArrowIndicators(container, notes) {
        const staveY = 40;
        const svg = $(container).find('svg')[0];

        notes.forEach((note, index) => {
            const x = note.getAbsoluteX();
            const ys = note.getYs();
            const y = Math.min(...ys);

            const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            arrow.setAttribute('class', 'notation-arrow');
            arrow.setAttribute('x', x + 6);
            arrow.setAttribute('y', staveY + y - 80);
            arrow.setAttribute('text-anchor', 'middle');
            arrow.setAttribute('font-size', '24px');
            arrow.setAttribute('fill', '#28a745');
            arrow.setAttribute('opacity', index === 0 ? '1' : '0');
            arrow.textContent = '↓';
            svg.appendChild(arrow);
        });

        arrowElement = $(container).find('.notation-arrow')[0];
    }

    window.updateNotationArrow = function (index, isError = false) {
        if (!arrowElement) return;

        const arrows = $(arrowElement).closest('svg').find('.notation-arrow');
        arrows.each(function (i, arrow) {
            if (i === index) {
                arrow.setAttribute('opacity', '1');
                if (isError) {
                    arrow.setAttribute('fill', '#dc3545');
                } else {
                    arrow.setAttribute('fill', '#28a745');
                }
            } else {
                arrow.setAttribute('opacity', '0');
            }
        });
    };

    renderNotation();
});