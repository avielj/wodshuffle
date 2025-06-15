import React, { useEffect, useState } from "react";
import generateWorkout from "../utils/generateWorkout";
import html2canvas from "html2canvas";

export default function WorkoutGenerator({ muscleGroups, intensity, equipment = [], onGenerate }) {
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regenKey, setRegenKey] = useState(0);

  useEffect(() => {
    setRegenKey((k) => k + 1);
  }, [muscleGroups, intensity]);

  const handleRegenerate = () => setRegenKey((k) => k + 1);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    generateWorkout(muscleGroups, intensity, equipment)
      .then((wod) => {
        if (isMounted) {
          setWorkout(wod);
          setLoading(false);
          if (onGenerate) onGenerate(wod);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError("Failed to load workout data.");
          setLoading(false);
        }
      });
    return () => { isMounted = false; };
  }, [muscleGroups, intensity, equipment, regenKey]);

  if (loading) return <div className="mt-8 text-center text-lg text-blue-400">Generating your workout...</div>;
  if (error) return <div className="mt-8 text-center text-red-500">{error}</div>;
  if (!workout) return null;

  return (
    <div id="wod-card" className="w-full max-w-xl mx-auto bg-white/5 rounded-xl border border-white/10 p-2 sm:p-4 mb-4 glassy fade-in relative">
      <div className="absolute bottom-2 right-4 text-xs text-white/40 select-none">wodshuffler.app</div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold">Your CrossFit Workout</h2>
      </div>
      <div className="mb-6">
        <h3 className="text-2xl font-semibold mb-2">Warmup</h3>
        <ul className="list-disc pl-5">
          {Array.isArray(workout.warmup)
            ? workout.warmup.map((wu, idx) => (
                <li key={idx} className="fade-in">
                  <span className="font-medium">{wu.name}</span>: {wu.reps?.[intensity] || wu.duration?.[intensity] || wu.reps || wu.duration}
                  <br />
                  <span className="text-sm text-gray-300">Equipment: {Array.isArray(wu.equipment) ? wu.equipment.join(", ") : wu.equipment}</span>
                  {wu.progression && (
                    <div className="text-xs text-green-300 mt-1">Progression: {wu.progression}</div>
                  )}
                </li>
              ))
            : null}
        </ul>
      </div>
      <div className="mb-6">
        <h3 className="text-2xl font-semibold mb-2">Strength</h3>
        <ul className="list-disc pl-5">
          {workout.strength.length === 0 && <li className="text-gray-400 fade-in">No strength exercises found for selection.</li>}
          {workout.strength.map((ex, idx) => (
            <li key={idx} className="mb-2 fade-in">
              <span className="font-medium">{ex.name}</span>: {ex.sets} sets x {typeof ex.reps === 'string' ? ex.reps : ex.reps} {ex.weight && `@ ${ex.weight}`} {ex.rest && <span className="text-xs text-gray-400">(Rest: {ex.rest})</span>}
              {ex.progression && (
                <div className="text-xs text-green-300 mt-1">Progression: {ex.progression}</div>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-2xl font-semibold">MetCon: {workout.wod.name}</h3>
        </div>
        <div className="mb-2 text-blue-300 font-semibold text-lg">
          {workout.wod.type}
        </div>
        <div className="mb-2 text-white/80 italic">{workout.wod.description}</div>
        <ul className="list-disc pl-5">
          {workout.wod.exercises.map((ex, idx) => (
            <li key={idx} className="mb-2 flex items-center gap-2 fade-in">
              {ex}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
