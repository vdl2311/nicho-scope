import { User } from '../types';

const USERS_KEY = 'nichescope_users';
const SESSION_KEY = 'nichescope_session';

interface StoredUser extends User {
  password: string; // In a real app, this would be hashed. Storing plain text for demo only.
}

export const authService = {
  signup: (name: string, email: string, password: string): User => {
    const usersStr = localStorage.getItem(USERS_KEY);
    const users: StoredUser[] = usersStr ? JSON.parse(usersStr) : [];

    if (users.find(u => u.email === email)) {
      throw new Error('Usuário já existe com este email.');
    }

    const newUser: StoredUser = {
      id: 'user_' + Date.now().toString(36) + Math.random().toString(36).substring(2),
      name,
      email,
      password
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Auto login
    const { password: _, ...userWithoutPassword } = newUser;
    localStorage.setItem(SESSION_KEY, JSON.stringify(userWithoutPassword));
    
    return userWithoutPassword;
  },

  login: (email: string, password: string): User => {
    const usersStr = localStorage.getItem(USERS_KEY);
    const users: StoredUser[] = usersStr ? JSON.parse(usersStr) : [];
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Email ou senha inválidos.');
    }

    const { password: _, ...userWithoutPassword } = user;
    localStorage.setItem(SESSION_KEY, JSON.stringify(userWithoutPassword));
    
    return userWithoutPassword;
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser: (): User | null => {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    return sessionStr ? JSON.parse(sessionStr) : null;
  }
};