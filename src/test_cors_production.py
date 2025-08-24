import requests
import colorama
from colorama import Fore, Style
import json

# Inicializar colorama
colorama.init(autoreset=True)

# URLs para teste
BACKEND_URL = "https://rec2.onrender.com/api"
FRONTEND_URLS = [
    "http://localhost:3000",
    "https://rec-frontend.vercel.app"
]

def print_header(text):
    print("\n" + "=" * 50)
    print(f"{Fore.CYAN}{Style.BRIGHT}{text.center(50)}")
    print("=" * 50 + "\n")

def print_success(text):
    print(f"{Fore.GREEN}✓ {text}")

def print_error(text):
    print(f"{Fore.RED}✗ {text}")

def print_info(text):
    print(f"{Fore.BLUE}ℹ {text}")

def test_health_endpoint():
    print_header("Teste do Endpoint de Saúde")
    try:
        response = requests.get(f"{BACKEND_URL}/health")
        print_info(f"Status: {response.status_code}")
        if response.status_code == 200:
            print_success("Endpoint de saúde está funcionando!")
            try:
                data = response.json()
                print_info(f"Resposta: {json.dumps(data, indent=2)}")
            except:
                print_info(f"Resposta: {response.text}")
        else:
            print_error(f"Endpoint de saúde retornou status {response.status_code}")
            print_info(f"Resposta: {response.text}")
    except Exception as e:
        print_error(f"Erro ao acessar o endpoint de saúde: {str(e)}")

def test_cors_preflight(origin):
    print_header(f"Teste de Preflight CORS para {origin}")
    try:
        headers = {
            "Origin": origin,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type, Authorization"
        }
        response = requests.options(f"{BACKEND_URL}/auth/login", headers=headers)
        print_info(f"Status: {response.status_code}")
        print_info("Headers de resposta:")
        
        # Verificar cabeçalhos CORS
        cors_headers = {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": None,
            "Access-Control-Allow-Headers": None,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Max-Age": None
        }
        
        for header, expected in cors_headers.items():
            if header in response.headers:
                if expected is None or response.headers[header] == expected:
                    print_success(f"{header}: {response.headers[header]}")
                else:
                    print_error(f"{header}: {response.headers[header]} (esperado: {expected})")
            else:
                print_error(f"{header}: Não encontrado")
        
        if response.status_code == 200 and "Access-Control-Allow-Origin" in response.headers:
            if response.headers["Access-Control-Allow-Origin"] == origin:
                print_success("Preflight CORS configurado corretamente!")
            else:
                print_error(f"Origin incorreto: {response.headers['Access-Control-Allow-Origin']} (esperado: {origin})")
        else:
            print_error("Preflight CORS falhou!")
    except Exception as e:
        print_error(f"Erro no teste de preflight CORS: {str(e)}")

def test_cors_login(origin):
    print_header(f"Teste de Login com CORS para {origin}")
    try:
        headers = {
            "Origin": origin,
            "Content-Type": "application/json"
        }
        data = {
            "username": "teste",
            "password": "senha_incorreta"
        }
        response = requests.post(f"{BACKEND_URL}/auth/login", headers=headers, json=data)
        print_info(f"Status: {response.status_code}")
        print_info("Headers de resposta:")
        
        # Verificar cabeçalhos CORS
        if "Access-Control-Allow-Origin" in response.headers:
            if response.headers["Access-Control-Allow-Origin"] == origin:
                print_success(f"Access-Control-Allow-Origin: {response.headers['Access-Control-Allow-Origin']}")
            else:
                print_error(f"Origin incorreto: {response.headers['Access-Control-Allow-Origin']} (esperado: {origin})")
        else:
            print_error("Access-Control-Allow-Origin: Não encontrado")
            
        if "Access-Control-Allow-Credentials" in response.headers:
            print_success(f"Access-Control-Allow-Credentials: {response.headers['Access-Control-Allow-Credentials']}")
        else:
            print_error("Access-Control-Allow-Credentials: Não encontrado")
        
        if "Access-Control-Allow-Origin" in response.headers and response.headers["Access-Control-Allow-Origin"] == origin:
            print_success("CORS para login configurado corretamente!")
        else:
            print_error("CORS para login falhou!")
            
        # Verificar resposta (mesmo com credenciais incorretas, deve retornar 401 e não 500)
        if response.status_code == 401:
            print_success("Login retornou status 401 (Não autorizado) como esperado para credenciais inválidas")
        else:
            print_error(f"Login falhou com status {response.status_code}")
            
        try:
            data = response.json()
            print_info(f"Resposta: {json.dumps(data, indent=2)}")
        except:
            print_info(f"Resposta: {response.text}")
    except Exception as e:
        print_error(f"Erro no teste de login com CORS: {str(e)}")

def main():
    print_header("Teste de Configuração CORS em Produção")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Frontend URLs para teste: {', '.join(FRONTEND_URLS)}")
    
    # Testar endpoint de saúde
    test_health_endpoint()
    
    # Testar preflight e login para cada origem
    for origin in FRONTEND_URLS:
        test_cors_preflight(origin)
        test_cors_login(origin)

if __name__ == "__main__":
    main()