/**
 * Stałe dla CSS classes używanych w całej aplikacji
 * Zastępuje powtarzające się długie klasy CSS
 */
export const Styles = {
  // Typography
  TYPOGRAPHY: {
    HEADING_LARGE: 'text-lg font-semibold text-gray-800 mb-4',
    HEADING_MEDIUM: 'text-lg font-semibold text-gray-700 mb-2',
    HEADING_SMALL: 'text-md font-semibold text-gray-700 mb-2',
    BODY_TEXT: 'text-sm text-gray-600',
    BODY_TEXT_LARGE: 'text-base text-gray-700',
    CAPTION: 'text-xs text-gray-500',
  },
  
  // Buttons
  BUTTONS: {
    PRIMARY: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors',
    SECONDARY: 'bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors',
    DANGER: 'bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors',
    SUCCESS: 'bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors',
    OUTLINE: 'border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors',
    SMALL: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded text-sm transition-colors',
  },
  
  // Cards
  CARDS: {
    DEFAULT: 'bg-white rounded-lg shadow-md p-6 border border-gray-200',
    COMPACT: 'bg-white rounded-lg shadow-sm p-4 border border-gray-200',
    HOVER: 'bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow',
  },
  
  // Forms
  FORMS: {
    INPUT: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    LABEL: 'block text-sm font-medium text-gray-700 mb-1',
    ERROR: 'text-red-600 text-sm mt-1',
    SUCCESS: 'text-green-600 text-sm mt-1',
  },
  
  // Layout
  LAYOUT: {
    CONTAINER: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    SECTION: 'py-8',
    GRID: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    FLEX_CENTER: 'flex items-center justify-center',
    FLEX_BETWEEN: 'flex items-center justify-between',
  },
  
  // Status indicators
  STATUS: {
    SUCCESS: 'text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs font-medium',
    ERROR: 'text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs font-medium',
    WARNING: 'text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full text-xs font-medium',
    INFO: 'text-blue-600 bg-blue-100 px-2 py-1 rounded-full text-xs font-medium',
  },
  
  // Tables
  TABLES: {
    CONTAINER: 'overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg',
    TABLE: 'min-w-full divide-y divide-gray-300',
    HEADER: 'bg-gray-50',
    HEADER_CELL: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
    ROW: 'bg-white hover:bg-gray-50',
    CELL: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900',
  },
} as const; 