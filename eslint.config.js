import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier/recommended';

export default [
    js.configs.recommended,
    prettier,
    {
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'module',
            globals: {
                // Browser globals
                window: 'readonly',
                document: 'readonly',
                console: 'readonly',
                localStorage: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                confirm: 'readonly',
                alert: 'readonly',
                Date: 'readonly',
                Math: 'readonly',
                JSON: 'readonly',
                Intl: 'readonly',
                FormData: 'readonly',
                HTMLElement: 'readonly',
                Blob: 'readonly',
                FileReader: 'readonly',
                location: 'readonly',

                // Node.js globals
                require: 'readonly',
                module: 'readonly',
                __dirname: 'readonly',
                process: 'readonly',

                // Custom globals
                electronAPI: 'readonly',
                AppState: 'writable',

                // Constants from constants.js
                UI_MESSAGES: 'readonly',
                VALIDATION_RULES: 'readonly',
                STORAGE_KEYS: 'readonly',
                DEBOUNCE_DELAYS: 'readonly',
                TOAST_DURATIONS: 'readonly',
                DEFAULTS: 'readonly',
                TEMPLATE_TYPES: 'readonly',
                PAGE_SIZES: 'readonly',
                MARGIN_TYPES: 'readonly',
                REPORT_TYPES: 'readonly',
                EXPORT_FORMATS: 'readonly',
                DATE_FILTERS: 'readonly',
                STATUS_TYPES: 'readonly',
                KEYBOARD_SHORTCUTS: 'readonly',
                ERROR_MESSAGES: 'readonly',
                SUCCESS_MESSAGES: 'readonly',
                LOADING_MESSAGES: 'readonly',
                REGEX_PATTERNS: 'readonly',

                // Utility functions from utils.js
                sanitizeHTML: 'readonly',
                escapeHTML: 'readonly',
                debounce: 'readonly',
                isValidEmail: 'readonly',
                isValidPhone: 'readonly',
                isValidGSTIN: 'readonly',
                isValidPAN: 'readonly',
                formatCurrency: 'readonly',
                createLoadingSpinner: 'readonly',
                showToast: 'readonly',
                getToastIcon: 'readonly',
                validateFormData: 'readonly',
                showValidationErrors: 'readonly',
                deepClone: 'readonly',
                safeJSONParse: 'readonly',
                generateId: 'readonly',
                formatDate: 'readonly',
                getCurrentMonthDates: 'readonly',
                getLastMonthDates: 'readonly',

                // Keyboard shortcuts from keyboard-shortcuts.js
                initKeyboardShortcuts: 'readonly',
                handleKeyboardShortcut: 'readonly',
                showKeyboardShortcutsHelp: 'readonly',

                // App.js functions used in keyboard shortcuts
                showContentScreen: 'readonly',
                closeModal: 'readonly',
                createModal: 'readonly',
                showModal: 'readonly',
            },
        },
        rules: {
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'prefer-const': 'warn',
            'no-var': 'error',
            eqeqeq: ['error', 'always'],
            curly: ['error', 'all'],
            semi: ['error', 'always'],
            quotes: ['error', 'single', { avoidEscape: true }],
            'no-eval': 'error',
            'no-implied-eval': 'error',
            'no-new-func': 'error',
        },
    },
    {
        ignores: [
            'node_modules/',
            'dist/',
            'build/',
            'out/',
            '*.min.js',
            'verify-setup.js',
            'create-icons.js',
            'generate-icon.js',
        ],
    },
];
