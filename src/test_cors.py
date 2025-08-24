import requests
import json
import sys
from colorama import init, Fore, Style

# Inicializar colorama para saída colorida no terminal
init()

# URLs para teste
BACKEND_URL = "https://rec2.onrender.com/api"
FRONTEND_URL = "https://rec-frontend.vercel.app"

def print_header(text):
    print(f"\n{Fore.CYAN}{Style.BRIGHT}{'=' * 50}{Style.RESET_ALL}")
    print(f"{Fore.CYAN}{Style.BRIGHT}{text.center(50)}{Style.RESET_ALL}")
    print(f"{Fore.CYAN}{Style.BRIGHT}{'=' * 50}{Style.RESET_ALL}\n")

def print_success(text):
    print(f"{Fore.GREEN}✓ {text}{Style.RESET_ALL}")

def print_error(text):
    print(f"{Fore.RED}✗ {text}{Style.RESET_ALL}")

def print_info(text):
    print(f"{Fore.YELLOW}ℹ {text}{Style.RESET_ALL}")

def test_cors_preflight():
    print_header("Teste de Preflight CORS")
    
    headers = {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
    }
    
    try:
        response = requests.options(f"{BACKEND_URL}/auth/login", headers=headers)
        
        print_info(f"Status: {response.status_code}")
        print_info("Headers de resposta:")
        
        cors_headers = [
            'Access-Control-Allow-Origin',
            'Access-Control-Allow-Methods',
            'Access-Control-Allow-Headers',
            'Access-Control-Allow-Credentials',
            'Access-Control-Max-Age'
        ]
        
        for header in cors_headers:
            if header in response.headers:
                print_success(f"{header}: {response.headers[header]}")
            else:
                print_error(f"{header}: Não encontrado")
        
        if response.status_code == 200 and 'Access-Control-Allow-Origin' in response.headers:
            if response.headers['Access-Control-Allow-Origin'] == FRONTEND_URL or response.headers['Access-Control-Allow-Origin'] == '*':
                print_success("Preflight CORS configurado corretamente!")
            else:
                print_error(f"Origin não corresponde: {response.headers['Access-Control-Allow-Origin']} != {FRONTEND_URL}")
        else:
            print_error("Preflight CORS falhou!")
    
    except Exception as e:
        print_error(f"Erro ao testar preflight CORS: {str(e)}")

def test_health_endpoint():
    print_header("Teste do Endpoint de Saúde")
    
    try:
        response = requests.get(f"{BACKEND_URL}/health")
        print_info(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            print_success("Endpoint de saúde está funcionando!")
            print_info(f"Resposta: {response.text}")
        else:
            print_error("Endpoint de saúde não está respondendo corretamente!")
    
    except Exception as e:
        print_error(f"Erro ao testar endpoint de saúde: {str(e)}")

def test_login_cors():
    print_header("Teste de Login com CORS")
    
    headers = {
        'Origin': FRONTEND_URL,
        'Content-Type': 'application/json'
    }
    
    data = {
        'username': 'teste',  # Substitua por um usuário de teste válido
        'password': 'senha'   # Substitua por uma senha de teste válida
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/auth/login", 
            headers=headers,
            json=data
        )
        
        print_info(f"Status: {response.status_code}")
        print_info("Headers de resposta:")
        
        cors_headers = [
            'Access-Control-Allow-Origin',
            'Access-Control-Allow-Credentials'
        ]
        
        for header in cors_headers:
            if header in response.headers:
                print_success(f"{header}: {response.headers[header]}")
            else:
                print_error(f"{header}: Não encontrado")
        
        if 'Access-Control-Allow-Origin' in response.headers:
            if response.headers['Access-Control-Allow-Origin'] == FRONTEND_URL or response.headers['Access-Control-Allow-Origin'] == '*':
                print_success("CORS para login configurado corretamente!")
            else:
                print_error(f"Origin não corresponde: {response.headers['Access-Control-Allow-Origin']} != {FRONTEND_URL}")
        else:
            print_error("Cabeçalhos CORS ausentes na resposta!")
            
        if response.status_code == 200:
            print_success("Login bem-sucedido!")
        else:
            print_error(f"Login falhou com status {response.status_code}")
            try:
                print_info(f"Detalhes: {json.dumps(response.json(), indent=2)}")
            except:
                print_info(f"Resposta: {response.text}")
    
    except Exception as e:
        print_error(f"Erro ao testar login com CORS: {str(e)}")

def main():
    print_header("TESTE DE CONFIGURAÇÃO CORS")
    print_info(f"Backend URL: {BACKEND_URL}")
    print_info(f"Frontend URL: {FRONTEND_URL}")
    
    test_health_endpoint()
    test_cors_preflight()
    test_login_cors()

if __name__ == "__main__":
    main()