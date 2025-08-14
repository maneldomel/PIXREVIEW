import { useState, useEffect } from 'react';

interface OnlineUser {
  id: string;
  timestamp: number;
  lastSeen: number;
  currentStep?: number;
  userName?: string;
  evaluationsCount?: number;
  ipAddress?: string;
}

export const useOnlineUsers = () => {
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    const updateOnlineUsers = () => {
      const currentTime = Date.now();
      const { sessionId, ipAddress } = getOrCreateSessionId();
      
      // Não contar admin como usuário no quiz
      const isAdmin = window.location.search.includes('admin=true');
      if (isAdmin) return;
      
      // Buscar usuários online existentes
      const existingUsers = getOnlineUsers();
      
      // Filtrar usuários ativos (últimos 30 segundos)
      const activeUsers = existingUsers.filter(user => 
        currentTime - user.lastSeen < 30000
      );
      
      // Verificar se já existe usuário com mesmo IP (apenas uma sessão por IP)
      const existingIpUser = activeUsers.find(user => user.ipAddress === ipAddress);
      
      if (existingIpUser && existingIpUser.id !== sessionId) {
        // Remover sessão anterior do mesmo IP
        const filteredUsers = activeUsers.filter(user => user.ipAddress !== ipAddress);
        activeUsers.length = 0;
        activeUsers.push(...filteredUsers);
      }
      
      // Atualizar ou adicionar usuário atual
      const userIndex = activeUsers.findIndex(user => user.id === sessionId);
      
      // Buscar dados do usuário atual se disponível
      const currentUserData = getCurrentUserData();
      
      if (userIndex >= 0) {
        activeUsers[userIndex].lastSeen = currentTime;
        activeUsers[userIndex].ipAddress = ipAddress;
        if (currentUserData) {
          activeUsers[userIndex].currentStep = currentUserData.currentStep;
          activeUsers[userIndex].userName = currentUserData.userName;
          activeUsers[userIndex].evaluationsCount = currentUserData.evaluationsCount;
        }
      } else {
        activeUsers.push({
          id: sessionId,
          timestamp: currentTime,
          lastSeen: currentTime,
          ipAddress: ipAddress,
          ...currentUserData
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

export const getActiveQuizUsers = (): OnlineUser[] => {
  try {
    const users = localStorage.getItem('pixreview-online-users');
    const onlineUsers: OnlineUser[] = users ? JSON.parse(users) : [];
    const currentTime = Date.now();
    
    // Filtrar usuários ativos nos últimos 30 segundos
    return onlineUsers.filter(user => 
      currentTime - user.lastSeen < 30000 && 
      user.currentStep !== undefined &&
      user.currentStep > 0
    );
  } catch {
    return [];
  }
};

const getCurrentUserData = () => {
  try {
    const currentStep = parseInt(localStorage.getItem('pixreview-current-step') || '0');
    const userName = localStorage.getItem('pixreview-current-user-name') || '';
    const evaluationsCount = parseInt(localStorage.getItem('pixreview-evaluations-count') || '0');
    
    if (currentStep > 0) {
      return {
        currentStep,
        userName,
        evaluationsCount
      };
    }
    return null;
  } catch {
    return null;
  }
};

const getOrCreateSessionId = (): { sessionId: string; ipAddress: string } => {
  let sessionId = sessionStorage.getItem('pixreview-session-id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('pixreview-session-id', sessionId);
  }
  
  // Simular IP (em produção seria obtido do servidor)
  let ipAddress = localStorage.getItem('pixreview-simulated-ip');
  if (!ipAddress) {
    // Gerar IP simulado único por dispositivo
    const randomIp = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    ipAddress = randomIp;
    localStorage.setItem('pixreview-simulated-ip', ipAddress);
  }
  
  return { sessionId, ipAddress };
};

const getOnlineUsers = (): OnlineUser[] => {
  try {
    const users = localStorage.getItem('pixreview-online-users');
    return users ? JSON.parse(users) : [];
  } catch {
    return [];
  }
};