import { auth } from './firebase-config.js';
import { userService } from './users.js';

async function checkOwnerAccess() {
    const user = auth.currentUser;
    
    if (!user) {
        window.location.href = '/login.html';
        return false;
    }

    try {
        const role = await userService.getUserRole(user.uid);
        if (role !== 'owner') {
            window.location.href = '/unauthorized.html';
            return false;
        }
        return true;
    } catch (error) {
        console.error('Errore nella verifica del ruolo:', error);
        return false;
    }
}

// Usa questa funzione nelle pagine riservate agli owner
document.addEventListener('DOMContentLoaded', async function() {
    if (document.body.classList.contains('owner-only')) {
        const hasAccess = await checkOwnerAccess();
        if (!hasAccess) {
            return;
        }
        // Continua con il caricamento della pagina
    }
}); 