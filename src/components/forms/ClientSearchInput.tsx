import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { Check, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Client {
  id: string;
  company_name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
}

interface ClientSearchInputProps {
  value: string;
  onValueChange: (value: string) => void;
  onClientSelect: (client: Client | null) => void;
  placeholder?: string;
}

export const ClientSearchInput = ({
  value,
  onValueChange,
  onClientSelect,
  placeholder = "Search or add company..."
}: ClientSearchInputProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Debounced search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (value.length >= 1) {
      searchTimeout.current = setTimeout(() => {
        searchClients(value);
      }, 300); // shorter debounce for better UX
    } else {
      setClients([]);
    }

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const searchClients = async (searchTerm: string) => {
    if (!user) {
      setClients([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .or(`company_name.ilike.%${searchTerm}%,contact_person.ilike.%${searchTerm}%`)
        .limit(10);

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error("Error searching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange(e.target.value);
    setOpen(true);
  };

  const handleClientSelect = (client: Client) => {
    onValueChange(client.company_name);
    onClientSelect(client);
    setOpen(false);
  };

  const handleAddNewClient = () => {
    onClientSelect(null);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="w-full"
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 200)} // give time for click to register
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-full" align="start">
        <Command>
          <CommandList>
            {loading && (
              <div className="p-2 text-sm text-gray-500">Searching...</div>
            )}
            {!loading && clients.length === 0 && value.length >= 1 && (
              <CommandEmpty>
                <div className="p-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={handleAddNewClient}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add "{value}" as new client
                  </Button>
                </div>
              </CommandEmpty>
            )}
            {clients.map((client) => (
              <CommandItem
                key={client.id}
                value={client.company_name}
                onSelect={() => handleClientSelect(client)}
                className="cursor-pointer"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{client.company_name}</span>
                  {client.contact_person && (
                    <span className="text-sm text-gray-500">{client.contact_person}</span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
