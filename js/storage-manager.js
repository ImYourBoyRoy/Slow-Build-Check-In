// ./js/storage-manager.js
/**
 * Storage manager module for the Slow Build Check-In questionnaire.
 * 
 * Handles localStorage for saving/loading progress, theme preferences,
 * and participant information. Provides auto-save and resume functionality.
 * 
 * Usage: Import and use StorageManager methods to persist state.
 */

const StorageManager = {
    // Storage version for future migrations
    STORAGE_VERSION: 1,

    KEYS: {
        RESPONSES: 'slowbuild_responses',
        PROGRESS: 'slowbuild_progress',
        THEME: 'slowbuild_theme',
        PARTICIPANTS: 'slowbuild_participants',
        PARTICIPANT_NAME: 'slowbuild_participant_name',
        MODE: 'slowbuild_mode',
        SKIPPED: 'slowbuild_skipped',
        COMPLETED_MODES: 'slowbuild_completed_modes'
    },

    /**
     * Save responses to localStorage.
     * @param {Object} responses - Response object keyed by question ID.
     */
    saveResponses(responses) {
        try {
            localStorage.setItem(this.KEYS.RESPONSES, JSON.stringify(responses));
        } catch (e) {
            console.error('Failed to save responses:', e);
        }
    },

    /**
     * Load responses from localStorage.
     * @returns {Object} Saved responses or empty object.
     */
    loadResponses() {
        try {
            const saved = localStorage.getItem(this.KEYS.RESPONSES);
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            console.error('Failed to load responses:', e);
            return {};
        }
    },

    /**
     * Save current progress (question index).
     * @param {number} index - Current question index.
     */
    saveProgress(index) {
        try {
            localStorage.setItem(this.KEYS.PROGRESS, JSON.stringify({ index, timestamp: Date.now() }));
        } catch (e) {
            console.error('Failed to save progress:', e);
        }
    },

    /**
     * Load saved progress.
     * @returns {Object|null} Progress object with index and timestamp, or null.
     */
    loadProgress() {
        try {
            const saved = localStorage.getItem(this.KEYS.PROGRESS);
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.error('Failed to load progress:', e);
            return null;
        }
    },

    /**
     * Save skipped question IDs.
     * @param {Array<string>} skipped - Array of skipped question IDs.
     */
    saveSkipped(skipped) {
        try {
            localStorage.setItem(this.KEYS.SKIPPED, JSON.stringify(skipped));
        } catch (e) {
            console.error('Failed to save skipped:', e);
        }
    },

    /**
     * Load skipped question IDs.
     * @returns {Array<string>} Array of skipped question IDs.
     */
    loadSkipped() {
        try {
            const saved = localStorage.getItem(this.KEYS.SKIPPED);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Failed to load skipped:', e);
            return [];
        }
    },

    /**
     * Save theme preference.
     * @param {string} theme - Theme name.
     */
    saveTheme(theme) {
        try {
            localStorage.setItem(this.KEYS.THEME, theme);
        } catch (e) {
            console.error('Failed to save theme:', e);
        }
    },

    /**
     * Load theme preference.
     * @returns {string|null} Saved theme name or null.
     */
    loadTheme() {
        try {
            return localStorage.getItem(this.KEYS.THEME);
        } catch (e) {
            console.error('Failed to load theme:', e);
            return null;
        }
    },

    /**
     * Save participant information.
     * @param {Array<Object>} participants - Array of participant objects.
     */
    saveParticipants(participants) {
        try {
            localStorage.setItem(this.KEYS.PARTICIPANTS, JSON.stringify(participants));
        } catch (e) {
            console.error('Failed to save participants:', e);
        }
    },

    /**
     * Load participant information.
     * @returns {Array<Object>} Array of participant objects.
     */
    loadParticipants() {
        try {
            const saved = localStorage.getItem(this.KEYS.PARTICIPANTS);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Failed to load participants:', e);
            return [];
        }
    },

    /**
     * Save mode preference (full/lite).
     * @param {string} mode - 'full' or 'lite'.
     */
    saveMode(mode) {
        try {
            localStorage.setItem(this.KEYS.MODE, mode);
        } catch (e) {
            console.error('Failed to save mode:', e);
        }
    },

    /**
     * Load mode preference.
     * @returns {string} Saved mode or 'lite' as default.
     */
    loadMode() {
        try {
            return localStorage.getItem(this.KEYS.MODE) || 'lite';
        } catch (e) {
            console.error('Failed to load mode:', e);
            return 'lite';
        }
    },

    /**
     * Save participant name.
     * @param {string} name - Participant name.
     */
    saveParticipantName(name) {
        try {
            localStorage.setItem(this.KEYS.PARTICIPANT_NAME, name);
        } catch (e) {
            console.error('Failed to save participant name:', e);
        }
    },

    /**
     * Load participant name.
     * @returns {string} Saved participant name or 'Participant' as default.
     */
    loadParticipantName() {
        try {
            return localStorage.getItem(this.KEYS.PARTICIPANT_NAME) || 'Participant';
        } catch (e) {
            console.error('Failed to load participant name:', e);
            return 'Participant';
        }
    },

    /**
     * Check if there's saved progress to resume.
     * @returns {boolean} True if resumable progress exists.
     */
    hasResumableProgress() {
        const responses = this.loadResponses();
        return Object.keys(responses).length > 0;
    },

    /**
     * Clear all saved data.
     */
    clearAll() {
        try {
            Object.values(this.KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
        } catch (e) {
            console.error('Failed to clear storage:', e);
        }
    },

    /**
     * Export all saved data as a single object.
     * @returns {Object} All saved data.
     */
    exportAll() {
        return {
            version: this.STORAGE_VERSION,
            responses: this.loadResponses(),
            progress: this.loadProgress(),
            skipped: this.loadSkipped(),
            participantName: this.loadParticipantName(),
            mode: this.loadMode(),
            theme: this.loadTheme(),
            exportedAt: new Date().toISOString()
        };
    },

    /**
     * Import data from a previously exported object.
     * Merges with existing responses by default.
     * @param {Object} data - Exported data object.
     * @param {boolean} replace - If true, replace all data instead of merging.
     * @returns {Object} Result with success status and message.
     */
    importAll(data, replace = false) {
        try {
            // Validate data structure
            if (!data || typeof data !== 'object') {
                return { success: false, message: 'Invalid data format' };
            }

            // Handle responses
            if (data.responses && typeof data.responses === 'object') {
                if (replace) {
                    this.saveResponses(data.responses);
                } else {
                    // Merge: existing responses + imported (imported wins conflicts)
                    const existing = this.loadResponses();
                    const merged = { ...existing, ...data.responses };
                    this.saveResponses(merged);
                }
            }

            // Handle skipped questions
            if (Array.isArray(data.skipped)) {
                if (replace) {
                    this.saveSkipped(data.skipped);
                } else {
                    const existing = this.loadSkipped();
                    const merged = [...new Set([...existing, ...data.skipped])];
                    this.saveSkipped(merged);
                }
            }

            // Restore participant name if provided
            if (data.participantName) {
                this.saveParticipantName(data.participantName);
            }

            // Restore mode if provided
            if (data.mode) {
                this.saveMode(data.mode);
            }

            // Optionally restore theme
            if (data.theme) {
                this.saveTheme(data.theme);
            }

            // Mark completion if data indicates it
            if (data.completedModes) {
                this.saveCompletedModes(data.completedModes);
            }

            return {
                success: true,
                message: `Imported ${Object.keys(data.responses || {}).length} responses`,
                responsesCount: Object.keys(data.responses || {}).length
            };
        } catch (e) {
            console.error('Failed to import data:', e);
            return { success: false, message: 'Import failed: ' + e.message };
        }
    },

    /**
     * Parse text export format back into responses object.
     * @param {string} text - Exported text content.
     * @returns {Object} Parsed data object or null if invalid.
     */
    parseTextImport(text) {
        try {
            const responses = {};
            let participantName = 'Participant';

            // Extract participant name
            const nameMatch = text.match(/Completed by:\s*(.+)/i);
            if (nameMatch) {
                participantName = nameMatch[1].trim();
            }

            // Parse question/answer pairs
            // Format: Q1: Title\n   "prompt"\n   ➤ Answer
            const questionPattern = /Q(\d+):\s*(.+?)\n\s+"(.+?)"\n\s*➤\s*(.+?)(?=\n\nQ\d+:|$)/gs;
            let match;

            while ((match = questionPattern.exec(text)) !== null) {
                const [, num, title, prompt, answer] = match;
                const questionId = `q${num.padStart(2, '0')}`;

                if (answer.trim() !== '[Skipped]' && answer.trim() !== '[Not answered]') {
                    responses[questionId] = {
                        text: answer.trim(),
                        importedFromText: true
                    };
                }
            }

            return {
                responses,
                participantName,
                importedAt: new Date().toISOString()
            };
        } catch (e) {
            console.error('Failed to parse text import:', e);
            return null;
        }
    },

    /**
     * Get timestamp of last save.
     * @returns {number|null} Timestamp in milliseconds or null.
     */
    getSaveTimestamp() {
        const progress = this.loadProgress();
        return progress?.timestamp || null;
    },

    /**
     * Check if user has completed a specific mode.
     * @param {string} mode - 'lite' or 'full'.
     * @returns {boolean} True if mode was completed.
     */
    hasCompletedMode(mode) {
        const completed = this.loadCompletedModes();
        return completed.includes(mode);
    },

    /**
     * Mark a mode as completed.
     * @param {string} mode - 'lite' or 'full'.
     */
    markModeCompleted(mode) {
        const completed = this.loadCompletedModes();
        if (!completed.includes(mode)) {
            completed.push(mode);
            this.saveCompletedModes(completed);
        }
    },

    /**
     * Load completed modes list.
     * @returns {Array<string>} Array of completed mode names.
     */
    loadCompletedModes() {
        try {
            const saved = localStorage.getItem(this.KEYS.COMPLETED_MODES);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    },

    /**
     * Save completed modes list.
     * @param {Array<string>} modes - Array of completed mode names.
     */
    saveCompletedModes(modes) {
        try {
            localStorage.setItem(this.KEYS.COMPLETED_MODES, JSON.stringify(modes));
        } catch (e) {
            console.error('Failed to save completed modes:', e);
        }
    }
};

// Export for ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageManager;
}
