// Prisma seed script to push all warmups, strength, metcon, library exercises, and WODs to the database with progress logging
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';

const prisma = new PrismaClient();

async function main() {
  // Load exercises
  const exercisesRaw = await fs.readFile('./public/data/exercises.json', 'utf-8');
  const exercisesData = JSON.parse(exercisesRaw).exercises;

  // Seed warmups
  console.log('Seeding warmups...');
  let warmupCount = 0;
  for (const ex of exercisesData.warmup) {
    await prisma.exercise.upsert({
      where: { name: ex.name },
      update: {},
      create: {
        name: ex.name,
        bodyParts: ex.bodyParts || [],
        duration: ex.duration || null,
        reps: ex.reps ? ex.reps : null,
        equipment: ex.equipment || [],
        intensity: ex.intensity ? ex.intensity : null,
        progression: ex.progression || null,
        demo: ex.demo || null,
        type: 'warmup',
      },
    });
    warmupCount++;
  }
  console.log(`Seeded ${warmupCount} warmups.`);

  // Seed strength exercises
  console.log('Seeding strength exercises...');
  let strengthCount = 0;
  for (const ex of exercisesData.strength) {
    await prisma.exercise.upsert({
      where: { name: ex.name },
      update: {},
      create: {
        name: ex.name,
        bodyParts: ex.bodyParts || [],
        duration: ex.duration || null,
        reps: ex.reps ? ex.reps : null,
        equipment: ex.equipment || [],
        intensity: ex.intensity ? ex.intensity : null,
        progression: ex.progression || null,
        demo: ex.demo || null,
        type: 'strength',
      },
    });
    strengthCount++;
  }
  console.log(`Seeded ${strengthCount} strength exercises.`);

  // Seed metcon exercises
  console.log('Seeding metcon exercises...');
  let metconCount = 0;
  for (const ex of exercisesData.metcon) {
    await prisma.exercise.upsert({
      where: { name: ex.name },
      update: {},
      create: {
        name: ex.name,
        bodyParts: ex.bodyParts || [],
        duration: ex.duration || null,
        reps: ex.reps ? ex.reps : null,
        equipment: ex.equipment || [],
        intensity: ex.intensity ? ex.intensity : null,
        progression: ex.progression || null,
        demo: ex.demo || null,
        type: 'metcon',
      },
    });
    metconCount++;
  }
  console.log(`Seeded ${metconCount} metcon exercises.`);

  // Seed library exercises
  console.log('Seeding library exercises...');
  let libraryCount = 0;
  for (const [libKey, libArr] of Object.entries(exercisesData.library)) {
    for (const ex of libArr) {
      await prisma.exercise.upsert({
        where: { name: ex.name },
        update: {},
        create: {
          name: ex.name,
          bodyParts: ex.bodyParts || ex.muscles || [],
          duration: ex.duration || null,
          reps: ex.reps ? ex.reps : null,
          equipment: ex.equipment || [],
          intensity: ex.intensity ? ex.intensity : null,
          progression: ex.progression || null,
          demo: ex.demo || null,
          type: 'library',
        },
      });
      libraryCount++;
    }
  }
  console.log(`Seeded ${libraryCount} library exercises.`);

  // Seed WODs
  console.log('Seeding WODs...');
  const wodsRaw = await fs.readFile('./public/data/wods.json', 'utf-8');
  const wodsData = JSON.parse(wodsRaw);
  let wodCount = 0;
  for (const wod of wodsData) {
    await prisma.wod.upsert({
      where: { name: wod.name },
      update: {},
      create: {
        name: wod.name,
        format: wod.format,
        description: wod.description,
        exercises: wod.exercises,
        equipment: wod.equipment || [],
      },
    });
    wodCount++;
    if (wodCount % 100 === 0) console.log(`Seeded ${wodCount} WODs...`);
  }
  console.log(`Seeded ${wodCount} WODs.`);

  // Print total counts from DB
  const [dbWarmups, dbStrength, dbMetcon, dbLibrary, dbWods] = await Promise.all([
    prisma.exercise.count({ where: { type: 'warmup' } }),
    prisma.exercise.count({ where: { type: 'strength' } }),
    prisma.exercise.count({ where: { type: 'metcon' } }),
    prisma.exercise.count({ where: { type: 'library' } }),
    prisma.wod.count(),
  ]);
  console.log(`\nDB Totals:`);
  console.log(`Warmups:   ${dbWarmups}`);
  console.log(`Strength:  ${dbStrength}`);
  console.log(`Metcon:    ${dbMetcon}`);
  console.log(`Library:   ${dbLibrary}`);
  console.log(`WODs:      ${dbWods}`);
}

main()
  .then(() => {
    console.log('Seed complete');
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect();
  });
