import { useState, useEffect } from 'react';

interface OnlineUser {
  id: string;
  timestamp: number;
  lastSeen: number;
}

export const useOnlineUsers = () => {
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    const updateOnlineUsers = () => {
      const currentTime = Date.now();
      const sessionId = getOrCreateSessionId();
      
      // Buscar usuários online existentes
      const existingUsers = getOnlineUsers();
      
      // Filtrar usuários ativos (últimos 30 segundos)
      const activeUsers = existingUsers.filter(user => 
        currentTime - user.lastSeen < 30000
      );
      
      // Atualizar ou adicionar usuário atual
      const userIndex = activeUsers.findIndex(user => user.id === sessionId);
      if (userIndex >= 0) {
        activeUsers[userIndex].lastSeen = currentTime;
      } else {
        activeUsers.push({
          id: sessionId,
          timestamp: currentTime,
          lastSeen: currentTime
        });
      }
      
      // Salvar usuários ativos
      localStorage.setItem('pixreview-online-users', JSON.stringify(activeUsers));
      setOnlineCount(activeUsers.length);
      
      // Disparar evento para outras abas
      window.dispatchEvent(new CustomEvent('pixreview-users-updated'));
    };

    const handleStorageChange = () => {
      const users = getOnlineUsers();
      const currentTime = Date.now();
      const activeUsers = users.filter(user => 
        currentTime - user.lastSeen < 30000
      );
      setOnlineCount(activeUsers.length);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateOnlineUsers();
      }
    };

    const handleBeforeUnload = () => {
      const sessionId = getOrCreateSessionId();
      const users = getOnlineUsers();
      const filteredUsers = users.filter(user => user.id !== sessionId);
      localStorage.setItem('pixreview-online-users', JSON.stringify(filteredUsers));
    };

    // Atualizar imediatamente
    updateOnlineUsers();

    // Configurar intervalos e listeners
    const interval = setInterval(updateOnlineUsers, 5000); // A cada 5 segundos
    const cleanupInterval = setInterval(() => {
      const users = getOnlineUsers();
      const currentTime = Date.now();
      const activeUsers = users.filter(user => 
        currentTime - user.lastSeen < 30000
      );
      localStorage.setItem('pixreview-online-users', JSON.stringify(activeUsers));
      setOnlineCount(activeUsers.length);
    }, 10000); // Limpeza a cada 10 segundos

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('pixreview-users-updated', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      clearInterval(cleanupInterval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('pixreview-users-updated', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return onlineCount;
};

const getOrCreateSessionId = (): string => {
  let sessionId = sessionStorage.getItem('pixreview-session-id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('pixreview-session-id', sessionId);
  }
  return sessionId;
};

const getOnlineUsers = (): OnlineUser[] => {
  try {
    const users = localStorage.getItem('pixreview-online-users');
    return users ? JSON.parse(users) : [];
  } catch {
    return [];
  }
};