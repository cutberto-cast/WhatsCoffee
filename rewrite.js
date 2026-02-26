const fs = require('fs');

const path = 'app/admin/productos/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const replacements = [
    // Modal Overlay and Container
    ['bg-black/50 backdrop-blur-sm', 'bg-[var(--color-espresso-dark)]/40 backdrop-blur-sm'],
    ['bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in text-center', 'bg-white rounded-2xl w-full max-w-sm p-6 shadow-[var(--shadow-modal)] border border-[var(--color-borde)] animate-scale-in text-center'],
    ['bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in', 'bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-[var(--shadow-modal)] border border-[var(--color-borde)] animate-scale-in'],
    ['border-b border-gray-100', 'border-b border-[var(--color-borde)]'],
    ['border-t border-gray-100', 'border-t border-[var(--color-borde)]'],

    // Modal Text
    ['text-gray-900', 'text-[var(--color-texto-1)]'],
    ['text-gray-400', 'text-[var(--color-texto-3)]'],
    ['hover:text-gray-600', 'hover:text-[var(--color-texto-1)]'],
    ['text-xs font-medium text-gray-500 mb-1', 'text-xs font-medium text-[var(--color-texto-2)] mb-1.5'],
    ['text-xs font-semibold text-gray-700', 'text-xs font-semibold text-[var(--color-texto-1)]'],
    ['text-gray-800', 'text-[var(--color-texto-1)]'],
    ['text-gray-600', 'text-[var(--color-texto-2)]'],

    // Modal Inputs
    ['px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-400', 'px-3 py-2 border border-[var(--color-borde)] rounded-lg text-[13px] text-[var(--color-texto-1)] placeholder:text-[var(--color-texto-3)] focus:outline-none focus:ring-1 focus:ring-[var(--color-espresso)] shadow-sm transition-all'],
    ['px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cafe-400', 'px-3 py-2 border border-[var(--color-borde)] rounded-md text-[13px] text-[var(--color-texto-1)] placeholder:text-[var(--color-texto-3)] focus:outline-none focus:ring-1 focus:ring-[var(--color-espresso)] shadow-sm transition-all'],

    // Buttons in Modals
    ['text-gray-500 hover:border-cafe-400 hover:text-cafe-600', 'text-[var(--color-texto-2)] hover:border-[var(--color-espresso)] hover:text-[var(--color-texto-1)]'],
    ['bg-cafe-600/20', 'bg-[var(--color-espresso)]/5'],
    ['ring-cafe-600/20', 'ring-[var(--color-espresso)]/30'],
    ['border-cafe-600', 'border-[var(--color-espresso)]'],
    ['bg-cafe-600 hover:bg-cafe-700', 'bg-[var(--color-acento)] hover:bg-[var(--color-acento-hover)]'],
    ['bg-gray-50', 'bg-[var(--color-base)]'],
    ['bg-gray-100', 'bg-[var(--color-base)] border border-[var(--color-borde)]'],
    ['border-gray-200', 'border-[var(--color-borde)]'],
    ['hover:bg-gray-50', 'hover:bg-[var(--color-base)] hover:text-[var(--color-texto-1)]'],
    ['text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium', 'bg-white border border-[var(--color-borde)] text-[var(--color-texto-2)] hover:text-[var(--color-texto-1)] hover:bg-[var(--color-base)] shadow-sm rounded-lg px-4 py-2 text-sm font-medium transition-all'],
    ['bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium', 'bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition-all'],

    // Toggles inside modals
    ['bg-green-500', 'bg-[var(--color-matcha)]'],
    ['bg-gray-300', 'bg-[var(--color-borde)]'],

    // Other specific elements
    ['bg-cafe-600/30 border-t-cafe-600', 'border-[var(--color-borde)] border-t-[var(--color-espresso)]'],
    ['text-cafe-600 focus:ring-cafe-500', 'text-[var(--color-espresso)] focus:ring-[var(--color-espresso)]']
];

for (const [search, replace] of replacements) {
    content = content.split(search).join(replace);
}

fs.writeFileSync(path, content, 'utf8');
console.log('Replaced all modal styles in ' + path);
