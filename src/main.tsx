/**
 * =============================================================================
 * MAIN.TSX - Ponto de Entrada da Aplicação
 * =============================================================================
 * 
 * Este arquivo é o ponto de entrada principal da aplicação React.
 * Ele é responsável por renderizar o componente App na DOM.
 * 
 * Fluxo:
 * 1. Importa o React DOM para manipulação da DOM
 * 2. Importa o componente principal App
 * 3. Importa os estilos globais CSS
 * 4. Renderiza o App no elemento com id "root"
 * 
 * =============================================================================
 */

// Importa a função createRoot do React DOM para renderização
import { createRoot } from "react-dom/client";

// Importa o componente principal da aplicação
import App from "./App.tsx";

// Importa os estilos globais (Tailwind CSS + customizações)
import "./index.css";

/**
 * Renderiza a aplicação React
 * 
 * document.getElementById("root")! - Obtém o elemento DOM onde o React será montado
 * O "!" indica ao TypeScript que o elemento existe (non-null assertion)
 * 
 * createRoot() - Cria uma raiz React para o modo concurrent
 * .render(<App />) - Renderiza o componente App
 */
createRoot(document.getElementById("root")!).render(<App />);
