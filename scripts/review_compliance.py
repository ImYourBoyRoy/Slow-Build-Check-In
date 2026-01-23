# ./scripts/review_compliance.py
"""
Script to REVIEW a questions.json file against SCHEMA.md and TEMPLATE_questions.json rules.
Does not modify files. Validates structure, references, and schema types.

Usage:
    python scripts/review_compliance.py --phase phase_0
"""

import json
import argparse
from pathlib import Path
import sys
from typing import List, Dict, Any, Set

def load_json(path: Path) -> Dict[str, Any]:
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def check_structure(data: Dict[str, Any]) -> List[str]:
    errors = []
    required_roots = ["sections", "questions", "manifests", "primary_manifest_id"]
    for root in required_roots:
        if root not in data:
            errors.append(f"Missing root key: '{root}'")
    return errors

def check_referential_integrity(data: Dict[str, Any]) -> List[str]:
    errors = []
    questions = data.get("questions", {})
    sections = data.get("sections", [])
    manifests = data.get("manifests", {})

    q_ids = set(questions.keys())
    s_ids = {s["id"] for s in sections}
    
    # 1. Check Section Integrity
    section_q_ids = set()
    for s in sections:
        for qid in s.get("question_ids", []):
            section_q_ids.add(qid)
            if qid not in q_ids:
                errors.append(f"Section '{s['id']}' references missing question: '{qid}'")
    
    # Check if all questions belong to a section (optional but good practice)
    # diff = q_ids - section_q_ids
    # if diff:
    #     errors.append(f"Questions not in any section: {diff}")

    # 2. Check Question -> Section link
    for qid, q in questions.items():
        sid = q.get("section_id")
        if sid not in s_ids:
            errors.append(f"Question '{qid}' references invalid section_id: '{sid}'")

    # 3. Check Manifest Integrity
    for m_name, m_data in manifests.items():
        for qid in m_data.get("question_ids", []):
            if qid not in q_ids:
                errors.append(f"Manifest '{m_name}' references missing question: '{qid}'")

    return errors

def check_question_schema(q: Dict[str, Any], qid: str) -> List[str]:
    errors = []
    q_type = q.get("type")
    schema = q.get("answer_schema", {})
    
    if not isinstance(schema, dict):
        errors.append(f"[{qid}] answer_schema must be a dictionary.")
        return errors

    schema_keys = set(schema.keys())

    # Rules derived from SCHEMA.md
    if q_type == "free_text":
        if "text" not in schema_keys:
            errors.append(f"[{qid}] free_text schema missing 'text' key.")

    elif q_type == "single_select":
        required = {"selected_value"}
        # SCHEMA.md lines 188-192 imply notes/other_text are standard, but possibly optional?
        # Template includes them. Let's strictly check for selected_value at minimum.
        if not required.issubset(schema_keys):
            errors.append(f"[{qid}] single_select schema missing required keys: {required - schema_keys}")
        
        # Check alignment with options
        options = q.get("options", [])
        has_other = any(opt.get("value") == "other" for opt in options)
        if has_other and "other_text" not in schema_keys:
             errors.append(f"[{qid}] Has 'other' option but missing 'other_text' in schema.")

    elif q_type == "multi_select":
        required = {"selected_values"}
        if not required.issubset(schema_keys):
            errors.append(f"[{qid}] multi_select schema missing required keys: {required - schema_keys}")
        
        options = q.get("options", [])
        has_other = any(opt.get("value") == "other" for opt in options)
        if has_other and "other_text" not in schema_keys:
             errors.append(f"[{qid}] Has 'other' option but missing 'other_text' in schema.")

    elif q_type == "compound":
        # Strict mapping: Fields -> Schema
        field_keys = {f.get("key") for f in q.get("fields", [])}
        
        missing_in_schema = field_keys - schema_keys
        extra_in_schema = schema_keys - field_keys
        
        if missing_in_schema:
            errors.append(f"[{qid}] Compound schema missing keys defined in fields: {missing_in_schema}")
        if extra_in_schema:
            errors.append(f"[{qid}] Compound schema has extra keys not in fields: {extra_in_schema}")

    return errors

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--phase', required=True, help='Phase directory name (e.g. phase_0)')
    args = parser.parse_args()

    root = Path(__file__).parent.parent
    data_dir = root / "data"
    phase_dir = data_dir / args.phase
    questions_file = phase_dir / "questions.json"

    if not questions_file.exists():
        print(f"Error: {questions_file} not found.")
        sys.exit(1)

    print(f"Reviewing {phase_dir.name}...")
    try:
        data = load_json(questions_file)
    except json.JSONDecodeError as e:
        print(f"CRITICAL: invalid JSON in {questions_file}: {e}")
        sys.exit(1)

    all_errors = []
    
    # 1. Structure
    all_errors.extend(check_structure(data))
    
    # 2. Integrity
    all_errors.extend(check_referential_integrity(data))
    
    # 3. Question Schemas
    questions = data.get("questions", {})
    for qid, q in questions.items():
        all_errors.extend(check_question_schema(q, qid))

    if all_errors:
        print(f"FOUND {len(all_errors)} ISSUES in {args.phase}:")
        for err in all_errors:
            print(f"  - {err}")
        sys.exit(1)
    else:
        print(f"SUCCESS: {args.phase} is fully compliant with SCHEMA.md rules.")
        sys.exit(0)

if __name__ == "__main__":
    main()
