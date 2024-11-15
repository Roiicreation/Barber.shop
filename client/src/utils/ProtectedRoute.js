import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

export const ProtectedRoute = ({ children, requiredRole }) => {
    const { currentUser } = useAuth();
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkRole = async () => {
            if (currentUser) {
                const role = await authService.checkUserRole(currentUser.uid);
                setUserRole(role);
            }
            setLoading(false);
        };
        
        checkRole();
    }, [currentUser]);

    if (loading) {
        return <div>Caricamento...</div>;
    }

    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    if (requiredRole && userRole !== requiredRole) {
        return <Navigate to="/unauthorized" />;
    }

    return children;
}; 