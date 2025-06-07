
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Users, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreatePostForm } from "./CreatePostForm";

export const SocialHeader = () => {
  const { user } = useAuth();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
              {user?.user_metadata?.avatar_url ? (
                <AvatarImage src={user.user_metadata.avatar_url} alt="Avatar" />
              ) : (
                <AvatarFallback className="text-lg font-medium">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                Bem-vindo à Comunidade!
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Conecte-se, compartilhe e cresça junto com outros usuários
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Button 
          onClick={() => setIsCreatePostOpen(true)}
          className="flex items-center gap-2 h-12"
          size="lg"
        >
          <TrendingUp className="h-4 w-4" />
          <span className="text-sm">Nova Publicação</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="flex items-center gap-2 h-12"
          size="lg"
        >
          <Users className="h-4 w-4" />
          <span className="text-sm">Explorar Usuários</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="flex items-center gap-2 h-12"
          size="lg"
          onClick={() => window.location.href = '/chat'}
        >
          <MessageCircle className="h-4 w-4" />
          <span className="text-sm">Ir para Chat</span>
        </Button>
      </div>

      {/* Create Post Modal */}
      <CreatePostForm 
        isOpen={isCreatePostOpen}
        onOpenChange={setIsCreatePostOpen}
      />
    </div>
  );
};
