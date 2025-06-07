
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { 
  LayoutDashboard, 
  CreditCard, 
  Target, 
  Users, 
  MessageSquare, 
  Settings,
  Heart 
} from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const mainButtons = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Transações", href: "/transactions", icon: CreditCard },
    { label: "Metas", href: "/goals", icon: Target },
    { label: "Clientes", href: "/clients", icon: Users },
    { label: "Chat", href: "/chat", icon: MessageSquare },
    { label: "Configurações", href: "/settings", icon: Settings },
  ];

  return (
    <footer className="border-t bg-background/95 backdrop-blur-md">
      <div className="w-full max-w-7xl mx-auto px-4 py-6">
        {/* Main Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {mainButtons.map((button) => (
            <Link
              key={button.href}
              to={button.href}
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-accent transition-colors group"
            >
              <button.icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {button.label}
              </span>
            </Link>
          ))}
        </div>

        <Separator className="my-4" />

        {/* Secondary Links */}
        <div className="flex flex-wrap justify-center gap-4 mb-4 text-sm">
          <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
            Sobre
          </Link>
          <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
            Contato
          </Link>
          <Link to="/support" className="text-muted-foreground hover:text-foreground transition-colors">
            Suporte
          </Link>
          <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
            Privacidade
          </Link>
        </div>

        {/* Bottom section */}
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 text-center">
          <p className="text-xs text-muted-foreground">
            © {currentYear} CandleLife. Todos os direitos reservados.
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Feito com <Heart className="h-3 w-3 text-red-500" fill="currentColor" /> para você
          </p>
        </div>
      </div>
    </footer>
  );
};
