# ./scripts/export_questions.py
"""
Script to export questions from questions.json into individual JSON files.
This script reads the monolithic questions.json file and creates a separate JSON file
for each question in the 'questions' object.

Usage:
    python scripts/export_questions.py

Outputs:
    New directory data/phase_0/questions/ populated with qXX.json files.
"""

import json
import os
import sys

def main():
    # Define paths
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    source_file = os.path.join(base_dir, 'data', 'phase_0', 'questions.json')
    target_dir = os.path.join(base_dir, 'data', 'phase_0', 'questions')

    print(f"Source file: {source_file}")
    print(f"Target directory: {target_dir}")

    # Check if source file exists
    if not os.path.exists(source_file):
        print(f"Error: Source file not found at {source_file}")
        sys.exit(1)

    # Create target directory if it doesn't exist
    if not os.path.exists(target_dir):
        try:
            os.makedirs(target_dir)
            print(f"Created directory: {target_dir}")
        except OSError as e:
            print(f"Error creating directory: {e}")
            sys.exit(1)

    # Read the source JSON
    try:
        with open(source_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Error reading file: {e}")
        sys.exit(1)

    # Extract questions
    questions = data.get('questions', {})
    if not questions:
        print("No 'questions' section found in the source file.")
        sys.exit(0)

    print(f"Found {len(questions)} questions to export.")

    # Export each question
    success_count = 0
    for q_id, q_data in questions.items():
        try:
            filename = f"{q_id}.json"
            filepath = os.path.join(target_dir, filename)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(q_data, f, indent=2, ensure_ascii=False)
            
            # Print a dot for progress, flush stdout
            print(".", end="", flush=True)
            success_count += 1
        except Exception as e:
            print(f"\nError exporting {q_id}: {e}")

    print(f"\n\nExport complete. {success_count} files created in {target_dir}")

if __name__ == "__main__":
    main()
