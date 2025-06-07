
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Heart, MessageCircle, Share, Users, TrendingUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Social = () => {
  const isMobile = useIsMobile();
  const [newPost, setNewPost] = useState("");

  // Dados mockados para demonstração
  const posts = [
    {
      id: "1",
      author: {
        name: "João Silva",
        avatar: "",
        username: "@joaosilva"
      },
      content: "Acabei de fechar mais um projeto! 🚀 Gratidão por mais essa conquista. #freelancer #sucesso",
      timestamp: "2024-01-15T10:30:00Z",
      likes: 15,
      comments: 3,
      shares: 2,
      liked: false
    },
    {
      id: "2",
      author: {
        name: "Maria Santos", 
        avatar: "",
        username: "@mariasantos"
      },
      content: "Dica valiosa: sempre negocie o valor do seu trabalho baseado no valor que você entrega, não nas horas trabalhadas. 💡",
      timestamp: "2024-01-15T09:15:00Z",
      likes: 28,
      comments: 7,
      shares: 12,
      liked: true
    },
    {
      id: "3",
      author: {
        name: "Pedro Costa",
        avatar: "",
        username: "@pedrocosta"
      },
      content: "Quem mais está focando em diversificar as fontes de renda em 2024? Compartilhem suas estratégias! 💰",
      timestamp: "2024-01-14T16:45:00Z",
      likes: 42,
      comments: 15,
      shares: 8,
      liked: false
    }
  ];

  const communityStats = {
    totalMembers: 1247,
    activeMembers: 892,
    postsToday: 23
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return "Agora";
    if (diffHours < 24) return `${diffHours}h`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/50 p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Comunidade</h1>
            <Button size={isMobile ? "sm" : "default"}>
              <Plus className="h-4 w-4 mr-2" />
              {!isMobile && "Nova Publicação"}
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar na comunidade..."
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Community Stats */}
      <div className="p-4 grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-lg font-bold">{communityStats.totalMembers.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Membros</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2" />
            <p className="text-lg font-bold text-green-600">{communityStats.activeMembers}</p>
            <p className="text-xs text-muted-foreground">Online</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-lg font-bold text-blue-600">{communityStats.postsToday}</p>
            <p className="text-xs text-muted-foreground">Posts hoje</p>
          </CardContent>
        </Card>
      </div>

      {/* Create Post */}
      <div className="p-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>EU</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <Textarea
                  placeholder="Compartilhe uma conquista, dica ou pergunta..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
                <div className="flex justify-end">
                  <Button disabled={!newPost.trim()}>
                    Publicar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Posts Feed */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.author.avatar} alt={post.author.name} />
                  <AvatarFallback>
                    {post.author.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-semibold">{post.author.name}</CardTitle>
                    <span className="text-xs text-muted-foreground">{post.author.username}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{formatTimestamp(post.timestamp)}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Post Content */}
                <p className="text-sm leading-relaxed">{post.content}</p>

                {/* Post Actions */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`gap-2 ${post.liked ? 'text-red-500' : ''}`}
                    >
                      <Heart className={`h-4 w-4 ${post.liked ? 'fill-current' : ''}`} />
                      <span className="text-xs">{post.likes}</span>
                    </Button>
                    
                    <Button variant="ghost" size="sm" className="gap-2">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-xs">{post.comments}</span>
                    </Button>
                    
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Share className="h-4 w-4" />
                      <span className="text-xs">{post.shares}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Social;
