import os
import json
import getpass

def setup_email_config():
    print("\n=== Configuração do Serviço de Email ===\n")
    print("Este script irá configurar as credenciais para o serviço de email triggers.")
    print("As credenciais serão salvas em um arquivo .env na raiz do projeto.\n")
    
    email_address = input("Email (ex: seu_email@gmail.com): ")
    password = getpass.getpass("Senha do email: ")
    imap_server = input("Servidor IMAP (padrão: imap.gmail.com): ") or "imap.gmail.com"
    imap_port = input("Porta IMAP (padrão: 993): ") or "993"
    
    # Criar ou atualizar arquivo .env
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    
    # Ler arquivo existente se houver
    env_vars = {}
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                if '=' in line:
                    key, value = line.strip().split('=', 1)
                    env_vars[key] = value
    
    # Atualizar com novas variáveis
    env_vars['EMAIL_ADDRESS'] = email_address
    env_vars['EMAIL_PASSWORD'] = password
    env_vars['EMAIL_IMAP_SERVER'] = imap_server
    env_vars['EMAIL_IMAP_PORT'] = imap_port
    
    # Salvar arquivo .env
    with open(env_path, 'w') as f:
        for key, value in env_vars.items():
            f.write(f"{key}={value}\n")
    
    print("\nConfiguração salva com sucesso!")
    print(f"Arquivo .env criado/atualizado em: {env_path}")
    print("\nIMPORTANTE: Para Gmail, você precisa habilitar o acesso a apps menos seguros ou criar uma senha de app.")
    print("Instruções: https://support.google.com/accounts/answer/185833")

if __name__ == "__main__":
    setup_email_config()