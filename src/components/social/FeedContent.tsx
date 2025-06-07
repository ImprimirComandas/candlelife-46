
import { useState } from "react";
import { Post } from "@/hooks/usePosts";
import { PostItem } from "./PostItem";
import { PostEditor } from "./PostEditor";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";

type FeedContentProps = {
  posts: Post[];
  isLoadingPosts: boolean;
  editingPost: Post | null;
  onEdit: (post: Post) => void;
  onCancelEdit: () => void;
  showMyPostsOnly?: boolean;
  currentUserId?: string;
};

export function FeedContent({
  posts,
  isLoadingPosts,
  editingPost,
  onEdit,
  onCancelEdit,
  showMyPostsOnly = false,
  currentUserId
}: FeedContentProps) {
  const { user } = useAuth();
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  
  // Filtrar posts se necessário (para mostrar apenas do usuário atual)
  const filteredPosts = showMyPostsOnly && currentUserId
    ? posts.filter(post => post.user_id === currentUserId)
    : posts;
  
  const toggleExpanded = (postId: string) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
  };

  // Função placeholder para openChat (não usada mais)
  const handleOpenChat = (userId: string, userName: string, userAvatar?: string) => {
    console.log("Chat functionality removed from social area");
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <PostEditor editingPost={editingPost} onCancelEdit={onCancelEdit} />
      
      {isLoadingPosts ? (
        // Skeletons para carregamento
        <div className="space-y-4 sm:space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3 sm:p-4 border rounded-lg space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-24 sm:h-4 sm:w-32" />
                  <Skeleton className="h-2 w-16 sm:h-3 sm:w-24" />
                </div>
              </div>
              <Skeleton className="h-3 w-full sm:h-4" />
              <Skeleton className="h-3 w-3/4 sm:h-4" />
              <Skeleton className="h-32 w-full rounded-md sm:h-40" />
            </div>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-8 sm:py-10 text-muted-foreground">
          <p className="text-sm sm:text-base">
            {showMyPostsOnly ? 
              "Você ainda não criou nenhuma publicação." : 
              "Nenhuma publicação encontrada na comunidade."}
          </p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {filteredPosts.map((post) => (
            <PostItem
              key={post.id}
              post={post}
              isExpanded={expandedPostId === post.id}
              toggleExpanded={() => toggleExpanded(post.id)}
              onEdit={() => onEdit(post)}
              currentUserId={user?.id}
              openChat={handleOpenChat}
            />
          ))}
        </div>
      )}
    </div>
  );
}
