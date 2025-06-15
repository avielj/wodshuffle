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

const generateWorkout = async (muscleGroups, intensity, equipment = [], custom = {}) => {
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
  let wodIdx = getRandomInt(0, filteredWods.length - 1);
  let wod = filteredWods[wodIdx];

  // Apply swap logic if requested
  if (custom.swapIdx !== undefined && custom.swapIdx !== null && Array.isArray(wod.exercises)) {
    // Try to swap the exercise at swapIdx with another random exercise from the same pool
    const allExercises = Object.values(exercises.exercises.library).flat();
    const currentEx = wod.exercises[custom.swapIdx];
    // Find a replacement not already in the WOD
    const available = allExercises.filter(e => !wod.exercises.some(wex => wex.toLowerCase().includes(e.name.toLowerCase())));
    if (available.length > 0) {
      const swapEx = available[getRandomInt(0, available.length - 1)];
      wod = {
        ...wod,
        exercises: wod.exercises.map((ex, i) => i === custom.swapIdx ? swapEx.name : ex)
      };
    }
  }

  // Apply rounds, time cap, rep scheme customizations
  let wodType = wod.format;
  if (custom.rounds) wodType = `${custom.rounds} rounds for time`;
  if (custom.timeCap) wodType += ` (Time cap: ${custom.timeCap} min)`;
  if (custom.repScheme && custom.repScheme !== 'Custom') wodType += `, Rep scheme: ${custom.repScheme}`;

  return {
    warmup,
    strength,
    wod: {
      name: wod.name,
      type: wodType,
      description: wod.description,
      exercises: wod.exercises,
    },
  };
};

export default generateWorkout;
