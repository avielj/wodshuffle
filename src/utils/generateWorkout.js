// Utility: random int in [min, max]
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper: does exercise match selected muscle groups?
const matchesMuscleGroups = (exercise, muscleGroups) => {
  if (!exercise.bodyParts) return false;
  return exercise.bodyParts.some((part) => muscleGroups.includes(part));
};

const matchesEquipment = (exercise, selectedEquipment) => {
  if (!selectedEquipment || selectedEquipment.length === 0) return true;
  if (!exercise.equipment) return selectedEquipment.includes('bodyweight');
  // Accept if any selected equipment matches
  return exercise.equipment.some(eq => selectedEquipment.includes(eq.toLowerCase()));
};

const generateWorkout = async (muscleGroups, intensity, equipment = []) => {
  // Fetch exercises data at runtime
  const res = await fetch('/data/exercises.json');
  const exercises = await res.json();

  // Fetch WODs data at runtime
  const wodsRes = await fetch('/data/wods.json');
  const wods = await wodsRes.json();

  // --- Warmup: filter by muscle group and equipment ---
  const warmupList = exercises.exercises.warmup.filter(
    (ex) => matchesMuscleGroups(ex, muscleGroups) && matchesEquipment(ex, equipment)
  );
  const warmupCount = getRandomInt(2, 3);
  let warmupPool = warmupList.length > 0 ? [...warmupList] : exercises.exercises.warmup.filter(ex => matchesEquipment(ex, equipment));
  const warmup = [];
  while (warmup.length < warmupCount && warmupPool.length > 0) {
    const idx = getRandomInt(0, warmupPool.length - 1);
    warmup.push(warmupPool[idx]);
    warmupPool.splice(idx, 1);
  }

  // --- Strength: filter by equipment ---
  const bodyPartToLibrary = {
    upper_body_push: 'upper_push',
    upper_body_pull: 'upper_pull',
    lower_body: 'lower_body',
    core: 'core',
    full_body: 'full_body'
  };
  let strengthPool = [];
  if (muscleGroups.includes('full_body')) {
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
    return matchesEquipment(ex, equipment);
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

  // --- WOD: randomly select from wods.json, filter by equipment if possible ---
  let filteredWods = wods;
  if (equipment && equipment.length > 0) {
    filteredWods = wods.filter(wod => {
      if (!wod.equipment) return equipment.includes('bodyweight');
      return wod.equipment.some(eq => equipment.includes(eq.toLowerCase()));
    });
    if (filteredWods.length === 0) filteredWods = wods;
  }
  const wodIdx = getRandomInt(0, filteredWods.length - 1);
  const wod = filteredWods[wodIdx];

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
