import requests
import json
import sys
from urllib.parse import urlparse
from colorama import init, Fore, Style

# Inicializar colorama para saída colorida no terminal
init()

# URLs para teste
BACKEND_URL = "https://rec2.onrender.com/api"
FRONTEND_URLS = [
    "http://localhost:3000",
    "https://rec-frontend.vercel.app"
]

def print_header(text):
    print(f"\n{Fore.CYAN}{Style.BRIGHT}{'=' * 60}{Style.RESET_ALL}")
    print(f"{Fore.CYAN}{Style.BRIGHT}{text.center(60)}{Style.RESET_ALL}")
    print(f"{Fore.CYAN}{Style.BRIGHT}{'=' * 60}{Style.RESET_ALL}\n")

def print_success(text):
    print(f"{Fore.GREEN}✓ {text}{Style.RESET_ALL}")

def print_error(text):
    print(f"{Fore.RED}✗ {text}{Style.RESET_ALL}")

def print_info(text):
    print(f"{Fore.YELLOW}ℹ {text}{Style.RESET_ALL}")

def check_backend_health():
    print_header("Verificação de Saúde do Backend")
    
    try:
        response = requests.get(f"{BACKEND_URL}/health")
        print_info(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            print_success("Backend está online!")
            print_info(f"Resposta: {response.text}")
            return True
        else:
            print_error("Backend não está respondendo corretamente!")
            return False
    
    except Exception as e:
        print_error(f"Erro ao conectar ao backend: {str(e)}")
        return False

def check_cors_config():
    print_header("Verificação da Configuração CORS")
    
    for frontend_url in FRONTEND_URLS:
        print_info(f"\nTestando origem: {frontend_url}")
        
        headers = {
            'Origin': frontend_url,
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type, Authorization'
        }
        
        try:
            response = requests.options(f"{BACKEND_URL}/auth/login", headers=headers)
            
            print_info(f"Status: {response.status_code}")
            
            # Verificar cabeçalhos CORS
            cors_headers = {
                'Access-Control-Allow-Origin': frontend_url,
                'Access-Control-Allow-Credentials': 'true'
            }
            
            all_headers_correct = True
            
            for header, expected_value in cors_headers.items():
                if header in response.headers:
                    actual_value = response.headers[header]
                    if header == 'Access-Control-Allow-Origin' and actual_value == '*':
                        print_info(f"{header}: {actual_value} (Permite qualquer origem, mas não é compatível com credenciais)")
                        all_headers_correct = False
                    elif actual_value == expected_value:
                        print_success(f"{header}: {actual_value}")
                    else:
                        print_error(f"{header}: {actual_value} (Esperado: {expected_value})")
                        all_headers_correct = False
                else:
                    print_error(f"{header}: Não encontrado")
                    all_headers_correct = False
            
            # Verificar outros cabeçalhos importantes
            other_headers = [
                'Access-Control-Allow-Methods',
                'Access-Control-Allow-Headers'
            ]
            
            for header in other_headers:
                if header in response.headers:
                    print_success(f"{header}: {response.headers[header]}")
                else:
                    print_error(f"{header}: Não encontrado")
                    all_headers_correct = False
            
            if all_headers_correct:
                print_success(f"Configuração CORS correta para {frontend_url}!")
            else:
                print_error(f"Configuração CORS incorreta para {frontend_url}!")
        
        except Exception as e:
            print_error(f"Erro ao verificar configuração CORS para {frontend_url}: {str(e)}")

def check_network_connectivity():
    print_header("Verificação de Conectividade de Rede")
    
    backend_domain = urlparse(BACKEND_URL).netloc
    
    print_info(f"Verificando conectividade com {backend_domain}...")
    
    try:
        response = requests.get(f"https://{backend_domain}")
        print_success(f"Conectividade com {backend_domain}: OK (Status {response.status_code})")
    except Exception as e:
        print_error(f"Problema de conectividade com {backend_domain}: {str(e)}")
    
    for frontend_url in FRONTEND_URLS:
        if frontend_url.startswith("http"):
            frontend_domain = urlparse(frontend_url).netloc
            
            if frontend_domain != "localhost:3000":
                print_info(f"Verificando conectividade com {frontend_domain}...")
                
                try:
                    response = requests.get(frontend_url)
                    print_success(f"Conectividade com {frontend_domain}: OK (Status {response.status_code})")
                except Exception as e:
                    print_error(f"Problema de conectividade com {frontend_domain}: {str(e)}")

def main():
    print_header("VERIFICAÇÃO DE CONFIGURAÇÃO CORS")
    print_info(f"Backend URL: {BACKEND_URL}")
    print_info(f"Frontend URLs: {', '.join(FRONTEND_URLS)}")
    
    if check_backend_health():
        check_network_connectivity()
        check_cors_config()
    else:
        print_error("Verificação de CORS cancelada devido a problemas com o backend.")

if __name__ == "__main__":
    main()