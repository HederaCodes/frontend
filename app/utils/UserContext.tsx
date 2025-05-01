"use client";

import { v4 as uuidv4 } from 'uuid';

import { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface UserContextType {
  userId: string;
  isLoading: boolean;
  error: string | null;
  initializeUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  userId: '',
  isLoading: true,
  error: null,
  initializeUser: async () => {},
});

export const useUser = () => useContext(UserContext);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const initializeUser = async () => {
    if (userId) return; // Skip if already initialized
    
    setIsLoading(true);
    setError(null);
    const userIdFromStorage = localStorage.getItem('userId');
    if (userIdFromStorage) {
      setUserId(userIdFromStorage);
      setIsLoading(false);
      return;
    }
    try {
      const genereatedUserId = uuidv4();
      localStorage.setItem('userId', genereatedUserId);
      const response = await fetch('http://localhost:8000/api/assistant/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: genereatedUserId
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUserId(data.userId);
        console.log('Assistant initialized with user ID:', data.userId);
      } else {
        console.error('Failed to initialize assistant:', data.error || data.message);
        setError('Failed to connect to the assistant. Please try again later.');
      }
    } catch (err) {
      console.error('Error initializing assistant:', err);
      setError('Failed to connect to the assistant. Please check if the server is running.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initialize on mount
  useEffect(() => {
    initializeUser();
  }, []);
  
  return (
    <UserContext.Provider value={{ userId, isLoading, error, initializeUser }}>
      {children}
    </UserContext.Provider>
  );
};