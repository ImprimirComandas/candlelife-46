
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Moon, Sun, Palette, Zap, Ghost, Mountain, Coffee, 
  PaintBucket, Sunset, Leaf, Waves, Sparkles, Clock, 
  Crown, Terminal
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/context/ThemeContext";

// Definição completa de todos os temas disponíveis
const themeCategories = [
  {
    name: "Básico",
    themes: [
      { id: "light", name: "Claro", icon: Sun },
      { id: "dark", name: "Escuro", icon: Moon },
    ]
  },
  {
    name: "Coloridos",
    themes: [
      { id: "cyberpunk", name: "Cyberpunk", icon: Zap },
      { id: "dracula", name: "Drácula", icon: Ghost },
      { id: "nord", name: "Nord", icon: Mountain },
      { id: "purple", name: "Roxo", icon: Palette },
      { id: "green", name: "Verde", icon: Leaf },
      { id: "ocean", name: "Oceano", icon: Waves },
    ]
  },
  {
    name: "Temáticos",
    themes: [
      { id: "sunset", name: "Pôr do Sol", icon: Sunset },
      { id: "forest", name: "Floresta", icon: Leaf },
      { id: "coffee", name: "Café", icon: Coffee },
      { id: "pastel", name: "Pastel", icon: PaintBucket },
      { id: "neon", name: "Neon", icon: Sparkles },
      { id: "vintage", name: "Vintage", icon: Clock },
      { id: "midnight", name: "Meia-noite", icon: Moon },
      { id: "royal", name: "Real", icon: Crown },
      { id: "super-hacker", name: "Super Hacker", icon: Terminal },
    ]
  }
];

// Flatten all themes for easier reference
const allThemes = themeCategories.flatMap(category => category.themes);

export const ThemeSettings = () => {
  const { theme, setTheme, isUpdating } = useTheme();
  const { toast } = useToast();
  const [selectedTheme, setSelectedTheme] = useState(theme);

  const updateTheme = async (newTheme: string) => {
    const themeInfo = allThemes.find(t => t.id === newTheme);
    const themeName = themeInfo?.name || newTheme;
    
    try {
      setSelectedTheme(newTheme as any);
      await setTheme(newTheme as any);
      
      toast({
        title: "Tema alterado",
        description: `O tema foi alterado para ${themeName}.`,
      });
    } catch (error) {
      console.error("Erro ao atualizar tema:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o tema.",
        variant: "destructive",
      });
      // Revert selection on error
      setSelectedTheme(theme);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Personalização</h2>
        <p className="text-sm text-muted-foreground">
          Escolha o tema que melhor combina com você. Todos os temas são aplicados instantaneamente.
        </p>
      </div>

      <div className="space-y-6">
        {themeCategories.map((category) => (
          <div key={category.name} className="space-y-3">
            <h3 className="text-base font-medium text-foreground">{category.name}</h3>
            <RadioGroup
              value={selectedTheme}
              onValueChange={updateTheme}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
              disabled={isUpdating}
            >
              {category.themes.map(({ id, name, icon: Icon }) => (
                <Label
                  key={id}
                  htmlFor={id}
                  className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors ${
                    selectedTheme === id ? "border-primary bg-accent/50 ring-1 ring-primary" : "border-input hover:border-primary/50"
                  } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <RadioGroupItem value={id} id={id} disabled={isUpdating} />
                  <Icon className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">{name}</span>
                  {selectedTheme === id && (
                    <div className="ml-auto w-2 h-2 bg-primary rounded-full"></div>
                  )}
                </Label>
              ))}
            </RadioGroup>
          </div>
        ))}
      </div>

      {isUpdating && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">Aplicando tema...</p>
        </div>
      )}
    </div>
  );
};
