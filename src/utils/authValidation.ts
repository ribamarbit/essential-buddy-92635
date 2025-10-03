/**
 * Utilitário de validação de autenticação
 * Protege contra manipulação de localStorage e bypass de frontend
 */

const AUTH_KEY = 'isLoggedIn';
const AUTH_TOKEN_KEY = 'authToken';
const AUTH_TIMESTAMP_KEY = 'authTimestamp';
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 horas

/**
 * Gera um token simples de sessão
 */
export const generateSessionToken = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  return btoa(`${timestamp}-${random}`);
};

/**
 * Valida se o usuário está autenticado
 * Verifica múltiplos indicadores para prevenir bypass
 */
export const validateAuth = (): boolean => {
  try {
    const isLoggedIn = localStorage.getItem(AUTH_KEY);
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const timestamp = localStorage.getItem(AUTH_TIMESTAMP_KEY);

    // Verifica se todos os indicadores estão presentes
    if (!isLoggedIn || !token || !timestamp) {
      clearAuth();
      return false;
    }

    // Verifica se o timestamp não foi manipulado
    const authTime = parseInt(timestamp, 10);
    if (isNaN(authTime) || authTime > Date.now()) {
      clearAuth();
      return false;
    }

    // Verifica se a sessão não expirou
    const now = Date.now();
    if (now - authTime > SESSION_TIMEOUT) {
      clearAuth();
      return false;
    }

    // Valida o formato do token
    try {
      const decoded = atob(token);
      if (!decoded.includes('-')) {
        clearAuth();
        return false;
      }
    } catch {
      clearAuth();
      return false;
    }

    return isLoggedIn === 'true';
  } catch (error) {
    console.error('Erro na validação de autenticação:', error);
    clearAuth();
    return false;
  }
};

/**
 * Define o estado de autenticação
 */
export const setAuth = (): void => {
  const token = generateSessionToken();
  const timestamp = Date.now().toString();
  
  localStorage.setItem(AUTH_KEY, 'true');
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_TIMESTAMP_KEY, timestamp);
};

/**
 * Limpa todos os dados de autenticação
 */
export const clearAuth = (): void => {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_TIMESTAMP_KEY);
};

/**
 * Renova o timestamp da sessão
 */
export const renewSession = (): void => {
  if (validateAuth()) {
    localStorage.setItem(AUTH_TIMESTAMP_KEY, Date.now().toString());
  }
};
