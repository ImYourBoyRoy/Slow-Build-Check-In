
# ./scripts/validate_manifest_ids.py
"""
Validates that all question IDs listed in manifest.json (lite/full/sections)
actually exist in the corresponding questions.json file.
"""

import json
import os
import sys
from pathlib import Path

def validate_manifest(manifest_path):
    folder = manifest_path.parent
    questions_path = folder / "questions.json"
    
    if not questions_path.exists():
        return [f"Missing questions.json in {folder}"]

    try:
        with open(manifest_path, 'r', encoding='utf-8') as f:
            manifest_data = json.load(f)
        with open(questions_path, 'r', encoding='utf-8') as f:
            questions_data = json.load(f)
    except Exception as e:
        return [f"JSON Load Error: {e}"]

    defined_q_ids = set(questions_data.get("questions", {}).keys())
    errors = []

    # Check manifests (lite/full) - assuming structure based on Phase Closure/Phase 0
    # Note: Structure might vary, so we check various common keys
    
    manifests_block = questions_data.get("manifests", {}) # Sometimes in questions.json? 
    # Wait, in the Phase Closure example earlier, 'manifests' block was in questions.json, NOT manifest.json!
    # Let's check where the manifest IDs are stored.
    # In Phase Closure questions.json (Step 13):
    # "manifests": { "lite": { "question_ids": [...] }, "full": { ... } }
    # So actually, we should be auditing questions.json internal consistency too.
    
    # Let's check the file named 'manifest.json' to see what it contains.
    # In Step 7, data/phase_closure/manifest.json contained metadata (display, artifact, intro), 
    # NOT the lists of questions. 
    
    # So the "manifest" of questions is actually inside `questions.json`.
    # I should validate internal referential integrity of `questions.json`.
    
    # 1. Check 'manifests' block in questions.json
    manifests = questions_data.get("manifests", {})
    for m_name, m_data in manifests.items():
        q_ids = m_data.get("question_ids", [])
        for qid in q_ids:
            if qid not in defined_q_ids:
                errors.append(f"Manifest '{m_name}' references undefined ID '{qid}'")

    # 2. Check 'sections' block in questions.json
    sections = questions_data.get("sections", [])
    for section in sections:
        s_id = section.get("id")
        q_ids = section.get("question_ids", [])
        for qid in q_ids:
            if qid not in defined_q_ids:
                errors.append(f"Section '{s_id}' references undefined ID '{qid}'")

    return errors

def main():
    root_dir = Path("./data")
    questions_files = list(root_dir.rglob("questions.json"))
    
    total_errors = 0
    print(f"Scanning {len(questions_files)} questions.json files for integrity...")
    
    for f in questions_files:
        rel_path = f.relative_to(root_dir.parent)
        # print(f"Scanning: {rel_path}")
        errors = validate_manifest(f) # We pass questions.json path logic
        
        if errors:
            print(f"\nIssues in {rel_path}:")
            for err in errors:
                print(f"  [X] {err}")
            total_errors += len(errors)
            
    if total_errors > 0:
        print(f"\nFAILED: Found {total_errors} integrity issues.")
        sys.exit(1)
    else:
        print("\nSUCCESS: All manifests valid.")
        sys.exit(0)

if __name__ == "__main__":
    main()
