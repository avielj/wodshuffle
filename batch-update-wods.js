// This script will batch update wods.json to add an 'equipment' field to each WOD, using the exercise-to-equipment mapping from exercises.json.
// It will be run once, and the output will be pasted back into wods.json.

const fs = require('fs');
const path = require('path');

const wodsPath = path.join(__dirname, 'public/data/wods.json');
const exercisesPath = path.join(__dirname, 'public/data/exercises.json');

const wods = JSON.parse(fs.readFileSync(wodsPath, 'utf8'));
const exercisesData = JSON.parse(fs.readFileSync(exercisesPath, 'utf8'));

// Build a flat map of exercise name (lowercase, stripped of reps/weights) => equipment
function normalizeName(name) {
  return name
    .replace(/\d+|lb[s]?|pood|inch|meter|mile|yard|calories|reps?|@|\(|\)|-|:|,|\./gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

const equipmentMap = {};
for (const section of Object.values(exercisesData.exercises.library)) {
  for (const ex of section) {
    equipmentMap[normalizeName(ex.name)] = ex.equipment;
  }
}
// Add warmup/strength/metcon top-level exercises
for (const section of ['warmup', 'strength', 'metcon']) {
  for (const ex of exercisesData.exercises[section] || []) {
    equipmentMap[normalizeName(ex.name)] = ex.equipment;
  }
}

function getEquipmentForExercise(exName) {
  // Remove rep/weight info, match to library
  const norm = normalizeName(exName);
  // Try to find a direct match
  if (equipmentMap[norm]) return equipmentMap[norm];
  // Try partial match
  for (const key of Object.keys(equipmentMap)) {
    if (norm.includes(key) || key.includes(norm)) return equipmentMap[key];
  }
  // Fallbacks for common bodyweight/cardio
  if (/run|row|bike|swim|sprint/.test(norm)) return ['none'];
  if (/burpee|push-up|pull-up|sit-up|squat|lunge|plank|jump/.test(norm)) return ['bodyweight'];
  return ['unknown'];
}

const updatedWods = wods.map(wod => {
  const allEquipment = new Set();
  for (const ex of wod.exercises) {
    getEquipmentForExercise(ex).forEach(eq => allEquipment.add(eq));
  }
  return { ...wod, equipment: Array.from(allEquipment) };
});

fs.writeFileSync(wodsPath, JSON.stringify(updatedWods, null, 2));
console.log('WODs updated with equipment fields!');
