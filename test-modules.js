// Simulate browser environment
const App = {
    views: {},
    currentView: 'dashboard',
    participantName: '',
    bookmarkedQuestions: [],
    importNeedsReview: [],
    importWarnings: {},
    importedFiles: { a: null, b: null, continue: null },
    importMode: 'continue'
};

// Try loading each module
const modules = [
    'utilities.js',
    'accessibility.js', 
    'toast.js',
    'bookmarks.js',
    'views.js',
    'questionnaire.js',
    'navigation.js',
    'export.js',
    'phase.js',
    'progress.js',
    'ranked-select.js',
    'dashboard.js',
    'import-modal.js'
];

for (const mod of modules) {
    try {
        require('./js/app/' + mod);
        console.log('OK: ' + mod);
    } catch (e) {
        console.log('FAIL: ' + mod + ' - ' + e.message);
    }
}
