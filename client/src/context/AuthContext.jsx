import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const response = await authService.getMe();
                if (response.success) {
                    setUser(response.data.user);
                    setProfile(response.data.profile);
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
            }
        }
        setLoading(false);
    };

    const login = async (email, password) => {
        const response = await authService.login(email, password);
        if (response.success) {
            setUser(response.data.user);
            await checkAuth(); // Get full user data
        }
        return response;
    };

    const register = async (data) => {
        const response = await authService.register(data);
        if (response.success) {
            setUser(response.data.user);
            await checkAuth();
        }
        return response;
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
        setProfile(null);
    };

    const value = {
        user,
        profile,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        checkAuth,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
