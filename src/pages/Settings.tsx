import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { ThemeSettings } from "@/components/settings/ThemeSettings";
import { AvatarSettings } from "@/components/settings/AvatarSettings";
import { SessionsManager } from "@/components/settings/SessionsManager";
import { NotificationSettings } from "@/components/notifications/NotificationSettings";

const Settings = () => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isSessionsModalOpen, setIsSessionsModalOpen] = useState(false);

  const openProfileModal = () => setIsProfileModalOpen(true);
  const closeProfileModal = () => setIsProfileModalOpen(false);

  const openSecurityModal = () => setIsSecurityModalOpen(true);
  const closeSecurityModal = () => setIsSecurityModalOpen(false);

  const openThemeModal = () => setIsThemeModalOpen(true);
  const closeThemeModal = () => setIsThemeModalOpen(false);

  const openAvatarModal = () => setIsAvatarModalOpen(true);
  const closeAvatarModal = () => setIsAvatarModalOpen(false);

    const openSessionsModal = () => setIsSessionsModalOpen(true);
    const closeSessionsModal = () => setIsSessionsModalOpen(false);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie suas configurações e preferências
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="sessions">Sessões</TabsTrigger>
          <TabsTrigger value="avatar">Avatar</TabsTrigger>
          <TabsTrigger value="theme">Tema</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <ProfileSettings />
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <SecuritySettings />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <SessionsManager />
        </TabsContent>

        <TabsContent value="avatar" className="space-y-4">
          <AvatarSettings />
        </TabsContent>

        <TabsContent value="theme" className="space-y-4">
          <ThemeSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
