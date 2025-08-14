import React from 'react';
import { Users } from 'lucide-react';
import { useOnlineUsers } from '../hooks/useOnlineUsers';

const OnlineUsersCounter: React.FC = () => {
  const onlineCount = useOnlineUsers();

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 shadow-lg flex items-center space-x-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <Users className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          {onlineCount} online
        </span>
      </div>
    </div>
  );
};

export default OnlineUsersCounter;