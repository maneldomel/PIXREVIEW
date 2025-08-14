import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Users, Star, TrendingUp, Download, LogOut, DollarSign, MessageSquare, X } from 'lucide-react';
import { useOnlineUsers, getActiveQuizUsers } from '../hooks/useOnlineUsers';

interface UserData {
  id: string;
  name: string;
  whatsapp?: string;
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
  allowFutureContact?: boolean;
  contactWhatsapp?: string;
}

interface AdminPanelProps {
  onLogout: () => void;
}

interface PixelSettings {
  facebookPixelId: string;
}

interface VturbSettings {
  welcomeVideoCode: string;
  explanationVideoCode: string;
  relogiosVideoCode: string;
  bolsasVideoCode: string;
  tenisVideoCode: string;
}

interface FunnelData {
  step: string;
  users: number;
  percentage: number;
  dropRate?: number;
}
const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const onlineCount = useOnlineUsers();
  const [activeQuizUsers, setActiveQuizUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [activeSection, setActiveSection] = useState('users');
  const [showPixelSettings, setShowPixelSettings] = useState(false);
  const [showVturbSettings, setShowVturbSettings] = useState(false);
  const [pixelSettings, setPixelSettings] = useState<PixelSettings>({
    facebookPixelId: ''
  });
  const [vturbSettings, setVturbSettings] = useState<VturbSettings>({
    welcomeVideoCode: '',
    explanationVideoCode: '',
    relogiosVideoCode: '',
    bolsasVideoCode: '',
    tenisVideoCode: ''
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
    
    // Atualizar usuários ativos no quiz a cada 3 segundos
    const updateActiveUsers = () => {
      setActiveQuizUsers(getActiveQuizUsers());
    };
    
    updateActiveUsers();
    const interval = setInterval(updateActiveUsers, 3000);
    
    // Carregar configurações do pixel
    const savedPixelSettings = localStorage.getItem('pixreview-pixel-settings');
    if (savedPixelSettings) {
      setPixelSettings(JSON.parse(savedPixelSettings));
    }
    
    // Carregar configurações do vturb
    const savedVturbSettings = localStorage.getItem('pixreview-vturb-settings');
    if (savedVturbSettings) {
      setVturbSettings(JSON.parse(savedVturbSettings));
    }
    
    return () => clearInterval(interval);
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

  const saveVturbSettings = () => {
    localStorage.setItem('pixreview-vturb-settings', JSON.stringify(vturbSettings));
    
    // Aplicar códigos vturb imediatamente
    applyVturbCodes();
    
    alert('Configurações do vturb salvas com sucesso!');
    setShowVturbSettings(false);
  };

  const applyVturbCodes = () => {
    // Aplicar código do vídeo de boas-vindas
    const welcomeContainer = document.getElementById('vturb-video-welcome');
    if (welcomeContainer && vturbSettings.welcomeVideoCode) {
      welcomeContainer.innerHTML = vturbSettings.welcomeVideoCode;
    }
    
    // Aplicar código do vídeo explicativo
    const explanationContainer = document.getElementById('vturb-video-explanation');
    if (explanationContainer && vturbSettings.explanationVideoCode) {
      explanationContainer.innerHTML = vturbSettings.explanationVideoCode;
    }
    
    // Aplicar código do vídeo de relógios
    const relogiosContainer = document.getElementById('vturb-video-relogios');
    if (relogiosContainer && vturbSettings.relogiosVideoCode) {
      relogiosContainer.innerHTML = vturbSettings.relogiosVideoCode;
    }
    
    // Aplicar código do vídeo de bolsas
    const bolsasContainer = document.getElementById('vturb-video-bolsas');
    if (bolsasContainer && vturbSettings.bolsasVideoCode) {
      bolsasContainer.innerHTML = vturbSettings.bolsasVideoCode;
    }
    
    // Aplicar código do vídeo de tênis
    const tenisContainer = document.getElementById('vturb-video-tenis');
    if (tenisContainer && vturbSettings.tenisVideoCode) {
      tenisContainer.innerHTML = vturbSettings.tenisVideoCode;
    }
  };

  const getTotalStats = () => {
    const totalUsersStarted = users.length;
    const totalEvaluations = users.reduce((sum, user) => sum + user.evaluations.length, 0);
    const usersCompleted = users.filter(user => user.evaluations.length >= 7).length; // 7 produtos no quiz
    const pixGenerated = users.filter(user => user.whatsapp).length;
    const conversionRate = totalUsersStarted > 0 ? ((usersCompleted / totalUsersStarted) * 100).toFixed(1) : '0';

    return { totalUsersStarted, usersCompleted, totalEvaluations, pixGenerated, conversionRate };
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
      if (user.whatsapp) {
        txtContent += `WhatsApp: ${user.whatsapp}\n`;
      }
      txtContent += `ID: ${user.id}\n`;
      txtContent += `Data/Hora: ${new Date(user.timestamp).toLocaleString('pt-BR')}\n`;
      txtContent += `Total de Avaliações: ${user.evaluations.length}\n`;
      txtContent += `Valor Ganho: R$${user.totalEarned.toFixed(2)}\n`;
      txtContent += `Saldo Final: R$${user.finalBalance.toFixed(2)}\n`;
      
      if (user.allowFutureContact !== undefined) {
        txtContent += `Aceita Contato Futuro: ${user.allowFutureContact ? 'Sim' : 'Não'}\n`;
        if (user.contactWhatsapp) {
          txtContent += `WhatsApp para Contato: ${user.contactWhatsapp}\n`;
        }
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
    const stats = getTotalStats();
    
    txtContent += `RESUMO GERAL\n`;
    txtContent += `${'-'.repeat(30)}\n`;
    txtContent += `Usuários que Iniciaram: ${stats.totalUsersStarted}\n`;
    txtContent += `Usuários que Completaram: ${stats.usersCompleted}\n`;
    txtContent += `Taxa de Conversão: ${stats.conversionRate}%\n`;
    txtContent += `Total de Avaliações: ${stats.totalEvaluations}\n`;
    txtContent += `Usuários Finalizaram: ${stats.pixGenerated}\n`;

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
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
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
                <p className="text-sm font-medium text-gray-600">Usuários Iniciaram</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsersStarted}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Usuários Completaram</p>
                <p className="text-2xl font-bold text-gray-900">{stats.usersCompleted}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
                <p className="text-2xl font-bold text-gray-900">{stats.conversionRate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Avaliações</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEvaluations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">PIX Gerados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pixGenerated}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Dados dos Usuários</h2>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowFunnelAnalysis(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <span>📊</span>
              <span>Análise de Funil</span>
            </button>
            <button
              onClick={() => setShowVturbSettings(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <span>🎥</span>
              <span>Configurar vturb</span>
            </button>
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

      {/* Live Quiz Progress Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <h3 className="text-lg font-semibold text-gray-900">
                Usuários Online no Quiz ({activeQuizUsers.length})
              </h3>
            </div>
          </div>

          <div className="p-6">
            {activeQuizUsers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeQuizUsers.map((user, index) => {
                  const progressPercentage = Math.round((user.evaluationsCount || 0) / 7 * 100);
                  const stepText = user.currentStep === 1 ? 'Assistindo vídeo' : 
                                 user.currentStep === 2 ? 'Avaliando produtos' : 'Iniciando';
                  
                  return (
                    <div key={user.id} className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="font-medium text-gray-900">
                            {user.userName || `Usuário ${index + 1}`}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">{stepText}</span>
                      </div>
                      
                      <div className="mb-2">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progresso do Quiz</span>
                          <span className="font-medium">{progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        {user.evaluationsCount || 0} de 7 avaliações
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum usuário ativo no quiz no momento</p>
              </div>
            )}
          </div>
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
                    {selectedUser.whatsapp && (
                      <p><span className="font-medium">WhatsApp:</span> {selectedUser.whatsapp}</p>
                    )}
                    <p><span className="font-medium">Total Ganho:</span> <span className="text-green-600 font-bold">R${selectedUser.totalEarned.toFixed(2)}</span></p>
                    <p><span className="font-medium">Saldo Final:</span> <span className="text-green-600 font-bold">R${selectedUser.finalBalance.toFixed(2)}</span></p>
                  </div>
                </div>

                {(selectedUser.allowFutureContact !== undefined || selectedUser.contactWhatsapp) && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Contato Futuro</h4>
                    <div className="space-y-2 text-sm">
                      {selectedUser.allowFutureContact !== undefined && (
                        <p><span className="font-medium">Aceita Contato:</span> {selectedUser.allowFutureContact ? 'Sim' : 'Não'}</p>
                      )}
                      {selectedUser.contactWhatsapp && (
                        <p><span className="font-medium">WhatsApp:</span> {selectedUser.contactWhatsapp}</p>
                      )}
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

      {/* Funnel Analysis Modal */}
      {showFunnelAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  📊 Análise de Funil de Conversão
                </h3>
                <button
                  onClick={() => setShowFunnelAnalysis(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {getFunnelData().map((step, index) => (
                  <div key={step.step} className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-blue-500' :
                          index === 1 ? 'bg-green-500' :
                          index === 2 ? 'bg-yellow-500' :
                          index === 3 ? 'bg-orange-500' :
                          'bg-red-500'
                        }`}>
                          {index + 1}
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">{step.step}</h4>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{step.users}</div>
                        <div className="text-sm text-gray-500">{step.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                      <div 
                        className={`h-4 rounded-full transition-all duration-500 ${
                          index === 0 ? 'bg-blue-500' :
                          index === 1 ? 'bg-green-500' :
                          index === 2 ? 'bg-yellow-500' :
                          index === 3 ? 'bg-orange-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${step.percentage}%` }}
                      ></div>
                    </div>
                    
                    {step.dropRate !== undefined && step.dropRate > 0 && (
                      <div className="text-sm text-red-600 font-medium">
                        ⚠️ Taxa de abandono: {step.dropRate.toFixed(1)}%
                      </div>
                    )}
                    
                    {index < getFunnelData().length - 1 && (
                      <div className="flex justify-center mt-4 mb-2">
                        <div className="w-0.5 h-8 bg-gray-300"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">💡 Insights do Funil:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Conversão geral:</strong> {getFunnelData().length > 0 ? getFunnelData()[getFunnelData().length - 1].percentage.toFixed(1) : 0}% dos visitantes finalizam</li>
                  <li>• <strong>Maior abandono:</strong> {getFunnelData().reduce((max, step) => step.dropRate && step.dropRate > (max.dropRate || 0) ? step : max, { step: 'N/A', dropRate: 0 }).step}</li>
                  <li>• <strong>Ponto forte:</strong> {getFunnelData().find(step => step.dropRate && step.dropRate < 20)?.step || 'Identificar melhorias'}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* vturb Settings Modal */}
      {showVturbSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  🎥 Configurações dos Vídeos vturb
                </h3>
                <button
                  onClick={() => setShowVturbSettings(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🎬 Vídeo de Boas-vindas (Tela Inicial)
                </label>
                <textarea
                  value={vturbSettings.welcomeVideoCode}
                  onChange={(e) => setVturbSettings(prev => ({ ...prev, welcomeVideoCode: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none h-32 font-mono text-sm"
                  placeholder="Cole aqui o código HTML do vturb para o vídeo de boas-vindas..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  Este vídeo aparece na tela inicial antes do usuário informar o nome
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📚 Vídeo Explicativo (Como Funciona)
                </label>
                <textarea
                  value={vturbSettings.explanationVideoCode}
                  onChange={(e) => setVturbSettings(prev => ({ ...prev, explanationVideoCode: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none h-32 font-mono text-sm"
                  placeholder="Cole aqui o código HTML do vturb para o vídeo explicativo..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  Este vídeo explica como funciona o quiz antes de começar as avaliações
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🎯 Vídeos Intermediários (Entre Categorias)
                </label>
                <textarea
                  value={vturbSettings.interludeVideoCode}
                  onChange={(e) => setVturbSettings(prev => ({ ...prev, interludeVideoCode: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none h-32 font-mono text-sm"
                  placeholder="Cole aqui o código HTML do vturb para os vídeos intermediários..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  Este código será usado para todos os vídeos que aparecem entre as categorias de produtos
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2">⚠️ Instruções Importantes:</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Cole o código HTML completo fornecido pelo vturb</li>
                  <li>• Inclua todas as tags &lt;script&gt; e &lt;div&gt; necessárias</li>
                  <li>• Os vídeos serão aplicados imediatamente após salvar</li>
                  <li>• Teste sempre após configurar para garantir funcionamento</li>
                </ul>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowVturbSettings(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveVturbSettings}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold"
                >
                  Salvar Configurações
                </button>
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