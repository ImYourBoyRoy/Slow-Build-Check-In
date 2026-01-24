
# ./scripts/fix_schema_other_fields.py
"""
Bulk repairs questions.json files by identifying 'compound' fields that have an 'other' option
but lack a corresponding text input field. It automatically inserts the missing field
and updates the answer_schema.
"""

import json
import shutil
from pathlib import Path

def fix_file(filepath):
    print(f"Processing: {filepath}")
    
    # 1. Backup
    backup_path = filepath.with_suffix('.json.bak')
    shutil.copy2(filepath, backup_path)
    print(f"  [Backup] Created {backup_path.name}")

    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    questions = data.get("questions", {})
    if not questions:
        return False

    modified = False

    for q_id, q_data in questions.items():
        q_type = q_data.get("type")
        
        # We focus primarily on 'compound' types based on the audit findings (63 issues)
        if q_type == "compound":
            fields = q_data.get("fields", [])
            new_fields = []
            
            # Use an index to iterate so we can insert items
            i = 0
            while i < len(fields):
                field = fields[i]
                new_fields.append(field)
                
                f_key = field.get("key")
                f_type = field.get("type")
                f_options = field.get("options", [])
                
                # Check if this field has an "other" option
                has_other = False
                if f_type in ["single_select", "multi_select", "ranked_select"]:
                    has_other = any(opt.get("value") == "other" for opt in f_options)
                
                if has_other:
                    # Check if a catcher exists in the ORIGINAL list
                    # (We check the whole list because the catcher might be anywhere, though usually next)
                    catcher_found = False
                    for existing in fields:
                        show_when = existing.get("showWhen", {})
                        if show_when.get("field") == f_key and show_when.get("includes") == "other":
                            catcher_found = True
                            break
                    
                    if not catcher_found:
                        # CREATE NEW FIELD
                        new_key = f"{f_key}_other"
                        
                        # Double check we don't accidentally collide with an existing key 
                        # (unlikely if catcher_found is False, but good for safety)
                        collision = any(f.get("key") == new_key for f in fields)
                        if not collision:
                            new_field = {
                                "key": new_key,
                                "label": "If 'Other', describe",
                                "type": "short_text",
                                "showWhen": {
                                    "field": f_key,
                                    "includes": "other"
                                }
                            }
                            new_fields.append(new_field)
                            
                            # UPDATE ANSWER SCHEMA
                            if "answer_schema" in q_data:
                                q_data["answer_schema"][new_key] = ""
                            
                            print(f"  [Fix] {q_id}: Added field '{new_key}'")
                            modified = True
                
                i += 1
            
            # Replace fields with the new list (which includes insertions)
            q_data["fields"] = new_fields

    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print("  [Saved] Changes applied.")
    else:
        print("  [Skipped] No changes needed.")
        
    return modified

def main():
    root_dir = Path("./data")
    if not root_dir.exists():
        print("Data directory not found.")
        return

    files = list(root_dir.rglob("questions.json"))
    print(f"Found {len(files)} files to check.")
    
    total_fixed = 0
    for f in files:
        if fix_file(f):
            total_fixed += 1
            
    print(f"\nDone. Modified {total_fixed} files.")

if __name__ == "__main__":
    main()
