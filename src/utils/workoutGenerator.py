import random
import json
import uuid

def generate_workout(body_parts, intensity):
    with open('public/data/exercises.json', 'r') as f:
        exercises = json.load(f)
    with open('public/data/benchmarks.json', 'r') as f:
        benchmarks = json.load(f)

    warmup_pool = [e for e in exercises['exercises']['warmup'] if any(bp in e['bodyParts'] for bp in body_parts)]
    strength_pool = [e for e in exercises['exercises']['strength'] if any(bp in e['bodyParts'] for bp in body_parts)]
    metcon_pool = [e for e in exercises['exercises']['metcon'] if any(bp in e['bodyParts'] for bp in body_parts)]
    benchmark_pool = [b for b in benchmarks if any(bp in b['bodyParts'] for bp in body_parts)]

    warmup = random.sample(warmup_pool, min(len(warmup_pool), random.randint(3, 5)))
    warmup = [{"exerciseId": e["id"], "name": e["name"], "duration": e["duration"]} for e in warmup]

    strength = random.sample(strength_pool, min(len(strength_pool), random.randint(1, 2)))
    strength = [{
        "exerciseId": e["id"],
        "name": e["name"],
        "sets": e["sets"],
        "reps": e["reps"][intensity],
        "rest": e["rest"]
    } for e in strength]

    metcon = random.choice(metcon_pool)
    custom_metcon = {
        "id": metcon["id"],
        "name": metcon["name"],
        "structure": [
            {"exercise": s["exercise"], "reps": s["reps"][intensity]} for s in metcon["structure"]
        ]
    }

    benchmark = random.choice(benchmark_pool) if benchmark_pool else None
    benchmark_metcon = {
        "id": benchmark["id"],
        "name": benchmark["name"],
        "description": benchmark["intensity"][intensity]
    } if benchmark else None

    workout = {
        "id": str(uuid.uuid4()),
        "date": "2025-06-14",
        "bodyParts": body_parts,
        "intensity": intensity,
        "warmup": warmup,
        "strength": strength,
        "metcon": {
            "custom": custom_metcon,
            "benchmark": benchmark_metcon
        }
    }
    return workout
