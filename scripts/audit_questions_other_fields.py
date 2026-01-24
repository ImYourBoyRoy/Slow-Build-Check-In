
# ./scripts/audit_questions_other_fields.py
"""
Audits all questions.json files to ensure that any 'Other' option
in a single_select or multi_select question has a corresponding
text input field (e.g. 'other_text') and correct visibility logic.
"""

import json
import os
import sys
from pathlib import Path

def audit_file(filepath):
    """
    Audits a single questions.json file.
    Returns a list of error strings.
    """
    errors = []
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        return [f"ERROR: Could not load JSON: {e}"]

    questions = data.get("questions", {})
    if not questions:
        return []

    for q_id, q_data in questions.items():
        q_type = q_data.get("type")
        
        # We need to collect all field keys to check for 'other_text' availability
        all_field_keys = []
        if "fields" in q_data:
            all_field_keys = [field.get("key") for field in q_data["fields"]]
        
        # Check standard single/multi select
        if q_type in ["single_select", "multi_select"]:
            options = q_data.get("options", [])
            has_other = any(opt.get("value") == "other" for opt in options)
            
            if has_other:
                # Check answer schema using a simpler heuristic if explicit fields aren't defined
                schema = q_data.get("answer_schema", {})
                if "other_text" not in schema:
                    errors.append(f"[{q_id}] 'other' option exists, but 'other_text' missing from answer_schema")
        
        # Check compound questions
        elif q_type == "compound":
            fields = q_data.get("fields", [])
            
            # Map of fields that have an 'other' option
            fields_with_other = []
            
            for field in fields:
                f_key = field.get("key")
                f_type = field.get("type")
                f_options = field.get("options", [])
                
                if f_type in ["single_select", "multi_select", "ranked_select"] and \
                   any(opt.get("value") == "other" for opt in f_options):
                    fields_with_other.append(f_key)

            # Now verify each field with 'other' has a "catcher" field
            for f_key in fields_with_other:
                # We look for another field that references this one in 'showWhen'
                catcher_found = False
                for field in fields:
                    show_when = field.get("showWhen", {})
                    if show_when.get("field") == f_key and show_when.get("includes") == "other":
                        catcher_found = True
                        break
                
                if not catcher_found:
                    errors.append(f"[{q_id}] Field '{f_key}' has 'other' option but no conditional text input field found.")

    return errors

def main():
    root_dir = Path("./data")
    if not root_dir.exists():
        print("Data directory not found.")
        sys.exit(1)
        
    files = list(root_dir.rglob("questions.json"))
    
    total_errors = 0
    print(f"Scanning {len(files)} files...")
    
    for f in files:
        rel_path = f.relative_to(root_dir.parent)
        print(f"\nScanning: {rel_path}")
        errors = audit_file(f)
        
        if errors:
            for err in errors:
                print(f"  [X] {err}")
            total_errors += len(errors)
        else:
            print("  [OK] No issues found.")
            
    if total_errors > 0:
        print(f"\nFAILED: Found {total_errors} issues.")
        sys.exit(1)
    else:
        print("\nSUCCESS: All files passed.")
        sys.exit(0)

if __name__ == "__main__":
    main()
