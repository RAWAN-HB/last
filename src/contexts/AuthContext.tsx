import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'company' | 'admin' | 'supervisor' | 'super-admin';
}

interface AuthContextType {
  user: User | null;
  login: (token: string, role: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    if (token && role) {
      setUser({ 
        id: '', 
        name: localStorage.getItem('userName') || '', 
        email: '', 
        role: role as User['role'] 
      });
    }
    setLoading(false);
  }, []);

  const login = (token: string, role: string, name: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userName', name);
    setUser({ 
      id: '', 
      name, 
      email: '', 
      role: role as User['role'] 
    });
    toast.success('Login successful!');
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    toast.success('Logged out');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

