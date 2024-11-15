import Dashboard from './pages/Dashboard/Dashboard';

// ... nel router ...
<Route 
    path="/dashboard" 
    element={
        <ProtectedRoute requiredRole="owner">
            <Dashboard />
        </ProtectedRoute>
    } 
/>
