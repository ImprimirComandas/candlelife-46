
import { useAuth } from "@/context/AuthContext";
import { GoalsManager } from "@/components/goals/GoalsManager";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const Goals = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      toast({
        title: "Acesso restrito",
        description: "Você precisa estar autenticado para acessar as metas financeiras.",
        variant: "destructive",
      });
      navigate('/login', { replace: true });
    }
  }, [user, toast, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="w-full space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">Metas Financeiras</h1>
      </div>
      
      <GoalsManager />
    </div>
  );
};

export default Goals;
