
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Palette, User, Lock, Image, ArrowLeft } from "lucide-react";
import { ThemeSettings } from "@/components/settings/ThemeSettings";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { AvatarSettings } from "@/components/settings/AvatarSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get active tab from URL hash or localStorage, or default to "profile"
  const getInitialTab = () => {
    const hashTab = location.hash?.replace('#', '');
    if (hashTab && ['profile', 'theme', 'avatar', 'security'].includes(hashTab)) {
      return hashTab;
    }
    
    const savedTab = localStorage.getItem('settings-tab');
    if (savedTab && ['profile', 'theme', 'avatar', 'security'].includes(savedTab)) {
      return savedTab;
    }
    
    return 'profile';
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab);
  
  // Update URL hash and localStorage when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    localStorage.setItem('settings-tab', value);
    
    // Update URL hash without causing navigation/reload
    window.history.replaceState(null, '', `#${value}`);
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="rounded-full"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">Configurações</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-8">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="theme" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            <span>Tema</span>
          </TabsTrigger>
          <TabsTrigger value="avatar" className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            <span>Avatar</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>Segurança</span>
          </TabsTrigger>
        </TabsList>

        <Card className="p-6 border-border rounded-xl shadow-sm">
          <TabsContent value="profile" className="mt-0">
            <ProfileSettings />
          </TabsContent>
          
          <TabsContent value="theme" className="mt-0">
            <ThemeSettings />
          </TabsContent>
          
          <TabsContent value="avatar" className="mt-0">
            <AvatarSettings />
          </TabsContent>
          
          <TabsContent value="security" className="mt-0">
            <SecuritySettings />
          </TabsContent>
        </Card>
      </Tabs>
    </div>
  );
};

export default Settings;
