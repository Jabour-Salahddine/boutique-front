
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users database
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin'
  },
  {
    id: '2',
    name: 'Customer User',
    email: 'customer@example.com',
    role: 'customer'
  }
];

// Mock passwords - in a real app, these would be hashed and stored securely
const MOCK_PASSWORDS: Record<string, string> = {
  'admin@example.com': 'admin123',
  'customer@example.com': 'customer123'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  
  // Check for stored user on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user', error);
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockPassword = MOCK_PASSWORDS[email];
    if (mockPassword && mockPassword === password) {
      const foundUser = MOCK_USERS.find(u => u.email === email);
      if (foundUser) {
        setUser(foundUser);
        localStorage.setItem('user', JSON.stringify(foundUser));
        toast({
          title: "Login successful",
          description: `Welcome back, ${foundUser.name}!`,
        });
        return true;
      }
    }
    
    toast({
      title: "Login failed",
      description: "Invalid email or password",
      variant: "destructive"
    });
    return false;
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (MOCK_PASSWORDS[email]) {
      toast({
        title: "Registration failed",
        description: "Email already in use",
        variant: "destructive"
      });
      return false;
    }
    
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role: 'customer'
    };
    
    // In a real app, this would be handled by the backend
    MOCK_USERS.push(newUser);
    MOCK_PASSWORDS[email] = password;
    
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    
    toast({
      title: "Registration successful",
      description: `Welcome, ${name}!`,
    });
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout
      }}
    >
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
