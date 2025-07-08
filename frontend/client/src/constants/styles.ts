/**
 * Stałe dla CSS classes używanych w całej aplikacji
 * Zastępuje powtarzające się długie klasy CSS
 */
export const Styles = {
  // Typography
  TYPOGRAPHY: {
    HEADING_LARGE: 'text-2xl font-bold text-gray-900 mb-4',
    HEADING_MEDIUM: 'text-xl font-semibold text-gray-800 mb-3',
    HEADING_SMALL: 'text-lg font-semibold text-gray-700 mb-2',
    BODY_TEXT: 'text-base text-gray-600',
    BODY_TEXT_LARGE: 'text-lg text-gray-700',
    CAPTION: 'text-sm text-gray-500',
  },
  
  // Buttons
  BUTTONS: {
    PRIMARY: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200',
    SECONDARY: 'bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors duration-200',
    DANGER: 'bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200',
    SUCCESS: 'bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200',
    OUTLINE: 'border-2 border-blue-600 hover:bg-blue-50 text-blue-600 font-medium py-3 px-6 rounded-lg transition-colors duration-200',
    SMALL: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-sm transition-colors',
  },
  
  // Cards
  CARDS: {
    DEFAULT: 'bg-white rounded-xl shadow-lg p-6 border border-gray-100',
    COMPACT: 'bg-white rounded-lg shadow-md p-4 border border-gray-200',
    HOVER: 'bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200',
    INTERACTIVE: 'bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer',
  },
  
  // Forms
  FORMS: {
    INPUT: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors',
    LABEL: 'block text-sm font-medium text-gray-700 mb-2',
    ERROR: 'text-red-600 text-sm mt-1',
    SUCCESS: 'text-green-600 text-sm mt-1',
  },
  
  // Layout
  LAYOUT: {
    CONTAINER: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    SECTION: 'py-12',
    GRID: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8',
    FLEX_CENTER: 'flex items-center justify-center',
    FLEX_BETWEEN: 'flex items-center justify-between',
  },
  
  // Status indicators
  STATUS: {
    SUCCESS: 'text-green-600 bg-green-100 px-3 py-1 rounded-full text-sm font-medium',
    ERROR: 'text-red-600 bg-red-100 px-3 py-1 rounded-full text-sm font-medium',
    WARNING: 'text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full text-sm font-medium',
    INFO: 'text-blue-600 bg-blue-100 px-3 py-1 rounded-full text-sm font-medium',
  },
  
  // Modals
  MODALS: {
    OVERLAY: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
    CONTENT: 'bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto',
    HEADER: 'flex items-center justify-between mb-4',
    BODY: 'mb-6',
    FOOTER: 'flex justify-end space-x-3',
  },
} as const; 