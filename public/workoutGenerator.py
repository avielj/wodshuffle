import random
import json
import uuid
from datetime import date

def generate_workout(body_parts, intensity):
    with open('public/data/exercises.json', 'r') as f:
        exercises = json.load(f)
    with open('public/data/wods.json', 'r') as f:
        wods = json.load(f)

    # --- Strength: Random from library ---
    library = exercises['exercises']['library']
    all_strength = []
    for group in library.values():
        all_strength.extend(group)
    strength_choices = random.sample(all_strength, k=2)
    strength = [{
        "name": e["name"],
        "muscles": e["muscles"]
    } for e in strength_choices]

    # --- Metcon: Random from WODs ---
    metcon = random.choice(wods)
    metcon_struct = {
        "name": metcon["name"],
        "type": metcon.get("type", ""),
        "description": metcon.get("description", ""),
        "exercises": metcon.get("exercises", []),
        "format": metcon.get("format", "")
    }

    # --- Warmup: Randomly select 3-5 from warmup pool ---
    warmup_pool = exercises['exercises'].get('warmup', [])
    warmup_count = min(len(warmup_pool), random.randint(3, 5))
    warmup_choices = random.sample(warmup_pool, k=warmup_count) if warmup_pool else []
    warmup = [{
        "name": w["name"],
        "duration": w.get("duration", "30 seconds")
    } for w in warmup_choices]

    workout = {
        "id": str(uuid.uuid4()),
        "date": str(date.today()),
        "bodyParts": body_parts,
        "intensity": intensity,
        "warmup": warmup,
        "strength": strength,
        "metcon": metcon_struct
    }
    return workout
