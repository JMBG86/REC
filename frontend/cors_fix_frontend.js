/**
 * Script para verificar e corrigir configurações CORS no frontend
 * 
 * Este script pode ser executado no console do navegador para verificar
 * se as requisições estão sendo feitas com as configurações CORS corretas.
 */

// Detectar ambiente
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE = isLocalhost ? 'http://localhost:5000/api' : 'https://rec2.onrender.com/api';
const FRONTEND_URL = isLocalhost ? 'http://localhost:3000' : 'https://rec-frontend.vercel.app';

console.log('Ambiente detectado:', isLocalhost ? 'Desenvolvimento (localhost)' : 'Produção');
console.log('API Base:', API_BASE);
console.log('Frontend URL:', FRONTEND_URL);

// Função para formatar resposta HTTP
function formatResponse(response) {
  const headers = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });
  
  return {
    status: response.status,
    statusText: response.statusText,
    headers: headers,
    url: response.url
  };
}

// Função para verificar cabeçalhos CORS
function checkCorsHeaders(headers) {
  const corsHeaders = {
    'access-control-allow-origin': FRONTEND_URL,
    'access-control-allow-credentials': 'true',
    'access-control-allow-methods': null,
    'access-control-allow-headers': null
  };
  
  const results = {};
  
  for (const [header, expectedValue] of Object.entries(corsHeaders)) {
    if (headers[header]) {
      if (expectedValue === null || headers[header] === expectedValue) {
        results[header] = { value: headers[header], status: 'ok' };
      } else {
        results[header] = { value: headers[header], expected: expectedValue, status: 'error' };
      }
    } else {
      results[header] = { status: 'missing' };
    }
  }
  
  return results;
}

// Teste 1: Verificar endpoint de saúde
async function testHealthEndpoint() {
  console.group('Teste 1: Endpoint de Saúde');
  try {
    const response = await fetch(`${API_BASE}/health`, {
      method: 'GET',
      cache: 'no-store'
    });
    
    console.log('Resposta:', formatResponse(response));
    const data = await response.json();
    console.log('Dados:', data);
    
    console.log('Status:', response.ok ? 'OK' : 'Falha');
  } catch (error) {
    console.error('Erro:', error);
  }
  console.groupEnd();
}

// Teste 2: Verificar preflight CORS
async function testPreflightCors() {
  console.group('Teste 2: Preflight CORS');
  try {
    // Adicionar timestamp para evitar cache
    const timestamp = new Date().getTime();
    const response = await fetch(`${API_BASE}/auth/login?_=${timestamp}`, {
      method: 'OPTIONS',
      headers: {
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      },
      credentials: 'include',
      mode: 'cors'
    });
    
    console.log('Resposta:', formatResponse(response));
    console.log('Cabeçalhos CORS:', checkCorsHeaders(formatResponse(response).headers));
    console.log('Status:', response.ok ? 'OK' : 'Falha');
  } catch (error) {
    console.error('Erro:', error);
  }
  console.groupEnd();
}

// Teste 3: Verificar login com CORS
async function testLoginCors() {
  console.group('Teste 3: Login com CORS');
  try {
    // Adicionar timestamp para evitar cache
    const timestamp = new Date().getTime();
    const response = await fetch(`${API_BASE}/auth/login?_=${timestamp}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      body: JSON.stringify({
        username: 'teste',
        password: 'senha_incorreta'
      }),
      credentials: 'include',
      mode: 'cors'
    });
    
    console.log('Resposta:', formatResponse(response));
    console.log('Cabeçalhos CORS:', checkCorsHeaders(formatResponse(response).headers));
    
    try {
      const data = await response.json();
      console.log('Dados:', data);
    } catch (e) {
      console.log('Resposta não é JSON:', await response.text());
    }
    
    console.log('Status:', response.status === 401 ? 'OK (401 esperado para credenciais inválidas)' : 'Falha');
  } catch (error) {
    console.error('Erro:', error);
  }
  console.groupEnd();
}

// Executar todos os testes
async function runAllTests() {
  console.group('Testes de Configuração CORS');
  await testHealthEndpoint();
  await testPreflightCors();
  await testLoginCors();
  console.groupEnd();
  
  console.log('\nRecomendações para corrigir problemas de CORS:');
  console.log('1. Verifique se o backend tem "supports_credentials: True" na configuração CORS');
  console.log('2. Verifique se todas as requisições do frontend incluem "credentials: \'include\', mode: \'cors\'"');
  console.log('3. Verifique se o vercel.json tem "Access-Control-Allow-Credentials: true"');
  console.log('4. Limpe o cache do navegador e tente novamente');
}

// Executar testes
runAllTests();