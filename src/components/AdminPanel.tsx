import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Users, Star, TrendingUp, Download, LogOut, DollarSign, MessageSquare, X } from 'lucide-react';
import { useOnlineUsers } from '../hooks/useOnlineUsers';

interface UserData {
  id: string;
  name: string;
  timestamp: string;
  evaluations: Array<{
    productId: number;
    productName: string;
    rating: string;
    feedback?: string;
    earnedAmount: number;
  }>;
  totalEarned: number;
  finalBalance: number;
  withdrawalData?: {
    fullName: string;
    pixKey: string;
    whatsapp: string;
  };
}

interface AdminPanelProps {
  onLogout: () => void;
}

interface PixelSettings {
  facebookPixelId: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const onlineCount = useOnlineUsers();
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showPixelSettings, setShowPixelSettings] = useState(false);
  const [pixelSettings, setPixelSettings] = useState<PixelSettings>({
    facebookPixelId: ''
  });

  const handleLogout = () => {
    // Remover sessão do localStorage
    localStorage.removeItem('pixreview-admin-session');
    onLogout();
  };

  useEffect(() => {
    // Carregar dados do localStorage
    const savedData = localStorage.getItem('pixreview-admin-data');
    if (savedData) {
      setUsers(JSON.parse(savedData));
    }
    
    // Carregar configurações do pixel
    const savedPixelSettings = localStorage.getItem('pixreview-pixel-settings');
    if (savedPixelSettings) {
      setPixelSettings(JSON.parse(savedPixelSettings));
    }
  }, []);

  const savePixelSettings = () => {
    localStorage.setItem('pixreview-pixel-settings', JSON.stringify(pixelSettings));
    
    // Atualizar pixel no head se já existir
    if (pixelSettings.facebookPixelId) {
      // Remover pixel anterior se existir
      const existingScript = document.getElementById('facebook-pixel-script');
      if (existingScript) {
        existingScript.remove();
      }
      
      // Adicionar novo pixel
      const script = document.createElement('script');
      script.id = 'facebook-pixel-script';
      script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${pixelSettings.facebookPixelId}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(script);
      
      // Adicionar noscript
      const noscript = document.createElement('noscript');
      noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelSettings.facebookPixelId}&ev=PageView&noscript=1" />`;
      document.head.appendChild(noscript);
    }
    
    alert('Configurações do Facebook Pixel salvas com sucesso!');
    setShowPixelSettings(false);
  };

  const getTotalStats = () => {
    const totalUsers = users.length;
    const totalEvaluations = users.reduce((sum, user) => sum + user.evaluations.length, 0);
    const totalPaid = users.reduce((sum, user) => sum + user.finalBalance, 0);
    const avgEvaluationsPerUser = totalUsers > 0 ? (totalEvaluations / totalUsers).toFixed(1) : '0';

    return { totalUsers, totalEvaluations, totalPaid, avgEvaluationsPerUser };
  };

  const exportData = () => {
    const dataStr = JSON.stringify(users, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pixreview-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const exportTxtData = () => {
    let txtContent = `PIXREVIEW - RELATÓRIO DE USUÁRIOS\n`;
    txtContent += `Data de Exportação: ${new Date().toLocaleString('pt-BR')}\n`;
    txtContent += `Total de Usuários: ${users.length}\n`;
    txtContent += `${'='.repeat(60)}\n\n`;

    users.forEach((user, index) => {
      const userNumber = index + 1;
      txtContent += `USUÁRIO #${userNumber.toString().padStart(3, '0')}\n`;
      txtContent += `${'-'.repeat(30)}\n`;
      txtContent += `Nome: ${user.name}\n`;
      txtContent += `ID: ${user.id}\n`;
      txtContent += `Data/Hora: ${new Date(user.timestamp).toLocaleString('pt-BR')}\n`;
      txtContent += `Total de Avaliações: ${user.evaluations.length}\n`;
      txtContent += `Valor Ganho: R$${user.totalEarned.toFixed(2)}\n`;
      txtContent += `Saldo Final: R$${user.finalBalance.toFixed(2)}\n`;
      
      if (user.withdrawalData) {
        txtContent += `\nDADOS PARA SAQUE:\n`;
        txtContent += `Nome Completo: ${user.withdrawalData.fullName}\n`;
        txtContent += `Chave Pix: ${user.withdrawalData.pixKey}\n`;
        txtContent += `WhatsApp: ${user.withdrawalData.whatsapp}\n`;
      }
      
      if (user.evaluations.length > 0) {
        txtContent += `\nAVALIAÇÕES:\n`;
        user.evaluations.forEach((evaluation, evalIndex) => {
          txtContent += `  ${evalIndex + 1}. ${evaluation.productName}\n`;
          txtContent += `     Avaliação: ${getRatingText(evaluation.rating)}\n`;
          txtContent += `     Valor Ganho: R$${evaluation.earnedAmount.toFixed(2)}\n`;
          if (evaluation.feedback) {
            txtContent += `     Feedback: ${evaluation.feedback}\n`;
          }
          txtContent += `\n`;
        });
      }
      
      txtContent += `\n${'='.repeat(60)}\n\n`;
    });

    // Adicionar resumo final
    const totalEvaluations = users.reduce((sum, user) => sum + user.evaluations.length, 0);
    const totalPaid = users.reduce((sum, user) => sum + user.finalBalance, 0);
    
    txtContent += `RESUMO GERAL\n`;
    txtContent += `${'-'.repeat(30)}\n`;
    txtContent += `Total de Usuários: ${users.length}\n`;
    txtContent += `Total de Avaliações: ${totalEvaluations}\n`;
    txtContent += `Total a Pagar: R$${totalPaid.toFixed(2)}\n`;
    txtContent += `Média de Avaliações por Usuário: ${users.length > 0 ? (totalEvaluations / users.length).toFixed(1) : '0'}\n`;

    const txtBlob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(txtBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pixreview-relatorio-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'loved': return 'text-green-600 bg-green-100';
      case 'liked': return 'text-blue-600 bg-blue-100';
      case 'neutral': return 'text-yellow-600 bg-yellow-100';
      case 'disliked': return 'text-red-600 bg-red-100';
      case 'skip': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRatingText = (rating: string) => {
    switch (rating) {
      case 'loved': return 'Amei';
      case 'liked': return 'Curti';
      case 'neutral': return 'Mais ou menos';
      case 'disliked': return 'Não gostei';
      case 'skip': return 'Pulou';
      default: return rating;
    }
  };

  const stats = getTotalStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Pix<span className="text-green-600">Review</span> Admin
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <div className="w-6 h-6 flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Usuários Online</p>
                <p className="text-2xl font-bold text-green-600">{onlineCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Star className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Avaliações</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEvaluations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Média por Usuário</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgEvaluationsPerUser}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Pago</p>
                <p className="text-2xl font-bold text-gray-900">R${stats.totalPaid.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Dados dos Usuários</h2>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowPixelSettings(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <span>📊</span>
              <span>Facebook Pixel</span>
            </button>
            <button
              onClick={exportTxtData}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Exportar TXT</span>
            </button>
            <button
              onClick={exportData}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Exportar JSON</span>
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avaliações
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Final
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">ID: {user.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(user.timestamp).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.evaluations.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      R${user.finalBalance.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserDetails(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Ver Detalhes</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum usuário encontrado</p>
            </div>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Detalhes do Usuário: {selectedUser.name}
                </h3>
                <button
                  onClick={() => setShowUserDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <EyeOff className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* User Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Informações Gerais</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Nome:</span> {selectedUser.name}</p>
                    <p><span className="font-medium">ID:</span> {selectedUser.id}</p>
                    <p><span className="font-medium">Data:</span> {new Date(selectedUser.timestamp).toLocaleString('pt-BR')}</p>
                    <p><span className="font-medium">Total Ganho:</span> <span className="text-green-600 font-bold">R${selectedUser.totalEarned.toFixed(2)}</span></p>
                    <p><span className="font-medium">Saldo Final:</span> <span className="text-green-600 font-bold">R${selectedUser.finalBalance.toFixed(2)}</span></p>
                  </div>
                </div>

                {selectedUser.withdrawalData && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Dados para Saque</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Nome Completo:</span> {selectedUser.withdrawalData.fullName}</p>
                      <p><span className="font-medium">Chave Pix:</span> {selectedUser.withdrawalData.pixKey}</p>
                      <p><span className="font-medium">WhatsApp:</span> {selectedUser.withdrawalData.whatsapp}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Evaluations */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Avaliações ({selectedUser.evaluations.length})</h4>
                <div className="space-y-4">
                  {selectedUser.evaluations.map((evaluation, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-medium text-gray-900">{evaluation.productName}</h5>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getRatingColor(evaluation.rating)}`}>
                            {getRatingText(evaluation.rating)}
                          </span>
                        </div>
                        <span className="text-green-600 font-bold">+R${evaluation.earnedAmount.toFixed(2)}</span>
                      </div>
                      {evaluation.feedback && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">Feedback:</p>
                              <p className="text-sm text-gray-600 mt-1">{evaluation.feedback}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Facebook Pixel Settings Modal */}
      {showPixelSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Configurações do Facebook Pixel
                </h3>
                <button
                  onClick={() => setShowPixelSettings(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facebook Pixel ID
                </label>
                <input
                  type="text"
                  value={pixelSettings.facebookPixelId}
                  onChange={(e) => setPixelSettings(prev => ({ ...prev, facebookPixelId: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="123456789012345"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Encontre seu Pixel ID no Facebook Business Manager
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-900 mb-2">ℹ️ Como funciona:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• O pixel será carregado automaticamente</li>
                  <li>• Evento "Purchase" disparado ao gerar PIX</li>
                  <li>• Valor da compra será enviado</li>
                  <li>• Dados para otimização de campanhas</li>
                </ul>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPixelSettings(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={savePixelSettings}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold"
                >
                  Salvar Pixel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;