
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { usePosts } from "@/hooks/usePosts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SocialHeader } from "./SocialHeader";
import { FeedContent } from "./FeedContent";
import { useNavigate } from "react-router-dom";
import { ErrorMessage } from "@/components/ui/error-message";

const SocialHub = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { posts, isLoadingPosts, postsError, refetchPosts } = usePosts();
  
  const [editingPost, setEditingPost] = useState<any>(null);

  // Verificar autenticação
  useEffect(() => {
    if (!user) {
      toast({
        title: "Acesso restrito",
        description: "Você precisa estar autenticado para acessar a comunidade.",
        variant: "destructive",
      });
      navigate('/login', { replace: true });
    }
  }, [user, toast, navigate]);
  
  // Recarregar posts em caso de erro
  useEffect(() => {
    if (postsError) {
      const timer = setTimeout(() => {
        if (user) {
          refetchPosts();
        }
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [postsError, refetchPosts, user]);
  
  const handleEditPost = (post: any) => {
    setEditingPost(post);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  
  const handleCancelEdit = () => {
    setEditingPost(null);
  };
  
  const handleRetryFetch = () => {
    refetchPosts();
    toast({
      title: "Recarregando",
      description: "Tentando carregar as publicações novamente...",
    });
  };

  if (postsError && !isLoadingPosts) {
    return (
      <div className="w-full space-y-8 p-4">
        <SocialHeader />
        
        <ErrorMessage
          title="Erro ao carregar publicações"
          message="Não foi possível carregar as publicações da comunidade. Por favor, tente novamente em alguns momentos."
          onRetry={handleRetryFetch}
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 sm:space-y-8 p-2 sm:p-4">
      <SocialHeader />

      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="mb-4 sm:mb-6 grid w-full grid-cols-2">
          <TabsTrigger value="feed" className="text-sm">
            Feed da Comunidade
          </TabsTrigger>
          <TabsTrigger value="my-posts" className="text-sm">
            Minhas Publicações
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="feed" className="w-full">
          <FeedContent 
            posts={posts}
            isLoadingPosts={isLoadingPosts}
            editingPost={editingPost}
            onEdit={handleEditPost}
            onCancelEdit={handleCancelEdit}
          />
        </TabsContent>
        
        <TabsContent value="my-posts" className="w-full">
          <FeedContent 
            posts={posts}
            isLoadingPosts={isLoadingPosts}
            editingPost={editingPost}
            onEdit={handleEditPost}
            onCancelEdit={handleCancelEdit}
            showMyPostsOnly={true}
            currentUserId={user?.id}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SocialHub;
