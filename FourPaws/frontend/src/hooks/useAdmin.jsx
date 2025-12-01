import { useContext, useState, useEffect } from "react";
import { AuthContext } from '../components/providers/AuthWrapper';

const useAdmin = () => {
    const { user, loading, isAdmin } = useContext(AuthContext);
    const [adminStatus, setAdminStatus] = useState(false);
    const [adminLoading, setAdminLoading] = useState(true);
    
    useEffect(() => {
        if (!loading && user) {
            const status = isAdmin();
            console.log('useAdmin hook - status:', status); // Debug log
            setAdminStatus(status);
            setAdminLoading(false);
        } else if (!loading && !user) {
            setAdminStatus(false);
            setAdminLoading(false);
        }
    }, [user, loading, isAdmin]);
    
    return [adminStatus, adminLoading];
};

export default useAdmin;
