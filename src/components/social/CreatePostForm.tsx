
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePosts } from "@/hooks/usePosts";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Image as ImageIcon } from "lucide-react";

interface CreatePostFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreatePostForm = ({ isOpen, onOpenChange }: CreatePostFormProps) => {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { createPost } = usePosts();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "Erro",
        description: "O conteúdo da publicação é obrigatório",
        variant: "destructive"
      });
      return;
    }

    try {
      await createPost.mutateAsync({
        content: content.trim(),
        imageFile: imageFile || undefined
      });
      
      setContent("");
      setImageFile(null);
      onOpenChange(false);
      
      toast({
        title: "Sucesso",
        description: "Publicação criada com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao criar publicação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a publicação",
        variant: "destructive"
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Publicação</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="content">Conteúdo</Label>
            <Textarea
              id="content"
              placeholder="O que você está pensando?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
          
          <div>
            <Label htmlFor="image">Imagem (opcional)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="flex-1"
              />
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            {imageFile && (
              <p className="text-sm text-muted-foreground mt-1">
                Arquivo selecionado: {imageFile.name}
              </p>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createPost.isPending || !content.trim()}
            >
              {createPost.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Publicar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
