/* eslint-disable react/prop-types */
import  { useContext } from 'react';

import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../providers/AuthWrapper'; // Correct import path

const PrivateRoute = ({children}) => {
    const contextValue = useContext(AuthContext);
    
    if (!contextValue) {
        console.error('AuthContext is null. Make sure PrivateRoute is used within AuthWrapper.');
        return <div>Error: AuthContext not available</div>;
    }
    
    const {user,loading} = contextValue;
    const location = useLocation();
    
    if(loading){
        return <span className="loading loading-ring loading-lg"></span>
    }
    
    if(user){
        return children;
    }
    
    return <Navigate state={{from: location}} to="/login" replace />;
};

export default PrivateRoute;