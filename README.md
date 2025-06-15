# WOD Shuffler

A Next.js app for generating custom CrossFit workouts. Select your target muscle groups and intensity, and WOD Shuffler generates a personalized workout with warmup, strength, and metcon sections, including benchmark suggestions. Built with Next.js, Tailwind CSS, and Pyodide.

## Features
- Select up to 3 body parts
- Choose intensity (Scaled, Rx, Athlete)
- Generates warmup, strength, and metcon sections
- Suggests benchmark metcons
- Stores preferences in LocalStorage
- Runs entirely in the browser

## Tech Stack
- Next.js (React framework)
- Tailwind CSS
- Pyodide (Python in browser)
- LocalStorage

## Data
- `public/data/bodyParts.json`
- `public/data/exercises.json`
- `public/data/benchmarks.json`

## Development
```bash
npm install
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) to use the app.

## Deployment
Deploy instantly to Vercel by connecting this repo and following the Vercel setup instructions.
