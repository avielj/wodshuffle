// Utility: random int in [min, max]
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper: does exercise match selected muscle groups?
const matchesMuscleGroups = (exercise, muscleGroups) => {
  if (!exercise.bodyParts) return false;
  return exercise.bodyParts.some((part) => muscleGroups.includes(part));
};

const generateWorkout = async (muscleGroups, intensity) => {
  // Fetch exercises data at runtime
  const res = await fetch('/data/exercises.json');
  const exercises = await res.json();

  // Fetch WODs data at runtime
  const wodsRes = await fetch('/data/wods.json');
  const wods = await wodsRes.json();

  // --- Warmup: filter all 50 warmups by muscle group, pick 2-3 unique ---
  const warmupList = exercises.exercises.warmup.filter((ex) => matchesMuscleGroups(ex, muscleGroups));
  const warmupCount = getRandomInt(2, 3);
  let warmupPool = warmupList.length > 0 ? [...warmupList] : [...exercises.exercises.warmup];
  const warmup = [];
  while (warmup.length < warmupCount && warmupPool.length > 0) {
    const idx = getRandomInt(0, warmupPool.length - 1);
    warmup.push(warmupPool[idx]);
    warmupPool.splice(idx, 1);
  }

  // --- Strength: 2-3 unique exercises from 'library' by selected body parts ---
  const bodyPartToLibrary = {
    upper_body_push: 'upper_push',
    upper_body_pull: 'upper_pull',
    lower_body: 'lower_body',
    core: 'core',
    full_body: 'full_body'
  };
  let strengthPool = [];
  if (muscleGroups.includes('full_body')) {
    // Use all categories if full_body selected
    strengthPool = Object.values(exercises.exercises.library).flat();
  } else {
    muscleGroups.forEach((part) => {
      const libKey = bodyPartToLibrary[part];
      if (libKey && exercises.exercises.library[libKey]) {
        strengthPool = strengthPool.concat(exercises.exercises.library[libKey]);
      }
    });
  }
  // Deduplicate by name
  const seen = new Set();
  strengthPool = strengthPool.filter((ex) => {
    if (seen.has(ex.name)) return false;
    seen.add(ex.name);
    return true;
  });
  // Randomly select 2-3
  const strengthCount = getRandomInt(2, 3);
  const strength = [];
  let pool = [...strengthPool];
  while (strength.length < strengthCount && pool.length > 0) {
    const idx = getRandomInt(0, pool.length - 1);
    const ex = pool[idx];
    strength.push({
      name: ex.name,
      sets: 5,
      reps: intensity === 'scaled' ? '8-10' : intensity === 'rx' ? '5-8' : '3-5',
      weight: intensity === 'scaled' ? 'Light' : intensity === 'rx' ? 'Moderate' : 'Heavy',
      rest: '',
    });
    pool.splice(idx, 1);
  }

  // --- WOD: randomly select from wods.json ---
  const wodIdx = getRandomInt(0, wods.length - 1);
  const wod = wods[wodIdx];

  return {
    warmup,
    strength,
    wod: {
      name: wod.name,
      type: wod.format,
      description: wod.description,
      exercises: wod.exercises,
    },
  };
};

export default generateWorkout;
