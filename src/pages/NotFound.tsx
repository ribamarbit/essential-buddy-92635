/**
 * =============================================================================
 * NOTFOUND.TSX - Página 404 (Não Encontrada)
 * =============================================================================
 * 
 * Esta página é exibida quando o usuário tenta acessar uma rota que não existe.
 * Registra o erro no console e oferece um link para retornar à home.
 * 
 * Funcionalidades:
 * - Exibe mensagem de erro 404
 * - Registra tentativa de acesso a rota inexistente
 * - Link para retornar à página inicial
 * 
 * =============================================================================
 */

// Importações do React Router
import { useLocation } from "react-router-dom";

// Importações do React
import { useEffect } from "react";

/**
 * Componente de página 404
 * Exibido quando nenhuma rota corresponde à URL acessada
 */
const NotFound = () => {
  // Hook para obter informações da rota atual
  const location = useLocation();

  /**
   * Registra o erro no console quando a página é montada
   * Útil para monitoramento e debugging
   */
  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  // ==========================================================================
  // RENDERIZAÇÃO DO COMPONENTE
  // ==========================================================================
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        {/* Código do erro */}
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        
        {/* Mensagem explicativa */}
        <p className="mb-4 text-xl text-gray-600">Oops! Page not found</p>
        
        {/* Link para retornar à home */}
        <a href="/" className="text-blue-500 underline hover:text-blue-700">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
