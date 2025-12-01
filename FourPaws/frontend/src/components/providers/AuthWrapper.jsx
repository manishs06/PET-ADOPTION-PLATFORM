import { createContext, useEffect, useState } from "react";
import useAxiosPublic from "../../hooks/useAxiosPublic";

export const AuthContext = createContext(null);

const AuthWrapper = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const axiosPublic = useAxiosPublic();

    // Check if user is authenticated on component mount
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const token = localStorage.getItem('access-token');
                const rememberMe = localStorage.getItem('remember-me') === 'true';

                // If user did not opt-in to remember the session, clear any stale token and skip auto-restore
                if (!rememberMe) {
                    if (token) {
                        localStorage.removeItem('access-token');
                    }
                    setUser(null);
                    return;
                }

                if (token) {
                    // Verify token with backend
                    const response = await axiosPublic.get('/auth/me', {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    if (response.data.success) {
                        const userData = response.data.user;
                        // Fix broken photoURL for existing users
                        if (userData.photoURL && userData.photoURL.includes('via.placeholder.com')) {
                            userData.photoURL = 'https://placehold.co/150x150/e2e8f0/64748b?text=User';
                        }
                        setUser(userData);
                    } else {
                        localStorage.removeItem('access-token');
                        setUser(null);
                    }
                }
            } catch (error) {
                console.error('Auth check error:', error);
                localStorage.removeItem('access-token');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuthStatus();
    }, [axiosPublic]);

    // Login function
    const login = async (email, password) => {
        setLoading(true);
        try {
            console.log('Attempting login with:', { email, password: password ? '****' : 'empty' });
            
            const response = await axiosPublic.post('/auth/login', {
                email,
                password
            });

            console.log('Login response:', response.data);
            
            if (response.data.success) {
                const { token, user } = response.data;
                localStorage.setItem('access-token', token);
                setUser(user);
                return { success: true };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            console.error('Login error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                headers: error.response?.headers
            });
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        } finally {
            setLoading(false);
        }
    };

    // Register function
    const register = async (userData) => {
        setLoading(true);
        try {
            const response = await axiosPublic.post('/auth/register', userData);

            if (response.data.success) {
                const { token, user } = response.data;
                localStorage.setItem('access-token', token);
                setUser(user);
                return { success: true };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            console.error('Register error:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Registration failed' 
            };
        } finally {
            setLoading(false);
        }
    };

    // Logout function
    const logout = async () => {
        setLoading(true);
        try {
            await axiosPublic.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('access-token');
            localStorage.removeItem('remember-me');
            setUser(null);
            setLoading(false);
        }
    };

    // Update user profile
    const updateProfile = async (profileData) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access-token');
            const response = await axiosPublic.put('/auth/profile', profileData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success) {
                setUser(response.data.user);
                return { success: true };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            console.error('Profile update error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Profile update failed'
            };
        } finally {
            setLoading(false);
        }
    };

    // Check if user is admin
    const isAdmin = () => {
        return user?.role === 'admin' || user?.role === 'Admin';
    };

    const authInfo = {
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        isAdmin
    };

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthWrapper;