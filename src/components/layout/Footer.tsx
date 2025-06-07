
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Github, Twitter, Linkedin, Mail, Heart, Shield, HelpCircle, Users } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    app: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Transações", href: "/transactions" },
      { label: "Metas", href: "/goals" },
      { label: "Clientes", href: "/clients" },
    ],
    company: [
      { label: "Sobre", href: "/about" },
      { label: "Contato", href: "/contact" },
      { label: "Suporte", href: "/support" },
      { label: "Comunidade", href: "/social" },
    ],
    legal: [
      { label: "Política de Privacidade", href: "/privacy" },
      { label: "Termos de Uso", href: "/terms" },
    ],
    social: [
      { icon: Github, href: "https://github.com", label: "GitHub" },
      { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
      { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
      { icon: Mail, href: "mailto:contato@candlelife.com", label: "Email" },
    ]
  };

  return (
    <footer className="border-t bg-background/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                <Heart className="h-4 w-4 text-primary-foreground" fill="currentColor" />
              </div>
              CandleLife
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Gerencie suas finanças de forma simples e eficiente. 
              Controle completo das suas transações e metas financeiras.
            </p>
          </div>

          {/* App links */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Aplicativo
            </h4>
            <ul className="space-y-2">
              {footerLinks.app.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Empresa
            </h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal and Social */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Legal & Social
            </h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            
            {/* Social links */}
            <div className="flex space-x-3 pt-2">
              {footerLinks.social.map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Bottom section */}
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <p className="text-sm text-muted-foreground">
            © {currentYear} CandleLife. Todos os direitos reservados.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Feito com <Heart className="h-4 w-4 text-red-500" fill="currentColor" /> para você
          </p>
        </div>
      </div>
    </footer>
  );
};
