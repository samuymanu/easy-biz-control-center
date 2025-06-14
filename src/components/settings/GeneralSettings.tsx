
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useApi, useApiMutation } from "@/hooks/useApi";

interface ConfigData {
  company_name?: string;
  tax_rate?: string;
  currency?: string;
  invoice_prefix?: string;
}

const GeneralSettings = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<ConfigData>({});
  
  const { data: configData } = useApi<ConfigData>('/config');
  const { mutate: saveConfig, loading: savingConfig } = useApiMutation();

  useEffect(() => {
    if (configData) {
      setConfig(configData);
    }
  }, [configData]);

  const handleSaveConfig = async (configKey: string, value: string) => {
    try {
      await saveConfig('/config', { config_key: configKey, config_value: value });
      toast({
        title: "Configuración guardada",
        description: "La configuración se ha guardado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Configuración General
          </CardTitle>
          <CardDescription>Configuraciones básicas del sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company-name">Nombre de la Empresa</Label>
              <Input
                id="company-name"
                value={config.company_name || ""}
                onChange={(e) => setConfig(prev => ({ ...prev, company_name: e.target.value }))}
                placeholder="Mi Empresa S.A."
              />
              <Button
                size="sm"
                className="mt-2"
                onClick={() => handleSaveConfig('company_name', config.company_name || "")}
                disabled={savingConfig}
              >
                Guardar
              </Button>
            </div>
            <div>
              <Label htmlFor="currency">Moneda</Label>
              <Input
                id="currency"
                value={config.currency || ""}
                onChange={(e) => setConfig(prev => ({ ...prev, currency: e.target.value }))}
                placeholder="USD"
              />
              <Button
                size="sm"
                className="mt-2"
                onClick={() => handleSaveConfig('currency', config.currency || "")}
                disabled={savingConfig}
              >
                Guardar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuración de Impuestos</CardTitle>
          <CardDescription>Configurar porcentajes de impuestos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tax-rate">Tasa de Impuesto (%)</Label>
              <Input
                id="tax-rate"
                type="number"
                value={config.tax_rate || ""}
                onChange={(e) => setConfig(prev => ({ ...prev, tax_rate: e.target.value }))}
                placeholder="15"
              />
              <Button
                size="sm"
                className="mt-2"
                onClick={() => handleSaveConfig('tax_rate', config.tax_rate || "")}
                disabled={savingConfig}
              >
                Guardar
              </Button>
            </div>
            <div>
              <Label htmlFor="invoice-prefix">Prefijo de Facturas</Label>
              <Input
                id="invoice-prefix"
                value={config.invoice_prefix || ""}
                onChange={(e) => setConfig(prev => ({ ...prev, invoice_prefix: e.target.value }))}
                placeholder="INV"
              />
              <Button
                size="sm"
                className="mt-2"
                onClick={() => handleSaveConfig('invoice_prefix', config.invoice_prefix || "")}
                disabled={savingConfig}
              >
                Guardar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralSettings;
