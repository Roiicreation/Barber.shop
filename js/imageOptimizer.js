// Funzione per ottimizzare i parametri delle immagini Unsplash
function getOptimizedImageUrl(url, width = 800) {
    return `${url}?auto=format,compress&q=80&w=${width}&fit=crop`;
}

// Usa questa funzione per tutte le immagini
document.querySelectorAll('img[data-src*="unsplash.com"]').forEach(img => {
    img.dataset.src = getOptimizedImageUrl(img.dataset.src);
});
