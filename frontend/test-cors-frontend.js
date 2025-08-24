// Script para testar a configuração CORS no frontend
// Salve este arquivo e execute-o no console do navegador na página de login

(async function() {
  console.log('%c=== TESTE DE CONFIGURAÇÃO CORS NO FRONTEND ===', 'color: blue; font-weight: bold; font-size: 16px');
  
  // Detectar ambiente
  const currentUrl = window.location.href;
  const isLocalhost = currentUrl.includes('localhost');
  
  // Determinar URLs de API com base no ambiente
  const API_BASE = isLocalhost 
    ? 'http://localhost:5000/api' 
    : 'https://rec2.onrender.com/api';
  
  console.log(`%cAmbiente: ${isLocalhost ? 'Desenvolvimento (localhost)' : 'Produção'}`, 'color: purple');
  console.log(`%cAPI Base: ${API_BASE}`, 'color: purple');
  
  // Função para formatar e exibir resposta
  const logResponse = async (response, label) => {
    console.group(`%c${label}`, 'color: green; font-weight: bold');
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    console.group('Headers:');
    const corsHeaders = [
      'access-control-allow-origin',
      'access-control-allow-credentials',
      'access-control-allow-methods',
      'access-control-allow-headers',
      'access-control-max-age'
    ];
    
    for (const header of corsHeaders) {
      if (response.headers.has(header)) {
        console.log(`%c${header}: ${response.headers.get(header)}`, 'color: green');
      } else {
        console.log(`%c${header}: Não encontrado`, 'color: red');
      }
    }
    console.groupEnd();
    
    try {
      const data = await response.clone().json();
      console.log('Resposta:', data);
    } catch (e) {
      try {
        const text = await response.text();
        console.log('Resposta (texto):', text);
      } catch (e2) {
        console.log('Não foi possível ler o corpo da resposta');
      }
    }
    
    console.groupEnd();
    return response;
  };
  
  // Teste 1: Verificar endpoint de saúde
  console.group('%cTeste 1: Endpoint de Saúde', 'color: blue; font-weight: bold');
  try {
    const timestamp = new Date().getTime();
    const healthResponse = await fetch(`${API_BASE}/health?_=${timestamp}`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    await logResponse(healthResponse, 'Resposta do endpoint de saúde');
    
    if (healthResponse.ok) {
      console.log('%c✓ Endpoint de saúde está funcionando!', 'color: green; font-weight: bold');
    } else {
      console.log('%c✗ Endpoint de saúde não está respondendo corretamente!', 'color: red; font-weight: bold');
    }
  } catch (error) {
    console.error('%c✗ Erro ao testar endpoint de saúde:', 'color: red; font-weight: bold', error);
  }
  console.groupEnd();
  
  // Teste 2: Verificar preflight CORS
  console.group('%cTeste 2: Preflight CORS', 'color: blue; font-weight: bold');
  try {
    const timestamp = new Date().getTime();
    const preflightResponse = await fetch(`${API_BASE}/auth/login?_=${timestamp}`, {
      method: 'OPTIONS',
      headers: {
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      credentials: 'include',
      mode: 'cors'
    });
    
    await logResponse(preflightResponse, 'Resposta do preflight CORS');
    
    if (preflightResponse.ok) {
      console.log('%c✓ Preflight CORS está configurado corretamente!', 'color: green; font-weight: bold');
    } else {
      console.log('%c✗ Preflight CORS não está configurado corretamente!', 'color: red; font-weight: bold');
    }
  } catch (error) {
    console.error('%c✗ Erro ao testar preflight CORS:', 'color: red; font-weight: bold', error);
  }
  console.groupEnd();
  
  // Teste 3: Tentar login com credenciais de teste
  console.group('%cTeste 3: Login com CORS', 'color: blue; font-weight: bold');
  try {
    const timestamp = new Date().getTime();
    const loginResponse = await fetch(`${API_BASE}/auth/login?_=${timestamp}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      body: JSON.stringify({
        username: 'teste', // Substitua por um usuário de teste válido
        password: 'senha'  // Substitua por uma senha de teste válida
      }),
      credentials: 'include',
      mode: 'cors'
    });
    
    await logResponse(loginResponse, 'Resposta do login');
    
    if (loginResponse.ok) {
      console.log('%c✓ Login com CORS está funcionando!', 'color: green; font-weight: bold');
    } else {
      console.log('%c✗ Login com CORS não está funcionando!', 'color: red; font-weight: bold');
    }
  } catch (error) {
    console.error('%c✗ Erro ao testar login com CORS:', 'color: red; font-weight: bold', error);
  }
  console.groupEnd();
  
  // Informações do navegador
  console.group('%cInformações do Navegador', 'color: blue; font-weight: bold');
  console.log('User Agent:', navigator.userAgent);
  console.log('Cookies Habilitados:', navigator.cookieEnabled);
  console.log('Cookies Atuais:', document.cookie);
  console.groupEnd();
  
  console.log('%c=== FIM DOS TESTES ===', 'color: blue; font-weight: bold; font-size: 16px');
})();