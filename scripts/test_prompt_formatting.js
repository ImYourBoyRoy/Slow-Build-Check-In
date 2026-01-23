const ImportManager = require('../js/import-manager.js');

// Mock Question Q05 from questions.json
const mockQuestion = {
    id: "q05",
    title: "Capacity for mutual responsibility",
    prompt: "When dating, can you reliably show up...?",
    type: "single_select",
    options: [
        { value: "yes_consistently", label: "Yes, consistently" },
        { value: "mostly", label: "Mostly, with occasional strain" },
        { value: "inconsistent", label: "Inconsistent right now" }
    ]
};

// Mock Response
const mockResponse = {
    selected_value: "mostly",
    other_text: ""
};

console.log("--- TEST 1: Standard Value ---");
console.log("Input Value:", mockResponse.selected_value);
const result1 = ImportManager.formatResponse(mockQuestion, mockResponse);
console.log("Formatted Output:", result1);

// Mock Response with Other
const mockResponseOther = {
    selected_value: "other",
    other_text: "Specific context here"
};

console.log("\n--- TEST 2: 'Other' Value ---");
console.log("Input Value:", mockResponseOther.selected_value);
console.log("Input Text:", mockResponseOther.other_text);
const result2 = ImportManager.formatResponse(mockQuestion, mockResponseOther);
console.log("Formatted Output:", result2);

// Mock Multi-Select
const mockQuestionMulti = {
    id: "q_multi",
    type: "multi_select",
    options: [
        { value: "a", label: "Option A" },
        { value: "b", label: "Option B" },
        { value: "other", label: "Other" }
    ]
};

const mockResponseMulti = {
    selected_values: ["a", "other"],
    other_text: "Something else"
};

console.log("\n--- TEST 3: Multi-Select ---");
console.log("Input Values:", mockResponseMulti.selected_values);
const result3 = ImportManager.formatResponse(mockQuestionMulti, mockResponseMulti);
console.log("Formatted Output:", result3);

// Mock Compound Question
const mockCompound = {
    id: "q_compound",
    type: "compound",
    fields: [
        {
            key: "frequency",
            label: "How often?",
            type: "single_select",
            options: [
                { value: "weekly_10", label: "Weekly (10 mins)" },
                { value: "biweekly_20", label: "Bi-weekly (20 mins)" }
            ]
        },
        {
            key: "format",
            label: "Format",
            type: "single_select",
            options: [
                { value: "call", label: "Phone Call" }
            ]
        },
        {
            key: "notes",
            label: "Notes",
            type: "free_text"
        }
    ]
};

const mockCompoundResponse = {
    frequency: "biweekly_20",
    format: "call",
    notes: "Prefer weekends"
};

console.log("\n--- TEST 4: Compound with Slugs ---");
console.log("Input:", mockCompoundResponse);
const result4 = ImportManager.formatResponse(mockCompound, mockCompoundResponse);
console.log("Formatted Output:", result4);

// Mock Compound with Labels as Keys (Robustness Test)
const mockCompoundLegacy = {
    frequency: "biweekly_20", // Still slug value
    "How often?": "biweekly_20" // Simulating label as key
};

console.log("\n--- TEST 5: Compound with Labels as Keys ---");
console.log("Input:", mockCompoundLegacy);
const result5 = ImportManager.formatResponse(mockCompound, mockCompoundLegacy);
console.log("Formatted Output:", result5);
