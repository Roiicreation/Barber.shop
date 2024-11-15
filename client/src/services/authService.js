import { 
    auth,
    db 
} from '../config/firebase';
import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    sendPasswordResetEmail,
    updateProfile 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

const googleProvider = new GoogleAuthProvider();

export const authService = {
    // Registrazione con email e password
    register: async (email, password, name, role = 'client') => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Aggiorna il profilo utente
            await updateProfile(user, {
                displayName: name
            });

            // Crea il documento utente in Firestore
            await setDoc(doc(db, 'users', user.uid), {
                name,
                email,
                role,
                createdAt: new Date(),
                notifications: true // Impostazione predefinita per le notifiche
            });

            return user;
        } catch (error) {
            throw new Error('Errore durante la registrazione: ' + error.message);
        }
    },

    // Login con email e password
    login: async (email, password) => {
        try {
            const { user } = await signInWithEmailAndPassword(auth, email, password);
            return user;
        } catch (error) {
            throw new Error('Errore durante il login: ' + error.message);
        }
    },

    // Login con Google
    googleLogin: async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Verifica se l'utente esiste già
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (!userDoc.exists()) {
                await setDoc(doc(db, 'users', user.uid), {
                    name: user.displayName,
                    email: user.email,
                    createdAt: new Date(),
                    notifications: true
                });
            }

            return user;
        } catch (error) {
            throw new Error('Errore durante il login con Google: ' + error.message);
        }
    },

    // Logout
    logout: async () => {
        try {
            await signOut(auth);
        } catch (error) {
            throw new Error('Errore durante il logout: ' + error.message);
        }
    },

    // Reset password
    resetPassword: async (email) => {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            throw new Error('Errore durante il reset della password: ' + error.message);
        }
    },

    // Aggiungi metodo per verificare il ruolo dell'utente
    checkUserRole: async (userId) => {
        try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
                return userDoc.data().role;
            }
            return null;
        } catch (error) {
            throw new Error('Errore nel controllo del ruolo: ' + error.message);
        }
    }
}; 