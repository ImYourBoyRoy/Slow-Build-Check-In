# ./scripts/find_schema_mismatches_generic.py
"""
Find Schema Mismatches (Generic)
================================

Checks for discrepancies between 'answer_schema' keys and 'fields' keys 
in compound questions for a specific phase.

Usage:
    python scripts/find_schema_mismatches_generic.py --phase phase_0
"""

import json
import argparse
from pathlib import Path
import sys

def check_phase(phase_dir):
    questions_file = phase_dir / "questions.json"
    if not questions_file.exists():
        # Maybe it's a txt file or different structure for some phases?
        # Based on file listing: phase_0_questions.txt exists but phase_0/questions.json might not?
        # Let's check if it exists, if not warn.
        print(f"Warning: {questions_file} not found. Trying text file?")
        return

    try:
        with open(questions_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error reading {questions_file}: {e}")
        return

    questions = data.get('questions', {})
    print(f"Checking {phase_dir.name}...")

    issues_found = 0
    for qid, q in questions.items():
        q_type = q.get('type')
        schema_keys = set(q.get('answer_schema', {}).keys())
        expected_keys = set()
        
        if q_type == 'compound':
            for field in q.get('fields', []):
                expected_keys.add(field.get('key'))
        elif q_type == 'single_select':
            expected_keys.add('selected_value')
            # Check if 'other' is an option
            if any(opt.get('value') == 'other' for opt in q.get('options', [])):
                expected_keys.add('other_text')
        elif q_type == 'multi_select':
            expected_keys.add('selected_values')
            # Check if 'other' is an option
            if any(opt.get('value') == 'other' for opt in q.get('options', [])):
                expected_keys.add('other_text')
        else:
            # Skip unknown types for now
            continue

        missing_in_schema = expected_keys - schema_keys
        extra_in_schema = schema_keys - expected_keys
        
        if missing_in_schema or extra_in_schema:
            issues_found += 1
            print(f"\n[MISMATCH] {qid}: {q.get('title')} ({q_type})")
            if missing_in_schema:
                print(f"  Missing from Schema: {missing_in_schema}")
            if extra_in_schema:
                print(f"  Extra in Schema (should remove?): {extra_in_schema}")

    if issues_found == 0:
        print(f"  No mismatches found in {phase_dir.name}.")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--phase', required=True, help='Phase directory name (e.g. phase_0)')
    args = parser.parse_args()

    root = Path(__file__).parent.parent
    data_dir = root / "data"
    phase_dir = data_dir / args.phase
    
    if not phase_dir.exists():
        print(f"Phase directory {phase_dir} does not exist.")
        sys.exit(1)

    check_phase(phase_dir)

if __name__ == "__main__":
    main()
