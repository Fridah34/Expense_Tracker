import { createContext , useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (storedToken && storedUser) {
                try{
                    setUser(JSON.parse(storedUser));
                    setToken(storedToken);
                }catch {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);


    const login = async (credentials) => {
      try {
       const response = await authAPI.login(credentials);
       const { accessToken, user: userData } = response.data.data;
    
       localStorage.setItem('token', accessToken);
       localStorage.setItem('user', JSON.stringify(userData));
       setToken(accessToken);
       setUser(userData);

       return userData;
     } catch (err) {
       throw err;
     }
    };

    const register = async (data) => {
        const response = await authAPI.register(data);
        const { accessToken, user: userData } = response.data.data;

        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(accessToken);
        setUser(userData);

        return userData;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser}} >
            {children}
        </AuthContext.Provider>
    );
};