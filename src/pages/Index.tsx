import { useState, useEffect } from "react";
import { Dashboard } from "@/components/Dashboard/Dashboard";
import { LoginForm } from "@/components/Auth/LoginForm";
import { RegisterForm } from "@/components/Auth/RegisterForm";
import { ConsentDialog } from "@/components/Auth/ConsentDialog";
import { useAuth } from "@/components/Auth/AuthContext";
import { useConsent } from "@/hooks/useConsent";
import { useLocation, useNavigate } from "react-router-dom";

const Index = () => {
  const { user, role, loading, signOut } = useAuth();
  const { hasConsent, grantConsent, loading: consentsLoading } = useConsent();
  const location = useLocation();
  const navigate = useNavigate();
  const [showRegister, setShowRegister] = useState(location.pathname === "/register");

  // Verifica se o usuário precisa dar consentimento (primeiro acesso)
  const needsConsent = !!user && !consentsLoading && !hasConsent('data_processing');

  useEffect(() => {
    setShowRegister(location.pathname === "/register");
  }, [location.pathname]);

  const handleBackToLogin = () => {
    setShowRegister(false);
    navigate("/");
  };

  const handleShowRegister = () => {
    setShowRegister(true);
    navigate("/register");
  };

  const handleAcceptConsent = async () => {
    await grantConsent('privacy_policy');
    await grantConsent('data_processing');
  };

  const handleDeclineConsent = async () => {
    await signOut();
  };

  if (loading || (user && consentsLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    if (showRegister) {
      return (
        <RegisterForm 
          onSuccess={handleBackToLogin} 
          onBackToLogin={handleBackToLogin} 
        />
      );
    }
    
    return (
      <LoginForm 
        onSuccess={() => {
          // Força re-render após login
          console.log('[Index] Login bem-sucedido, aguardando atualização do contexto...');
        }} 
      />
    );
  }

  // Criar um objeto de usuário compatível com o Dashboard
  // Usa o role do AuthContext (vem da tabela profiles) em vez do user_metadata
  const dashboardUser = {
    id: user.id,
    name: user.user_metadata?.name || user.email.split('@')[0],
    email: user.email,
    role: role || 'teacher', // Usa role do contexto, com fallback para teacher
    phone: '',
  };

  console.log('[Index] Role do contexto:', role);

  return (
    <>
      <ConsentDialog
        open={needsConsent}
        onAccept={handleAcceptConsent}
        onDecline={handleDeclineConsent}
      />
      <Dashboard user={dashboardUser} />
    </>
  );
};

export default Index;
