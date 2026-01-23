# AI Prompt Generation Pathway

This document visualizes the "waterfall" data flow of how a single question from `questions.json` is transformed into the final context provided to the AI model.

## 1. The Data Flow Waterfall

```mermaid
graph TD
    A[questions.json] -->|Loads Definition| B(DataLoader Value)
    subgraph "Display & Interaction"
        B -->|Renders Label: 'Yes, consistently'| C[User Interface]
        C -->|User Selects Option| D[User Input]
    end
    D -->|Captures Value: 'yes_consistently'| E[Response State (QuestionnaireEngine)]
    E -->|Raw Response| F[ImportManager.formatJSONResponses]
    B -->|Provides Title, Prompt, ID| F
    F -->|Constructs Text Block| G[Formatted Prompt Segment]
    H[prompts.json] -->|Provides Template| I[Final Prompt Assembly]
    G -->|Injects into Template| I
    I -->|Clipboard| J[Final AI Input]
```

## 2. Detailed Data Breakdown

This section details exactly which fields are extracted from the source and how they appear in the final output.

### Source: `questions.json`

| Field | Value Example | Usage |
| :--- | :--- | :--- |
| `id` | `"q05"` | Used to generate the header `Q05` |
| `title` | `"Capacity for mutual responsibility"` | Used in the header line |
| `prompt` | `"When dating, can you reliably..."` | **Directly included** as context |
| `options.value` | `"yes_consistently"` | **The ONLY part of the answer sent to AI** |
| `options.label` | `"Yes, consistently"` | **IGNORED** (User-only view) |

### Transition: User Input

The user sees the `label` ("Yes, consistently") but the system stores the `value` (`"yes_consistently"`).

### Transformation: `ImportManager.js`

The system constructs a text block for each answered question using this specific template:

```text
**Q{id}: {title}**
{prompt}
Answer: {selected_value}
```

## 3. Final Output Example

Here is the exact text the AI receives for the example question:

```text
**Q05: Capacity for mutual responsibility**
When dating, can you reliably show up (time, attention, emotional presence) without neglecting key responsibilities?
Answer: yes_consistently
```

## 4. File Pathway Trace

1. **Definition**: `data/phase_0/questions.json`
    * *Role*: Defines the immutable question structure (Title, Prompt, Option Values).
2. **Loading**: `js/data-loader.js`
    * *Role*: Loads JSON into the application memory.
3. **Collection**: `js/app/questionnaire.js`
    * *Role*: Captures the user's selection. **Crucially, it saves the `value` slug, not the UI label.**
4. **Formatting**: `js/import-manager.js` (Function: `formatJSONResponses`)
    * *Role*: Merges the Question Definition (Step 1) with the User Response (Step 3).
5. **Assembly**: `js/import-manager.js` (Function: `buildIndividualPrompt`)
    * *Role*: Injects the formatted questions into the structure defined in `prompts.json`.
