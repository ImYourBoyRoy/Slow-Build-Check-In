import json

def review_questions():
    try:
        with open('data/phase_0/questions.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error reading file: {e}")
        return

    questions = data.get('questions', {})
    
    print(f"Total questions: {len(questions)}\n")

    for q_id, q_data in questions.items():
        # strict focus on questions with options
        if 'options' in q_data:
            print(f"ID: {q_id}")
            print(f"Title: {q_data.get('title')}")
            print(f"Prompt: {q_data.get('prompt')}")
            print(f"Type: {q_data.get('type')}")
            
            print("Options:")
            for opt in q_data['options']:
                print(f"  - {opt['value']}: {opt['label']}")
            
            print("Current Examples:")
            for ex in q_data.get('examples', []):
                print(f"  * {ex}")
            
            print("-" * 40)
        elif q_data.get('type') == 'compound':
             # Also check compound fields for options
             print(f"ID: {q_id} (COMPOUND)")
             print(f"Title: {q_data.get('title')}")
             for field in q_data.get('fields', []):
                 if 'options' in field:
                     print(f"  Field: {field.get('label')}")
                     print("  Options:")
                     for opt in field['options']:
                        print(f"    - {opt['value']}: {opt['label']}")
             print("Current Examples:")
             for ex in q_data.get('examples', []):
                print(f"  * {ex}")
             print("-" * 40)

if __name__ == "__main__":
    review_questions()
