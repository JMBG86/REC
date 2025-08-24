/**
 * Utilitário para fazer requisições à API com configurações consistentes
 * Este arquivo centraliza a lógica de comunicação com o backend
 */

// Determina a URL base da API com base no ambiente
const getApiBaseUrl = () => {
  // Em produção, usar a URL completa do backend
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_BASE || '/api';
  }
  // Em desenvolvimento, usar o proxy local para evitar problemas de CORS
  return '/api';
};

// URL base da API
const API_BASE = getApiBaseUrl();

/**
 * Função para fazer requisições à API com configurações padrão
 * @param {string} endpoint - O endpoint da API (sem a URL base)
 * @param {Object} options - Opções para a requisição fetch
 * @returns {Promise} - Promise com a resposta da requisição
 */
const apiRequest = async (endpoint, options = {}) => {
  // Adiciona um timestamp para evitar cache
  const timestamp = new Date().getTime();
  const url = `${API_BASE}/${endpoint.replace(/^\//, '')}?_=${timestamp}`;
  
  // Configurações padrão para todas as requisições
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
    credentials: 'include',
    mode: 'cors'
  };
  
  // Adiciona o token de autorização se disponível
  const token = localStorage.getItem('token');
  if (token) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Mescla as opções padrão com as opções fornecidas
  const fetchOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {})
    }
  };
  
  try {
    console.log(`Fazendo requisição para: ${url}`);
    console.log('Opções:', JSON.stringify(fetchOptions, (key, value) => {
      // Não exibir o valor do token no console por segurança
      if (key === 'Authorization') return 'Bearer ***';
      return value;
    }));
    
    const response = await fetch(url, fetchOptions);
    
    console.log(`Resposta de ${url} - Status:`, response.status);
    
    // Se a resposta não for OK, lança um erro
    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch (e) {
        const text = await response.text();
        errorData = { message: text || 'Erro desconhecido' };
      }
      
      throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
    }
    
    // Tenta converter a resposta para JSON
    try {
      return await response.json();
    } catch (e) {
      // Se não for JSON, retorna o texto
      return await response.text();
    }
  } catch (error) {
    console.error(`Erro na requisição para ${url}:`, error);
    throw error;
  }
};

export { API_BASE, apiRequest };