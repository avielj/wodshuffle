import React, { useEffect, useState } from "react";
import generateWorkout from "../utils/generateWorkout";

export default function WorkoutGenerator({ muscleGroups, intensity, equipment = [], onFavorite }) {
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
    <div className="mt-8 w-full max-w-2xl bg-black/80 text-white p-6 rounded-lg shadow-lg backdrop-blur-md border border-white/10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold">Your CrossFit Workout</h2>
        {onFavorite && (
          <button
            onClick={() => onFavorite(workout)}
            className="bg-pink-600 hover:bg-pink-700 text-white px-3 py-1 rounded text-sm font-semibold shadow flex items-center gap-1"
            title="Add to Favorites"
          >
            <span role="img" aria-label="favorite">❤️</span> Favorite
          </button>
        )}
      </div>
      <div className="mb-6">
        <h3 className="text-2xl font-semibold mb-2">Warmup</h3>
        <ul className="list-disc pl-5">
          {Array.isArray(workout.warmup)
            ? workout.warmup.map((wu, idx) => (
                <li key={idx}>
                  <span className="font-medium">{wu.name}</span>: {wu.reps?.[intensity] || wu.duration?.[intensity] || wu.reps || wu.duration}
                  <br />
                  <span className="text-sm text-gray-300">Equipment: {Array.isArray(wu.equipment) ? wu.equipment.join(", ") : wu.equipment}</span>
                </li>
              ))
            : null}
        </ul>
      </div>
      <div className="mb-6">
        <h3 className="text-2xl font-semibold mb-2">Strength</h3>
        <ul className="list-disc pl-5">
          {workout.strength.length === 0 && <li className="text-gray-400">No strength exercises found for selection.</li>}
          {workout.strength.map((ex, idx) => (
            <li key={idx} className="mb-2">
              <span className="font-medium">{ex.name}</span>: {ex.sets} sets x {typeof ex.reps === 'string' ? ex.reps : ex.reps} {ex.weight && `@ ${ex.weight}`} {ex.rest && <span className="text-xs text-gray-400">(Rest: {ex.rest})</span>}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="text-2xl font-semibold mb-2">MetCon: {workout.wod.name}</h3>
        <div className="mb-2 text-blue-300 font-semibold text-lg">
          {workout.wod.type}
        </div>
        <div className="mb-2 text-white/80 italic">{workout.wod.description}</div>
        <ul className="list-disc pl-5">
          {workout.wod.exercises.map((ex, idx) => (
            <li key={idx} className="mb-2">
              {ex}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
