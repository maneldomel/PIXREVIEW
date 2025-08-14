import React, { useState, useEffect } from 'react';
import { Send, Play, X, Star, Heart, Meh, ThumbsDown, SkipForward, DollarSign, Gift } from 'lucide-react';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import OnlineUsersCounter from './components/OnlineUsersCounter';

// Função para disparar evento do Facebook Pixel
const trackFacebookPixelPurchase = (value: number, currency: string = 'BRL') => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'Purchase', {
      value: value,
      currency: currency
    });
    console.log('Facebook Pixel Purchase event tracked:', { value, currency });
  }
};

// Carregar Facebook Pixel se configurado
const loadFacebookPixel = () => {
  const pixelSettings = localStorage.getItem('pixreview-pixel-settings');
  if (pixelSettings) {
    const settings = JSON.parse(pixelSettings);
    if (settings.facebookPixelId) {
      // Verificar se já não foi carregado
      if (!document.getElementById('facebook-pixel-script')) {
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
          fbq('init', '${settings.facebookPixelId}');
          fbq('track', 'PageView');
        `;
        document.head.appendChild(script);
      }
    }
  }
};

// Carregar códigos vturb se configurado
const loadVturbCodes = () => {
  const vturbSettings = localStorage.getItem('pixreview-vturb-settings');
  if (vturbSettings) {
    const settings = JSON.parse(vturbSettings);
    
    // Aplicar código do vídeo de boas-vindas
    const welcomeContainer = document.getElementById('vturb-video-welcome');
    if (welcomeContainer && settings.welcomeVideoCode) {
      welcomeContainer.innerHTML = settings.welcomeVideoCode;
    }
    
    // Aplicar código do vídeo explicativo
    const explanationContainer = document.getElementById('vturb-video-explanation');
    if (explanationContainer && settings.explanationVideoCode) {
      explanationContainer.innerHTML = settings.explanationVideoCode;
    }
    
    // Aplicar códigos dos vídeos intermediários individuais
    const interlude1Container = document.getElementById('vturb-video-interlude-2');
    if (interlude1Container && settings.interludeVideo1Code) {
      interlude1Container.innerHTML = settings.interludeVideo1Code;
    }
    
    const interlude2Container = document.getElementById('vturb-video-interlude-4');
    if (interlude2Container && settings.interludeVideo2Code) {
      interlude2Container.innerHTML = settings.interludeVideo2Code;
    }
    
    const interlude3Container = document.getElementById('vturb-video-interlude-6');
    if (interlude3Container && settings.interludeVideo3Code) {
      interlude3Container.innerHTML = settings.interludeVideo3Code;
    }
  }
};

interface Product {
  id: number;
  name: string;
  category: string;
  image: string;
}

const products: Product[] = [
  {
    id: 1,
    name: "Relógio Invicta Pro Diver",
    category: "Relógios",
    image: "https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg"
  },
  {
    id: 2,
    name: "Relógio Casio Vintage Dourado",
    category: "Relógios",
    image: "https://images.pexels.com/photos/277390/pexels-photo-277390.jpeg"
  },
  {
    id: 3,
    name: "Bolsa Michael Kors Jet Set",
    category: "Bolsas",
    image: "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg"
  },
  {
    id: 4,
    name: "Bolsa Louis Vuitton Neverfull",
    category: "Bolsas",
    image: "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg"
  },
  {
    id: 5,
    name: "Tênis Nike Air Max 90",
    category: "Tênis",
    image: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg"
  },
  {
    id: 6,
    name: "Tênis Adidas Yeezy Boost 350",
    category: "Tênis",
    image: "https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg"
  },
  {
    id: 7,
    name: "Tênis New Balance 574 Classic",
    category: "Tênis",
    image: "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg"
  }
];

// Som de dinheiro usando Web Audio API
const playMoneySound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  // Criar som de "cha-ching" usando osciladores
  const oscillator1 = audioContext.createOscillator();
  const oscillator2 = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator1.connect(gainNode);
  oscillator2.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  // Frequências para som de dinheiro
  oscillator1.frequency.setValueAtTime(800, audioContext.currentTime);
  oscillator2.frequency.setValueAtTime(1200, audioContext.currentTime);
  
  // Envelope do som
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
  
  oscillator1.start(audioContext.currentTime);
  oscillator2.start(audioContext.currentTime);
  oscillator1.stop(audioContext.currentTime + 0.3);
  oscillator2.stop(audioContext.currentTime + 0.3);
};

function App() {
  const [showNamePopup, setShowNamePopup] = useState(false);
  const [userName, setUserName] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showOpeningAnimation, setShowOpeningAnimation] = useState(true);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [balance, setBalance] = useState(0);
  const [evaluationsCount, setEvaluationsCount] = useState(0);
  const [showVideoInterlude, setShowVideoInterlude] = useState(false);
  const [showFinalScreen, setShowFinalScreen] = useState(false);
  const [showWithdrawPopup, setShowWithdrawPopup] = useState(false);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [showAdmin, setShowAdmin] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [contactWhatsapp, setContactWhatsapp] = useState('');
  const [allowFutureContact, setAllowFutureContact] = useState(false);

  // Verificar se deve mostrar admin (URL com ?admin=true)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') {
      setShowAdmin(true);
    }
    
    // Carregar Facebook Pixel
    loadFacebookPixel();
  }, []);

  // Salvar dados do usuário no localStorage para o admin
  const saveUserDataForAdmin = (userData: any) => {
    const existingData = localStorage.getItem('pixreview-admin-data');
    const adminData = existingData ? JSON.parse(existingData) : [];
    
    // Verificar se usuário já existe (atualizar) ou adicionar novo
    const existingUserIndex = adminData.findIndex((user: any) => user.id === userData.id);
    
    if (existingUserIndex >= 0) {
      adminData[existingUserIndex] = userData;
    } else {
      adminData.push(userData);
    }
    
    localStorage.setItem('pixreview-admin-data', JSON.stringify(adminData));
  };

  // Mostrar popup após 5 segundos
  useEffect(() => {
    // Animação de abertura por 3 segundos
    const openingTimer = setTimeout(() => {
      setShowOpeningAnimation(false);
      setIsLoaded(true);
    }, 3000);

    const loadTimer = setTimeout(() => {
      // Timer removido, controlado pela animação de abertura
    }, 100);

    if (currentStep === 0) {
      const timer = setTimeout(() => {
        setShowNamePopup(true);
      }, 5000);

      return () => {
        clearTimeout(timer);
        clearTimeout(loadTimer);
        clearTimeout(openingTimer);
      };
    }

    return () => {
      clearTimeout(openingTimer);
      clearTimeout(loadTimer);
    };
  }, [currentStep]);

  const handleSubmitName = () => {
    if (!inputValue.trim()) return;
    
    setUserName(inputValue);
    localStorage.setItem('pixreview-current-user-name', inputValue);
    setShowNamePopup(false);
    setCurrentStep(1);
    localStorage.setItem('pixreview-current-step', '1');
    setInputValue('');
    
    // Criar ID único para o usuário
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('pixreview-current-user-id', userId);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmitName();
    }
  };

  const handleVideoClick = () => {
    if (currentStep === 1) {
      setCurrentStep(2); // Ir para avaliação de produtos
      localStorage.setItem('pixreview-current-step', '2');
    } else if (showVideoInterlude) {
      setShowVideoInterlude(false);
      // Recarregar códigos vturb após mudança de vídeo
      setTimeout(loadVturbCodes, 100);
    }
  };

  const handleProductEvaluation = (rating: string) => {
    if (rating === 'disliked') {
      setShowFeedbackPopup(true);
      return;
    }
    
    proceedToNextProduct(rating);
  };

  const proceedToNextProduct = (rating: string) => {
    const currentUserId = localStorage.getItem('pixreview-current-user-id') || 'unknown';
    
    if (rating !== 'skip') {
      const earnedValue = Math.random() * (180.50 - 120.20) + 120.20;
      setBalance(prev => prev + earnedValue);
      setEvaluationsCount(prev => prev + 1);
      localStorage.setItem('pixreview-evaluations-count', (evaluationsCount + 1).toString());
      
      // Salvar avaliação
      const evaluationData = {
        productId: products[currentProductIndex].id,
        productName: products[currentProductIndex].name,
        rating: rating,
        feedback: rating === 'disliked' && feedbackText ? feedbackText : undefined,
        earnedAmount: earnedValue,
        timestamp: new Date().toISOString()
      };
      
      // Atualizar dados do usuário
      const existingData = localStorage.getItem('pixreview-admin-data');
      const adminData = existingData ? JSON.parse(existingData) : [];
      let currentUser = adminData.find((user: any) => user.id === currentUserId);
      
      if (!currentUser) {
        currentUser = {
          id: currentUserId,
          name: userName,
          timestamp: new Date().toISOString(),
          evaluations: [],
          totalEarned: 0,
          finalBalance: 0
        };
        adminData.push(currentUser);
      }
      
      currentUser.evaluations.push(evaluationData);
      currentUser.totalEarned += earnedValue;
      currentUser.finalBalance = currentUser.totalEarned + 150.00; // Incluir bônus
      
      localStorage.setItem('pixreview-admin-data', JSON.stringify(adminData));
      
      // Tocar som de dinheiro
      playMoneySound();
    }

    // Verificar se deve mostrar vídeo intermediário
    const nextProductIndex = currentProductIndex + 1;
    if (nextProductIndex < products.length && (nextProductIndex) % 2 === 0) {
      setShowVideoInterlude(true);
      setCurrentProductIndex(nextProductIndex);
    } else if (nextProductIndex >= products.length) {
      // Finalizar avaliações
      setShowContactPopup(true);
    } else {
      setCurrentProductIndex(nextProductIndex);
    }
  };

  const handleFeedbackSubmit = (withFeedback: boolean) => {
    if (withFeedback && feedbackText.trim()) {
      // Ganhar R$50,00 por dar feedback
      setBalance(prev => prev + 50.00);
      playMoneySound();
    }
    
    setShowFeedbackPopup(false);
    setFeedbackText('');
    proceedToNextProduct('disliked');
  };

  const handleContactSubmit = (allowContact: boolean) => {
    const currentUserId = localStorage.getItem('pixreview-current-user-id') || 'unknown';
    const existingData = localStorage.getItem('pixreview-admin-data');
    const adminData = existingData ? JSON.parse(existingData) : [];
    const currentUser = adminData.find((user: any) => user.id === currentUserId);
    
    if (currentUser) {
      currentUser.allowFutureContact = allowContact;
      if (allowContact && contactWhatsapp.trim()) {
        currentUser.contactWhatsapp = contactWhatsapp;
      }
      localStorage.setItem('pixreview-admin-data', JSON.stringify(adminData));
    }
    
    setShowContactPopup(false);
    setShowFinalScreen(true);
  };

  const handleFinalSubmit = () => {
    if (!contactWhatsapp.trim()) {
      return;
    }
    
    // Salvar WhatsApp final
    const currentUserId = localStorage.getItem('pixreview-current-user-id') || 'unknown';
    const existingData = localStorage.getItem('pixreview-admin-data');
    const adminData = existingData ? JSON.parse(existingData) : [];
    const currentUser = adminData.find((user: any) => user.id === currentUserId);
    
    if (currentUser) {
      currentUser.whatsapp = contactWhatsapp;
      localStorage.setItem('pixreview-admin-data', JSON.stringify(adminData));
    }
    
    console.log('Dados finais:', { name: userName, whatsapp: contactWhatsapp });
    
    // Disparar evento Purchase do Facebook Pixel
    trackFacebookPixelPurchase(finalBalance);
    
    alert('Dados salvos com sucesso! Obrigado pela participação.');
    setShowFinalScreen(false);
    setCurrentStep(0); // Reiniciar
  };

  const getVideoMessage = () => {
    const productIndex = currentProductIndex;
    if (productIndex === 2) return `Boa, ${userName}! Agora vamos pra nossa sessão de bolsas exclusivas, tá pronta?`;
    if (productIndex === 4) return `Perfeito, ${userName}! Agora chegou a hora dos tênis mais desejados!`;
    if (productIndex === 6) return `Quase lá, ${userName}! Último produto pra você avaliar!`;
    return `Vamos continuar, ${userName}!`;
  };

  const finalBalance = balance + 150.00;

  // Mostrar painel admin se solicitado
  if (showAdmin) {
    if (!isAdminLoggedIn) {
      return <AdminLogin onLogin={() => setIsAdminLoggedIn(true)} />;
    } else {
      return <AdminPanel onLogout={() => {
        setIsAdminLoggedIn(false);
        setShowAdmin(false);
        // Limpar parâmetro da URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }} />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-x-hidden">
      
      {/* Animação de Abertura */}
      {showOpeningAnimation && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center z-50">
          <div className="text-center">
            {/* Logo animado */}
            <div className="mb-8 animate-bounce">
              <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
                <DollarSign className="w-12 h-12 text-blue-600" />
              </div>
            </div>
            
            {/* Nome do app com animação */}
            <div className="overflow-hidden">
              <h1 className="text-5xl font-bold text-white mb-2 animate-pulse">
                <span className="inline-block animate-bounce" style={{ animationDelay: '0ms' }}>P</span>
                <span className="inline-block animate-bounce" style={{ animationDelay: '100ms' }}>i</span>
                <span className="inline-block animate-bounce" style={{ animationDelay: '200ms' }}>x</span>
                <span className="inline-block animate-bounce text-green-300" style={{ animationDelay: '300ms' }}>R</span>
                <span className="inline-block animate-bounce text-green-300" style={{ animationDelay: '400ms' }}>e</span>
                <span className="inline-block animate-bounce text-green-300" style={{ animationDelay: '500ms' }}>v</span>
                <span className="inline-block animate-bounce text-green-300" style={{ animationDelay: '600ms' }}>i</span>
                <span className="inline-block animate-bounce text-green-300" style={{ animationDelay: '700ms' }}>e</span>
                <span className="inline-block animate-bounce text-green-300" style={{ animationDelay: '800ms' }}>w</span>
              </h1>
            </div>
            
            <p className="text-blue-100 text-lg font-medium animate-fade-in" style={{ animationDelay: '1s' }}>
              Avalie produtos e ganhe dinheiro
            </p>
            
            {/* Indicador de carregamento */}
            <div className="mt-8 flex justify-center">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Fixo - Estilo App */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-1000 ease-out ${
        isLoaded && !showOpeningAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}>
        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-green-500 shadow-lg px-4 py-4">
          <div className="flex items-center justify-center space-x-2">
            <div 
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200"
              onClick={() => setShowAdmin(true)}
            >
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <h1 className="text-xl font-bold text-white">
              Pix<span className="text-green-200">Review</span>
            </h1>
          </div>
        </div>
      </div>
      
      {/* Barra de Saldo - Posicionamento Melhorado */}
      {(currentStep >= 2 && !showFinalScreen) && (
        <div className={`fixed top-20 left-0 right-0 z-40 px-4 transition-all duration-800 ease-out ${
          isLoaded && !showOpeningAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center justify-center space-x-2 max-w-xs mx-auto">
            <DollarSign className="w-4 h-4" />
            <span className="font-bold text-base">R${balance.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Tela 1 - Vídeo de Boas-vindas */}
      {currentStep === 0 && !showOpeningAnimation && (
        <div className="min-h-screen flex flex-col justify-center px-4 pt-24 pb-8">
          <div className={`w-full max-w-sm mx-auto transition-all duration-1200 ease-out ${
            isLoaded && !showOpeningAnimation ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
          }`} style={{ transitionDelay: '400ms' }}>
            
            {/* Container do Vídeo - Otimizado para vturb */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl mb-6">
              {/* Container otimizado para vturb JavaScript */}
              <div 
                id="vturb-video-welcome"
                className="w-full aspect-[9/16] bg-gray-900 rounded-2xl overflow-hidden relative"
                data-vturb-container="true"
                data-video-type="welcome"
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Popup para Nome - Design App */}
      {showNamePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm mx-auto bg-white rounded-2xl p-6 shadow-2xl">
            
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Qual é o seu nome?</h3>
              <p className="text-gray-600 text-sm">Deixa a gente te conhecer melhor</p>
            </div>

            <div className="mb-6">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite seu nome aqui…"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg"
                autoFocus
              />
            </div>

            <button
              onClick={handleSubmitName}
              disabled={!inputValue.trim()}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl hover:from-blue-600 hover:to-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 font-semibold"
            >
              Começar avaliações
            </button>
          </div>
        </div>
      )}

      {/* Popup de Feedback */}
      {showFeedbackPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm mx-auto bg-white rounded-2xl p-6 shadow-2xl">
            
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Nos conte o porquê</h3>
              <p className="text-gray-600 text-sm">Sua opinião nos ajuda a melhorar</p>
              <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-700 text-sm font-medium">
                  💰 Ganhe <strong>R$50,00</strong> por responder!
                </p>
              </div>
            </div>

            <div className="mb-6">
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="O que você não gostou neste produto?"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-24"
                maxLength={200}
              />
              <div className="text-right text-xs text-gray-400 mt-1">
                {feedbackText.length}/200
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleFeedbackSubmit(true)}
                disabled={!feedbackText.trim()}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl hover:from-blue-600 hover:to-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 font-semibold"
              >
                Enviar e ganhar R$50,00
              </button>
              
              <button
                onClick={() => handleFeedbackSubmit(false)}
                className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium"
              >
                Prefiro não dizer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup de Contato Futuro */}
      {showContactPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm mx-auto bg-white rounded-2xl p-6 shadow-2xl">
            
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Quase terminando! 🎉</h3>
              <p className="text-gray-600 text-sm">Podemos te contatar para avaliações futuras?</p>
              <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-700 text-sm font-medium">
                  💰 Ganhe dinheiro em novos produtos!
                </p>
              </div>
            </div>

            <div className="mb-6">
              <input
                type="text"
                value={contactWhatsapp}
                onChange={(e) => setContactWhatsapp(e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-2">
                Seu WhatsApp para futuras oportunidades
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleContactSubmit(true)}
                disabled={!contactWhatsapp.trim()}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl hover:from-blue-600 hover:to-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 font-semibold"
              >
                Sim, quero participar!
              </button>
              
              <button
                onClick={() => handleContactSubmit(false)}
                className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium"
              >
                Não, obrigado
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tela 1.5 - Vídeo Explicativo */}
      {currentStep === 1 && (
        <div className="min-h-screen flex flex-col justify-center px-4 pt-28 pb-8">
          <div className="w-full max-w-sm mx-auto">
            
            {/* Container do Vídeo - Otimizado para vturb */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl mb-6">
              {/* Container otimizado para vturb JavaScript */}
              <div 
                id="vturb-video-explanation"
                className="w-full aspect-[9/16] bg-gray-900 rounded-2xl overflow-hidden relative"
                data-vturb-container="true"
                data-video-type="explanation"
              ></div>
            </div>

            <div className="text-center">
              <button
                onClick={handleVideoClick}
               className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl hover:from-blue-600 hover:to-green-600 transition-all duration-300 font-semibold"
               id="continue-button-explanation"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vídeo Intermediário */}
      {showVideoInterlude && (
        <div className="min-h-screen flex flex-col justify-center px-4 pt-28 pb-8">
          <div className="w-full max-w-sm mx-auto">
            
            {/* Container do Vídeo - Otimizado para vturb */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl mb-6">
              {/* Container otimizado para vturb JavaScript */}
              <div 
                id={`vturb-video-interlude-${currentProductIndex}`}
                className="w-full aspect-[9/16] bg-gray-900 rounded-2xl overflow-hidden relative"
                data-vturb-container="true"
                data-video-type="interlude"
                data-product-index={currentProductIndex}
              ></div>
            </div>

            <button
              onClick={handleVideoClick}
             className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl hover:from-blue-600 hover:to-green-600 transition-all duration-300 font-semibold"
             id="continue-button-interlude"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* Telas de Avaliação de Produtos */}
      {currentStep === 2 && !showVideoInterlude && !showFinalScreen && !showOpeningAnimation && currentProductIndex < products.length && (
        <div className="min-h-screen flex flex-col justify-center px-4 pt-36 pb-8">
          <div className="w-full max-w-sm mx-auto">
            
            {/* Imagem do Produto */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg mb-6">
              <img 
                src={products[currentProductIndex].image}
                alt={products[currentProductIndex].name}
                className="w-full h-80 object-cover"
              />
            </div>

            {/* Info do Produto */}
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2 px-2 leading-tight">
                {products[currentProductIndex].name}
              </h3>
              <p className="text-gray-600">
                {products[currentProductIndex].category}
              </p>
            </div>

            {/* Botões de Avaliação */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleProductEvaluation('loved')}
                className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform active:scale-95 shadow-md font-semibold"
              >
                <Heart className="w-5 h-5" />
                <span>Amei</span>
              </button>

              <button
                onClick={() => handleProductEvaluation('liked')}
                className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform active:scale-95 shadow-md font-semibold"
              >
                <Star className="w-5 h-5" />
                <span>Curti</span>
              </button>

              <button
                onClick={() => handleProductEvaluation('neutral')}
                className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-400 to-green-400 text-white py-4 rounded-xl hover:from-blue-500 hover:to-green-500 transition-all duration-300 transform active:scale-95 shadow-md font-semibold"
              >
                <Meh className="w-5 h-5" />
                <span>Mais ou menos</span>
              </button>

              <button
                onClick={() => handleProductEvaluation('disliked')}
                className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-4 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform active:scale-95 shadow-md font-semibold"
              >
                <ThumbsDown className="w-5 h-5" />
                <span>Não gostei</span>
              </button>

              <button
                onClick={() => handleProductEvaluation('skip')}
                className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white py-4 rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all duration-300 transform active:scale-95 shadow-md font-semibold"
              >
                <SkipForward className="w-5 h-5" />
                <span>Pular</span>
              </button>
            </div>

            {/* Progresso */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Produto {currentProductIndex + 1} de {products.length}</span>
                <span>{evaluationsCount} avaliações</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((currentProductIndex + 1) / products.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tela Final */}
      {showFinalScreen && !showOpeningAnimation && (
        <div className="min-h-screen flex flex-col justify-center px-4 pt-28 pb-8">
          <div className="w-full max-w-sm mx-auto text-center">
            
            {/* Ícone de Sucesso */}
            <div className="mb-6">
              <div className="w-24 h-24 bg-gradient-to-r from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-12 h-12 text-green-600" />
              </div>
            </div>

            {/* Mensagem Final */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Uau, {userName}! 🎉
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Com base nas suas avaliações, você acumulou <strong>R${balance.toFixed(2)}</strong>. 
                E como é sua primeira vez por aqui, ganhou um bônus de <strong>R$150,00</strong>!
              </p>
            </div>

            {/* Saldo Total */}
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <DollarSign className="w-6 h-6 text-green-600" />
                <span className="text-lg font-medium text-gray-700">Saldo total:</span>
              </div>
              <div className="text-3xl font-bold text-green-600">
                R${finalBalance.toFixed(2)}
              </div>
            </div>

            {/* Botão de Saque */}
            <button
              onClick={() => setShowWithdrawPopup(true)}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform active:scale-95 shadow-lg font-bold text-lg"
            >
              Finalizar
            </button>
          </div>
        </div>
      )}

      {/* Pop-up Final */}
      {showWithdrawPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Seus Dados</h3>
              <button
                onClick={() => setShowWithdrawPopup(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Dados do Usuário */}
            <div className="mb-6">
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-600 mb-1">Nome:</p>
                <p className="font-medium text-gray-900">{userName}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seu WhatsApp
                </label>
                <input
                  type="text"
                  value={contactWhatsapp}
                  onChange={(e) => setContactWhatsapp(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            {/* Valor Ganho */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <div className="text-center">
                <span className="text-sm text-gray-600">Você ganhou:</span>
                <div className="text-2xl font-bold text-green-600 mt-1">
                  R${finalBalance.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Botão */}
            <button
              onClick={handleFinalSubmit}
              disabled={!contactWhatsapp.trim()}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl hover:from-green-600 hover:to-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 transform active:scale-95 font-semibold"
            >
              Finalizar Participação
            </button>
          </div>
        </div>
      )}

      {/* Contador de Usuários Online */}
      {!showAdmin && <OnlineUsersCounter />}
    </div>
  );
}

export default App;