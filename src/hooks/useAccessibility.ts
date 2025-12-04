/**
 * =============================================================================
 * USEACCESSIBILITY.TS - Hook de Acessibilidade
 * =============================================================================
 * 
 * Este hook gerencia as configurações de acessibilidade do aplicativo.
 * Persiste as configurações no localStorage e aplica classes CSS no documento.
 * 
 * Funcionalidades:
 * - Ajuste de tamanho de fonte (normal, large, xl)
 * - Modo de alto contraste
 * - Redução de animações (reduced motion)
 * - Modo leitor de tela
 * 
 * Fluxo:
 * 1. Carrega configurações do localStorage na inicialização
 * 2. Aplica classes CSS no elemento root (html)
 * 3. Salva alterações no localStorage
 * 
 * =============================================================================
 */

// Importações do React
import { useState, useEffect } from 'react';

/**
 * Interface que define as configurações de acessibilidade
 */
interface AccessibilitySettings {
  fontSize: 'normal' | 'large' | 'xl';  // Tamanho da fonte
  highContrast: boolean;                  // Modo alto contraste
  reducedMotion: boolean;                 // Reduzir animações
  screenReader: boolean;                  // Modo leitor de tela
}

/**
 * Hook personalizado para gerenciar acessibilidade
 * 
 * @returns Objeto com settings atuais e função updateSetting
 * 
 * @example
 * const { settings, updateSetting } = useAccessibility();
 * 
 * // Ativar alto contraste
 * updateSetting('highContrast', true);
 * 
 * // Aumentar fonte
 * updateSetting('fontSize', 'large');
 */
export const useAccessibility = () => {
  /**
   * Estado das configurações de acessibilidade
   * Inicializado com valores do localStorage ou padrões
   */
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    // Verifica se está no browser (não SSR)
    if (typeof window !== 'undefined') {
      // Tenta carregar do localStorage
      const saved = localStorage.getItem('accessibility-settings');
      return saved ? JSON.parse(saved) : {
        fontSize: 'normal',
        highContrast: false,
        reducedMotion: false,
        screenReader: false
      };
    }
    // Valores padrão para SSR
    return {
      fontSize: 'normal' as const,
      highContrast: false,
      reducedMotion: false,
      screenReader: false
    };
  });

  /**
   * Efeito que aplica as configurações quando elas mudam
   * - Salva no localStorage
   * - Aplica classes CSS no documento
   */
  useEffect(() => {
    // Persiste no localStorage
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    
    // Obtém o elemento root (html)
    const root = window.document.documentElement;
    
    // =========================================================================
    // APLICA TAMANHO DA FONTE
    // Remove classes anteriores e adiciona a nova
    // =========================================================================
    root.classList.remove('text-base', 'text-lg', 'text-xl');
    switch (settings.fontSize) {
      case 'large':
        root.classList.add('text-lg');
        break;
      case 'xl':
        root.classList.add('text-xl');
        break;
      default:
        root.classList.add('text-base');
    }
    
    // =========================================================================
    // APLICA ALTO CONTRASTE
    // Adiciona/remove classe que ativa estilos de alto contraste
    // =========================================================================
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // =========================================================================
    // APLICA REDUÇÃO DE ANIMAÇÕES
    // Desativa transições CSS quando ativado
    // =========================================================================
    if (settings.reducedMotion) {
      root.classList.add('reduce-motion');
      // Remove variáveis de transição personalizadas
      root.style.setProperty('--transition-smooth', 'none');
      root.style.setProperty('--transition-bounce', 'none');
    } else {
      root.classList.remove('reduce-motion');
      // Restaura transições
      root.style.setProperty('--transition-smooth', 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)');
      root.style.setProperty('--transition-bounce', 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)');
    }
  }, [settings]);

  /**
   * Atualiza uma configuração específica
   * Usa generics para type safety
   * 
   * @param key - Nome da configuração a ser atualizada
   * @param value - Novo valor para a configuração
   * 
   * @example
   * updateSetting('fontSize', 'large');
   * updateSetting('highContrast', true);
   */
  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K, 
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Retorna as configurações atuais e a função de atualização
  return { settings, updateSetting };
};
