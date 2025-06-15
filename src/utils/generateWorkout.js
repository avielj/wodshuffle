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

  // --- Warmup: always bodyweight, 2-3 exercises ---
  const warmupList = exercises.exercises.warmup.filter(
    (ex) => (!ex.equipment || ex.equipment.includes('none') || ex.equipment.includes('bodyweight'))
  );
  const warmupCount = Math.max(2, Math.min(3, warmupList.length));
  let warmupPool = [...warmupList];
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
  // Fallback: if no matches, pick random from all selected muscle groups
  if (strengthPool.length === 0 && muscleGroups.length > 0) {
    let all = [];
    muscleGroups.forEach((part) => {
      const libKey = bodyPartToLibrary[part];
      if (libKey && exercises.exercises.library[libKey]) {
        all = all.concat(exercises.exercises.library[libKey]);
      }
    });
    // Remove duplicates
    const seen2 = new Set();
    strengthPool = all.filter((ex) => {
      if (seen2.has(ex.name)) return false;
      seen2.add(ex.name);
      return true;
    });
  }
  // Fallback: if still empty, pick random from all available
  if (strengthPool.length === 0) {
    strengthPool = Object.values(exercises.exercises.library).flat();
  }
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

  // If metconOnly, return just the WOD (MetCon) portion
  if (custom.metconOnly) {
    return {
      warmup: [],
      strength: [],
      wod: {
        name: wod.name,
        type: wod.format,
        description: wod.description,
        exercises: wod.exercises,
      },
    };
  }

  // If swapMetcon is true, pick a new random WOD (MetCon) only
  if (custom.swapMetcon) {
    let newIdx = wodIdx;
    while (filteredWods.length > 1 && newIdx === wodIdx) {
      newIdx = getRandomInt(0, filteredWods.length - 1);
    }
    wod = filteredWods[newIdx];
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
