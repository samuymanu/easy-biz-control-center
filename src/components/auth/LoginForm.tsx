import { useState, useContext } from "react";
import { AuthContext, AuthContextType } from "../../context/AuthContext";
import { useAuth } from "../../context/AuthContext";

// Si usas Shadcn UI o similar, asegúrate de tener estos componentes:
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const LoginForm = () => {
  const { login } = useContext(AuthContext) as AuthContextType;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (username === "admin" && password === "admin") {
      login({
        id: "1",
        name: "Administrador",
        email: "admin@sistema.com",
        role: "admin", // <-- Aquí debe ser "admin"
        status: "active",
      });
      setLoading(false);
      return;
    }

    setError("Usuario o contraseña incorrectos");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-slate-800">
            Sistema Administrativo
          </CardTitle>
          <CardDescription>
            Ingrese sus credenciales para acceder al sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingrese su usuario"
                required
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese su contraseña"
                required
                disabled={loading}
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
            <strong>Demo:</strong> Usuario: admin, Contraseña: admin
          </div>
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-sm text-yellow-700">
            <strong>Importante:</strong> Asegúrese de que el servidor backend esté ejecutándose en el puerto 3001
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;