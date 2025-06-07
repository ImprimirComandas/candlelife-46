
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientsList } from "@/components/clients/ClientsList";
import { ClientForm } from "@/components/clients/ClientForm";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Clients() {
  const [isClientFormOpen, setIsClientFormOpen] = useState(false);
  const isMobile = useIsMobile();
  
  interface Client {
    id: string;
    name: string;
    email: string | null;
    document: string | null;
    phone: string | null;
    // Add other fields as necessary
  }

  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  const handleOpenClientForm = (client?: Client) => {
    if (client) {
      setClientToEdit(client);
    } else {
      setClientToEdit(null);
    }
    setIsClientFormOpen(true);
  };

  const handleCloseClientForm = () => {
    setIsClientFormOpen(false);
    setClientToEdit(null);
  };

  return (
    <div className={`w-full space-y-6 ${isMobile ? 'pb-4' : 'pb-8'}`}>
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isMobile ? 'pt-2' : ''}`}>
        <h1 className={`text-2xl sm:text-3xl font-bold ${isMobile ? 'pl-2' : ''}`}>
          Gerenciamento de Clientes
        </h1>
        <Button onClick={() => handleOpenClientForm()} className={isMobile ? 'mx-2 w-full sm:w-auto' : ''}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <div className={`grid gap-6 ${isMobile ? 'px-2' : ''}`}>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Seus Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientsList onEditClient={handleOpenClientForm} />
          </CardContent>
        </Card>
      </div>

      <ClientForm 
        open={isClientFormOpen} 
        onOpenChange={handleCloseClientForm} 
        clientToEdit={clientToEdit} 
      />
    </div>
  );
}
