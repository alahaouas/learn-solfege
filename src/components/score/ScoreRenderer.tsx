// ============================================================
// SolfApp — ScoreRenderer — Rendu VexFlow
// VexFlow = rendu seul. Zones SVG transparentes pour les clics.
// ============================================================

import { useEffect, useRef, useCallback } from 'react';
import type { Score, Note } from '@/types/music';
import { NOTE_COLORS } from '@/types/music';
import { useLevelStore } from '@/store/levelStore';
import { useScoreStore } from '@/store/scoreStore';

interface ClickZone {
  noteId: string;
  note: Note;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ScoreRendererProps {
  score: Score;
  onNoteClick?: (note: Note) => void;
  onNoteHover?: (note: Note | null) => void;
  showPlaybackCursor?: boolean;
  playbackPosition?: number;
  className?: string;
}

export default function ScoreRenderer({
  score,
  onNoteClick,
  onNoteHover,
  showPlaybackCursor = false,
  playbackPosition = 0,
  className = '',
}: ScoreRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const clickZonesRef = useRef<ClickZone[]>([]);
  const { features } = useLevelStore();
  const setSelectedNote = useScoreStore((s) => s.setSelectedNote);

  const renderScore = useCallback(async () => {
    if (!containerRef.current || !score) return;

    // Importer VexFlow dynamiquement (évite les SSR issues)
    // VexFlow 4 exporte les classes au niveau racine du module
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const VF: any = await import('vexflow');
    const { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } = VF;

    const el = containerRef.current;
    el.innerHTML = '';

    const width = el.clientWidth || 800;
    const renderer = new Renderer(el, Renderer.Backends.SVG);
    renderer.resize(width, 180 * score.measures.length + 60);

    const context = renderer.getContext();
    context.setFont('Arial', 10);

    const stavePadding = 20;
    const staveWidth = Math.max(200, (width - stavePadding * 2) / Math.min(score.measures.length, 4));
    const staveHeight = 120;

    const clefMap: Record<string, string> = {
      treble: 'treble',
      bass: 'bass',
      alto: 'alto',
      tenor: 'tenor',
    };

    let xPos = stavePadding;
    let yPos = 30;
    let measuresPerRow = Math.floor((width - stavePadding * 2) / staveWidth);
    measuresPerRow = Math.max(1, measuresPerRow);

    clickZonesRef.current = [];

    for (let i = 0; i < score.measures.length; i++) {
      const measure = score.measures[i];
      const isFirstInRow = i % measuresPerRow === 0;
      const isFirstMeasure = i === 0;

      if (isFirstInRow && i > 0) {
        xPos = stavePadding;
        yPos += staveHeight;
      }

      const stave = new Stave(xPos, yPos, staveWidth);

      if (isFirstInRow) {
        stave.addClef(clefMap[score.clef] || 'treble');
      }
      if (isFirstMeasure) {
        stave.addTimeSignature(
          `${score.timeSignature.numerator}/${score.timeSignature.denominator}`
        );
      }

      stave.setContext(context).draw();

      // Construire les notes VexFlow
      const allNotes = [...measure.notes, ...measure.rests].sort(
        (a, b) => a.startBeat - b.startBeat
      );

      if (allNotes.length > 0) {
        try {
          const vfNotes = allNotes.map((note) => {
            const durationMap: Record<string, string> = {
              whole: 'w',
              half: 'h',
              quarter: 'q',
              eighth: '8',
              '16th': '16',
              '32nd': '32',
              '64th': '64',
            };

            const vfDuration = durationMap[note.duration] || 'q';
            const isRest = note.isRest;

            if (isRest) {
              return new StaveNote({
                keys: ['b/4'],
                duration: vfDuration + 'r',
              });
            }

            const key = `${note.name.toLowerCase()}/${note.octave}`;
            const staveNote = new StaveNote({
              keys: [key],
              duration: vfDuration,
              dots: note.dots,
            });

            if (note.accidental && note.accidental !== 'n') {
              const accMap: Record<string, string> = {
                '#': '#',
                '##': '##',
                b: 'b',
                bb: 'bb',
                n: 'n',
              };
              staveNote.addModifier(new Accidental(accMap[note.accidental] || '#'));
            }

            // Coloration (mode Découverte)
            if (features.colorCoding && NOTE_COLORS[note.solfege]) {
              staveNote.setStyle({ fillStyle: NOTE_COLORS[note.solfege] });
            }

            return staveNote;
          });

          const voice = new Voice({
            numBeats: score.timeSignature.numerator,
            beatValue: score.timeSignature.denominator,
          }).setStrict(false);

          voice.addTickables(vfNotes);
          new Formatter().joinVoices([voice]).format([voice], staveWidth - 40);
          voice.draw(context, stave);

          // Enregistrer les zones de clic
          vfNotes.forEach((vfNote, idx) => {
            const originalNote = allNotes[idx];
            if (!originalNote || originalNote.isRest) return;

            try {
              const bb = (vfNote as unknown as { getBoundingBox?: () => { x: number; y: number; w: number; h: number } }).getBoundingBox?.();
              if (bb) {
                clickZonesRef.current.push({
                  noteId: originalNote.id,
                  note: originalNote,
                  x: bb.x,
                  y: bb.y,
                  width: bb.w,
                  height: bb.h,
                });
              }
            } catch {
              // Ignorer les erreurs de bounding box
            }
          });
        } catch (err) {
          console.warn('VexFlow render error:', err);
        }
      }

      xPos += staveWidth;
    }
  }, [score, features.colorCoding]);

  useEffect(() => {
    renderScore();
  }, [renderScore]);

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => renderScore());
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [renderScore]);

  const handleSvgClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const zone = clickZonesRef.current.find(
        (z) => x >= z.x && x <= z.x + z.width && y >= z.y && y <= z.y + z.height
      );

      if (zone) {
        setSelectedNote(zone.noteId);
        onNoteClick?.(zone.note);
      }
    },
    [onNoteClick, setSelectedNote]
  );

  const handleSvgMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const zone = clickZonesRef.current.find(
        (z) => x >= z.x && x <= z.x + z.width && y >= z.y && y <= z.y + z.height
      );

      onNoteHover?.(zone?.note ?? null);
    },
    [onNoteHover]
  );

  return (
    <div className={`score-container relative ${className}`}>
      {/* VexFlow SVG container */}
      <div
        ref={containerRef}
        id="score-renderer"
        className="w-full"
      />

      {/* Overlay transparent pour les clics */}
      <div
        ref={svgContainerRef}
        className="absolute inset-0 cursor-pointer"
        onClick={handleSvgClick}
        onMouseMove={handleSvgMouseMove}
        onMouseLeave={() => onNoteHover?.(null)}
        aria-hidden="true"
      />

      {/* Curseur de lecture */}
      {showPlaybackCursor && (
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-primary-500 opacity-75 pointer-events-none transition-all"
          style={{ left: `${(playbackPosition / (score.measures.length * 4)) * 100}%` }}
        />
      )}
    </div>
  );
}
