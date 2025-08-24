/**
 * Script para testar a configuração CORS atualizada no frontend
 * Este script verifica se os cabeçalhos CORS estão configurados corretamente,
 * incluindo o novo cabeçalho Vary: Origin
 */

// Configurações
const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api' 
  : 'https://rec2.onrender.com/api';

const FRONTEND_ORIGIN = window.location.origin;

console.log('%c=== TESTE DE CONFIGURAÇÃO CORS ATUALIZADA ===', 'background: #3498db; color: white; font-size: 14px; padding: 5px;');
console.log(`Frontend: ${FRONTEND_ORIGIN}`);
console.log(`Backend: ${API_BASE}`);

// Função para formatar os resultados
const formatResult = (success, message) => {
  console.log(
    `%c${success ? '✅ SUCESSO' : '❌ FALHA'}: ${message}`,
    `color: ${success ? 'green' : 'red'}; font-weight: bold;`
  );
};

// Função para verificar cabeçalhos CORS
const checkCorsHeaders = (headers, test) => {
  const results = {
    allowOrigin: headers.get('Access-Control-Allow-Origin'),
    allowCredentials: headers.get('Access-Control-Allow-Credentials'),
    allowMethods: headers.get('Access-Control-Allow-Methods'),
    allowHeaders: headers.get('Access-Control-Allow-Headers'),
    vary: headers.get('Vary')
  };
  
  console.log(`%c=== Cabeçalhos para ${test} ===`, 'background: #2c3e50; color: white; padding: 3px;');
  console.table(results);
  
  // Verificações específicas
  formatResult(results.allowOrigin === FRONTEND_ORIGIN || results.allowOrigin === '*', 
    `Access-Control-Allow-Origin: ${results.allowOrigin || 'não encontrado'}`);
  
  formatResult(results.allowCredentials === 'true', 
    `Access-Control-Allow-Credentials: ${results.allowCredentials || 'não encontrado'}`);
  
  formatResult(results.allowMethods && results.allowMethods.includes('POST'), 
    `Access-Control-Allow-Methods: ${results.allowMethods || 'não encontrado'}`);
  
  formatResult(results.allowHeaders && results.allowHeaders.includes('Content-Type'), 
    `Access-Control-Allow-Headers: ${results.allowHeaders || 'não encontrado'}`);
  
  formatResult(results.vary === 'Origin', 
    `Vary: ${results.vary || 'não encontrado'} (Novo cabeçalho adicionado)`);
  
  return Object.values(results).filter(Boolean).length === 5;
};

// Teste 1: Verificar endpoint de saúde
const testHealth = async () => {
  console.log('%c=== Teste 1: Verificar endpoint de saúde ===', 'background: #9b59b6; color: white; padding: 5px;');
  try {
    const response = await fetch(`${API_BASE}/health`, {
      method: 'GET',
      credentials: 'include',
      mode: 'cors',
      cache: 'no-store'
    });
    
    const success = response.ok;
    formatResult(success, `Endpoint de saúde: ${success ? 'OK' : 'Falhou'}`);
    
    if (success) {
      const data = await response.json();
      console.log('Resposta:', data);
    }
    
    const headersOk = checkCorsHeaders(response.headers, 'endpoint de saúde');
    return { success, headersOk };
  } catch (error) {
    formatResult(false, `Erro ao acessar endpoint de saúde: ${error.message}`);
    return { success: false, headersOk: false };
  }
};

// Teste 2: Verificar preflight CORS
const testPreflight = async () => {
  console.log('%c=== Teste 2: Verificar preflight CORS ===', 'background: #9b59b6; color: white; padding: 5px;');
  try {
    // Adicionar timestamp para evitar cache
    const timestamp = new Date().getTime();
    const response = await fetch(`${API_BASE}/auth/login?_=${timestamp}`, {
      method: 'OPTIONS',
      headers: {
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization',
        'Origin': FRONTEND_ORIGIN
      },
      credentials: 'include',
      mode: 'cors',
      cache: 'no-store'
    });
    
    const success = response.ok;
    formatResult(success, `Preflight CORS: ${success ? 'OK' : 'Falhou'}`);
    
    const headersOk = checkCorsHeaders(response.headers, 'preflight CORS');
    return { success, headersOk };
  } catch (error) {
    formatResult(false, `Erro no preflight CORS: ${error.message}`);
    return { success: false, headersOk: false };
  }
};

// Teste 3: Tentar login (apenas para testar CORS, não para autenticar)
const testLogin = async () => {
  console.log('%c=== Teste 3: Tentar login (teste CORS) ===', 'background: #9b59b6; color: white; padding: 5px;');
  try {
    // Adicionar timestamp para evitar cache
    const timestamp = new Date().getTime();
    const response = await fetch(`${API_BASE}/auth/login?_=${timestamp}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'teste@exemplo.com',
        password: 'senha_teste'
      }),
      credentials: 'include',
      mode: 'cors',
      cache: 'no-store'
    });
    
    // Aqui esperamos 401 para credenciais inválidas, o importante são os cabeçalhos CORS
    const success = response.status === 401 || response.status === 200;
    formatResult(success, `Login (teste CORS): ${success ? 'OK' : 'Falhou'} (Status: ${response.status})`);
    
    const headersOk = checkCorsHeaders(response.headers, 'login');
    return { success, headersOk };
  } catch (error) {
    formatResult(false, `Erro no teste de login: ${error.message}`);
    return { success: false, headersOk: false };
  }
};

// Executar todos os testes
const runAllTests = async () => {
  const healthResult = await testHealth();
  console.log('\n');
  
  const preflightResult = await testPreflight();
  console.log('\n');
  
  const loginResult = await testLogin();
  console.log('\n');
  
  // Resumo dos resultados
  console.log('%c=== RESUMO DOS TESTES ===', 'background: #e74c3c; color: white; font-size: 14px; padding: 5px;');
  
  formatResult(healthResult.success, 'Endpoint de saúde');
  formatResult(healthResult.headersOk, 'Cabeçalhos CORS no endpoint de saúde');
  
  formatResult(preflightResult.success, 'Preflight CORS');
  formatResult(preflightResult.headersOk, 'Cabeçalhos CORS no preflight');
  
  formatResult(loginResult.success, 'Login (teste CORS)');
  formatResult(loginResult.headersOk, 'Cabeçalhos CORS no login');
  
  const allSuccess = healthResult.success && preflightResult.success && loginResult.success;
  const allHeadersOk = healthResult.headersOk && preflightResult.headersOk && loginResult.headersOk;
  
  console.log('\n');
  console.log(
    `%c${allSuccess && allHeadersOk ? 'TODOS OS TESTES PASSARAM! 🎉' : 'ALGUNS TESTES FALHARAM ⚠️'}`,
    `background: ${allSuccess && allHeadersOk ? '#27ae60' : '#e74c3c'}; color: white; font-size: 16px; padding: 10px;`
  );
  
  if (!allHeadersOk) {
    console.log('%cRecomendações:', 'font-weight: bold;');
    console.log('1. Verifique se o backend está configurado corretamente com CORS');
    console.log('2. Verifique se o vercel.json está configurado corretamente');
    console.log('3. Limpe o cache do navegador ou use uma janela anônima');
    console.log('4. Verifique se as alterações foram implantadas no servidor de produção');
  }
};

// Executar os testes
runAllTests();