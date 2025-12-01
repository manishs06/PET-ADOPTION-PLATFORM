import { Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from '../providers/AuthWrapper';
import useAdmin from "../../hooks/useAdmin";

const AdminRoute = ({ children }) => {
    const contextValue = useContext(AuthContext);
    
    if (!contextValue) {
        console.error('AuthContext is null. Make sure AdminRoute is used within AuthWrapper.');
        return <div>Error: AuthContext not available</div>;
    }
    
    const { user, loading } = contextValue;
    const [isAdmin, isAdminLoading] = useAdmin();
    const location = useLocation();

    if (loading || isAdminLoading) {
        return <progress className="progress w-56"></progress>
    }

    if (user && isAdmin) {
        return children;
    }

    return <Navigate to="/" state={{ from: location }} replace></Navigate>

};

export default AdminRoute;