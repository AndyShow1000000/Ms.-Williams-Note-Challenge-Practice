import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Renderer, Stave, StaveNote } from 'vexflow';

const NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

export default function NoteTrainer() {
  const containerRef = useRef(null);
  const [currentNote, setCurrentNote] = useState('C'); // Current note to guess
  const [noteIndex, setNoteIndex] = useState(0); // How many notes answered
  const [input, setInput] = useState(''); // User input
  const [startTime, setStartTime] = useState(null); // Timer start
  const [endTime, setEndTime] = useState(null); // Timer end
  const [finished, setFinished] = useState(false); // Has game finished?
  const [countdown, setCountdown] = useState(3); // Countdown before game starts
  const [gameStarted, setGameStarted] = useState(false); // Is game active?
  const [totalNotes, setTotalNotes] = useState(10); // Total number of notes in the game

  // Draw the note on the staff using VexFlow
  const drawNote = (note) => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';
    const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);
    renderer.resize(200, 150);
    const context = renderer.getContext();
    const stave = new Stave(10, 40, 180);
    stave.addClef('treble').setContext(context).draw();

    const staveNote = new StaveNote({ clef: 'treble', keys: [`${note.toLowerCase()}/4`], duration: 'q' });
    staveNote.setContext(context).draw();
  };

  // Move to the next note
  const nextNote = () => {
    if (noteIndex + 1 >= totalNotes) {
      setEndTime(Date.now());
      setFinished(true);
      return;
    }
    const randomNote = NOTES[Math.floor(Math.random() * NOTES.length)];
    setCurrentNote(randomNote);
    setNoteIndex(noteIndex + 1);
  };

  // Handle note input submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!gameStarted) return;
    const userInput = input.trim().toUpperCase();
    if (userInput === currentNote.toUpperCase()) {
      setInput('');
      nextNote();
    } else {
      alert('Incorrect. Try again.');
    }
  };

  // Automatically start the game after countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !gameStarted) {
      setStartTime(Date.now());
      setGameStarted(true);
    }
  }, [countdown, gameStarted]);

  // Automatically submit when input reaches 1 character
  useEffect(() => {
    if (input.length === 1) {
      const fakeEvent = { preventDefault: () => {} };
      handleSubmit(fakeEvent);
    }
  }, [input]);

  // Redraw note when currentNote changes
  useEffect(() => {
    drawNote(currentNote);
  }, [currentNote]);

  return (
    <div className="p-4 max-w-md mx-auto">
      <Card>
        <CardContent className="p-4">
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Total Notes:</label>
            <Input
              type="number"
              min={1}
              value={totalNotes}
              onChange={(e) => setTotalNotes(Number(e.target.value))}
              disabled={gameStarted || finished}
            />
          </div>
          <div ref={containerRef} className="mb-4"></div>
          {!finished ? (
            !gameStarted ? (
              <div className="text-center text-lg font-semibold">
                Starting in {countdown}...
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-2 items-center">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter note (A-G)"
                  maxLength={1}
                  disabled={!gameStarted}
                />
              </form>
            )
          ) : (
            <div className="text-center text-lg font-semibold">
              Finished in {((endTime - startTime) / 1000).toFixed(2)} seconds!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
