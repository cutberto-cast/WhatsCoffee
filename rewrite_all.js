const fs = require('fs');

const files = [
    'app/admin/banners/page.tsx',
    'app/admin/toppings/page.tsx',
    'app/admin/configuracion/page.tsx',
];

const replacements = [
    // Header
    ['text-2xl font-bold text-gray-900', 'text-xl font-semibold text-[var(--color-texto-1)] tracking-tight'],
    ['text-gray-500 text-sm', 'text-[13px] text-[var(--color-texto-3)]'],

    // Cards wrappers
    ['bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group', 'bg-white border border-[var(--color-borde)] rounded-xl shadow-[var(--shadow-card)] overflow-hidden transition-shadow hover:shadow-[var(--shadow-hover)]'],
    ['bg-white rounded-2xl p-6 shadow-sm', 'bg-white border border-[var(--color-borde)] rounded-xl p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-shadow'],
    ['bg-white rounded-2xl p-5 shadow-sm', 'bg-white border border-[var(--color-borde)] rounded-xl p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-shadow'],
    ['border-t border-gray-100 px-6 py-4 flex gap-3 bg-gray-50 rounded-b-2xl', 'border-t border-[var(--color-borde)] px-6 py-4 flex gap-3 rounded-b-xl bg-[var(--color-base)]'],
    ['border-t border-gray-100', 'border-t border-[var(--color-borde)]'],
    ['border-gray-200', 'border-[var(--color-borde)]'],
    ['bg-gray-50 text-gray-700', 'bg-[var(--color-base)] text-[var(--color-texto-1)]'],
    ['bg-gray-50', 'bg-[var(--color-base)]'],
    ['text-gray-900 mb-2', 'text-[var(--color-texto-1)] mb-2'],
    ['text-gray-900', 'text-[var(--color-texto-1)]'],
    ['text-gray-700', 'text-[var(--color-texto-2)]'],
    ['text-gray-600', 'text-[var(--color-texto-2)]'],
    ['text-gray-500', 'text-[var(--color-texto-3)]'],
    ['text-gray-400', 'text-[var(--color-texto-3)]'],

    // Buttons
    ['bg-[var(--color-primario)] hover:bg-[var(--color-primario)]/90 text-white font-medium px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 text-sm shadow-sm', 'bg-[var(--color-acento)] hover:bg-[var(--color-acento-hover)] text-white shadow-sm rounded-lg px-4 py-2 text-sm font-medium transition-all flex items-center gap-2'],
    ['border border-[var(--color-primario)] text-[var(--color-primario)] hover:bg-amber-50 font-medium px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 text-sm shadow-sm bg-transparent', 'bg-white border border-[var(--color-borde)] text-[var(--color-texto-2)] hover:text-[var(--color-texto-1)] hover:bg-[var(--color-base)] shadow-sm rounded-lg px-4 py-2 text-sm font-medium transition-all flex items-center gap-2'],
    ['bg-cafe-600 hover:bg-cafe-700 text-white font-medium px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 text-sm shadow-sm', 'bg-[var(--color-acento)] hover:bg-[var(--color-acento-hover)] text-white shadow-sm rounded-lg px-4 py-2 text-sm font-medium transition-all flex items-center gap-2'],
    ['px-4 py-2.5 bg-[var(--color-primario)] hover:bg-[var(--color-primario)]/90 disabled:opacity-60 flex justify-center text-white rounded-xl text-sm font-semibold shadow-sm transition-colors', 'bg-[var(--color-acento)] hover:bg-[var(--color-acento-hover)] disabled:opacity-50 flex justify-center items-center text-white rounded-lg px-4 py-2 text-sm font-medium transition-all shadow-sm'],
    ['px-4 py-2.5 bg-cafe-600 hover:bg-cafe-700 disabled:opacity-50 flex justify-center text-white rounded-xl text-sm font-medium', 'bg-[var(--color-acento)] hover:bg-[var(--color-acento-hover)] disabled:opacity-50 flex justify-center items-center text-white rounded-lg px-4 py-2 text-sm font-medium transition-all shadow-sm'],
    ['bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium', 'bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition-all'],
    ['hover:bg-cafe-50 rounded-lg transition-colors text-cafe-500', 'hover:bg-[var(--color-base)] rounded-lg transition-colors text-[var(--color-texto-2)] hover:text-[var(--color-texto-1)]'],
    ['hover:bg-red-50 rounded-lg transition-colors text-red-400', 'hover:bg-red-50 rounded-lg transition-colors text-red-500'],
    ['bg-[var(--color-primario)]/10 text-[var(--color-primario)]', 'bg-[var(--color-matcha-light)] text-[var(--color-matcha)] hover:text-[var(--color-matcha)] hover:bg-[var(--color-matcha-light)]'],

    // Config/Secondary Cancel btn
    ['px-4 py-2.5 text-gray-600 hover:bg-gray-100 border border-[var(--color-borde)] rounded-xl text-sm font-semibold bg-white shadow-sm transition-colors', 'bg-white border border-[var(--color-borde)] text-[var(--color-texto-2)] hover:text-[var(--color-texto-1)] hover:bg-[var(--color-base)] shadow-sm rounded-lg px-4 py-2 text-sm font-medium transition-all'],
    ['px-4 py-2.5 text-gray-600 hover:bg-[var(--color-base)] border border-[var(--color-borde)] rounded-xl text-sm font-medium', 'bg-white border border-[var(--color-borde)] text-[var(--color-texto-2)] hover:text-[var(--color-texto-1)] hover:bg-[var(--color-base)] shadow-sm rounded-lg px-4 py-2 text-sm font-medium transition-all'],
    ['px-4 py-2.5 bg-white border border-[var(--color-borde)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-400', 'px-3 py-2 border border-[var(--color-borde)] bg-white rounded-lg text-[13px] text-[var(--color-texto-1)] placeholder:text-[var(--color-texto-3)] focus:outline-none focus:ring-1 focus:ring-[var(--color-espresso)] shadow-sm transition-all'],

    // Inputs
    ['px-4 py-2.5 border border-[var(--color-borde)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-400', 'px-3 py-2 border border-[var(--color-borde)] rounded-lg text-[13px] text-[var(--color-texto-1)] placeholder:text-[var(--color-texto-3)] focus:outline-none focus:ring-1 focus:ring-[var(--color-espresso)] shadow-sm transition-all'],

    // Search
    ['border border-[var(--color-borde)] text-sm focus:outline-none focus:ring-2 focus:ring-cafe-400', 'border-[var(--color-borde)] text-[13px] text-[var(--color-texto-1)] placeholder:text-[var(--color-texto-3)] focus:outline-none focus:ring-1 focus:ring-[var(--color-espresso)] shadow-sm transition-all'],
    ['text-sm focus:outline-none focus:ring-2 focus:ring-cafe-400', 'text-[13px] text-[var(--color-texto-1)] focus:outline-none focus:ring-1 focus:ring-[var(--color-espresso)] shadow-sm transition-all'],

    // Toggles
    ['bg-green-500', 'bg-[var(--color-matcha)]'],
    ['bg-gray-300', 'bg-[var(--color-borde)]'],

    // Modals
    ['bg-black/50 backdrop-blur-sm', 'bg-[var(--color-espresso-dark)]/40 backdrop-blur-sm'],
    ['bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in', 'bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-[var(--shadow-modal)] border border-[var(--color-borde)] animate-scale-in'],
    ['bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-scale-in', 'bg-white rounded-2xl w-full max-w-md p-6 shadow-[var(--shadow-modal)] border border-[var(--color-borde)] animate-scale-in'],
    ['bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-scale-in', 'bg-white rounded-2xl w-full max-w-sm p-6 shadow-[var(--shadow-modal)] border border-[var(--color-borde)] animate-scale-in text-center'],

    // Colors
    ['text-cafe-600', 'text-[var(--color-texto-1)]'],
    ['text-cafe-500', 'text-[var(--color-texto-2)]'],
    ['border-cafe-600', 'border-[var(--color-espresso)]'],
    ['border-cafe-500', 'border-[var(--color-espresso)]'],
    ['hover:border-cafe-300', 'hover:border-[var(--color-espresso)]'],
    ['ring-cafe-600/20', 'ring-[var(--color-espresso)]/20'],
    ['bg-cafe-600', 'bg-[var(--color-acento)]'],
    ['text-cafe-400', 'text-[var(--color-texto-3)]']
];

for (const path of files) {
    if (!fs.existsSync(path)) continue;
    let content = fs.readFileSync(path, 'utf8');

    for (const [search, replace] of replacements) {
        content = content.split(search).join(replace);
    }

    fs.writeFileSync(path, content, 'utf8');
    console.log('Replaced all modal styles in ' + path);
}
