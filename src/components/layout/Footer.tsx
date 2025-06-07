
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Github, Twitter, Linkedin, Mail, Heart } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { label: "Sobre", href: "/about" },
      { label: "Contato", href: "/contact" },
      { label: "Suporte", href: "/support" },
    ],
    legal: [
      { label: "Política de Privacidade", href: "/privacy" },
      { label: "Termos de Uso", href: "/terms" },
    ],
    social: [
      { icon: Github, href: "https://github.com", label: "GitHub" },
      { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
      { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
      { icon: Mail, href: "mailto:contato@exemplo.com", label: "Email" },
    ]
  };

  return (
    <footer className="border-t bg-background/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">FinanceApp</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Gerencie suas finanças de forma simples e eficiente. 
              Controle completo das suas transações e metas financeiras.
            </p>
          </div>

          {/* Links sections */}
          <div className="grid grid-cols-2 gap-8">
            {/* Company links */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-foreground">Empresa</h4>
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

            {/* Legal links */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-foreground">Legal</h4>
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
            </div>
          </div>

          {/* Social links */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">Siga-nos</h4>
            <div className="flex space-x-4">
              {footerLinks.social.map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Bottom section */}
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <p className="text-sm text-muted-foreground">
            © {currentYear} FinanceApp. Todos os direitos reservados.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Feito com <Heart className="h-4 w-4 text-red-500" fill="currentColor" /> para você
          </p>
        </div>
      </div>
    </footer>
  );
};
