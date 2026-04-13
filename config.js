// Flowstate site configuration
// Change these values in ONE place to update across all pages
const FLOWSTATE = {
    wa: '50237408644',
    waMessage: 'Hola, me interesa una diagnóstica operativa para mi negocio',
    email: 'info@flowstate.help',
    domain: 'flowstate.help'
};

// Auto-update WhatsApp links from config
document.addEventListener('DOMContentLoaded', function() {
    var waBase = 'https://wa.me/' + FLOWSTATE.wa;
    var waFull = waBase + '?text=' + encodeURIComponent(FLOWSTATE.waMessage);
    document.querySelectorAll('a[href*="wa.me"]').forEach(function(a) {
        a.href = a.href.includes('?text=') ? waFull : waBase;
    });
});
