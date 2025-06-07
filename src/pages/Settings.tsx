
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { ThemeSettings } from "@/components/settings/ThemeSettings";
import { AvatarSettings } from "@/components/settings/AvatarSettings";
import { SessionsManager } from "@/components/settings/SessionsManager";
import { NotificationSettings } from "@/components/notifications/NotificationSettings";

const Settings = () => {
  return (
    <div className="w-full max-w-4xl mx-auto p-3 space-y-4">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie suas configurações e preferências
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 text-xs">
          <TabsTrigger value="profile" className="text-xs">Perfil</TabsTrigger>
          <TabsTrigger value="security" className="text-xs">Segurança</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs">Notificações</TabsTrigger>
          <TabsTrigger value="sessions" className="text-xs">Sessões</TabsTrigger>
          <TabsTrigger value="avatar" className="text-xs">Avatar</TabsTrigger>
          <TabsTrigger value="theme" className="text-xs">Tema</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-3">
          <ProfileSettings />
        </TabsContent>

        <TabsContent value="security" className="space-y-3">
          <SecuritySettings />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-3">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="sessions" className="space-y-3">
          <SessionsManager />
        </TabsContent>

        <TabsContent value="avatar" className="space-y-3">
          <AvatarSettings />
        </TabsContent>

        <TabsContent value="theme" className="space-y-3">
          <ThemeSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
