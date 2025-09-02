import { useState } from "react";
import { Header } from "@/components/Layout/Header";
import { Sidebar } from "@/components/Layout/Sidebar";
import { ScheduleView } from "./ScheduleView";
import { TeachersView } from "./TeachersView";
import { SearchView } from "./SearchView";
import { ProfileView } from "./ProfileView";
import { SpecialListsView } from "./SpecialListsView";

interface DashboardProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'teacher';
    phone?: string;
    level?: string;
    hasCertification?: boolean;
  };
}

export const Dashboard = ({ user }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState('schedule');

  const handleLogout = () => {
    // Implementar logout
    console.log('Logout');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'schedule':
        return <ScheduleView user={user} />;
      case 'teachers':
        return user.role === 'admin' ? <TeachersView /> : null;
      case 'search':
        return <SearchView userRole={user.role} />;
      case 'profile':
        return <ProfileView user={user} />;
      case 'special-lists':
        return user.role === 'admin' ? <SpecialListsView /> : null;
      default:
        return <ScheduleView user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onLogout={handleLogout} />
      
      <div className="flex">
        <Sidebar 
          userRole={user.role}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};