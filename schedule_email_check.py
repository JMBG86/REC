import os
import sys
import time
import schedule
import requests
import logging
from dotenv import load_dotenv

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("email_scheduler.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('email_scheduler')

# Carregar variáveis de ambiente
load_dotenv()

# Configurações
API_BASE = os.getenv('API_BASE', 'http://localhost:5000/api')
ADMIN_USERNAME = os.getenv('ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'admin')
CHECK_INTERVAL_MINUTES = int(os.getenv('CHECK_INTERVAL_MINUTES', '15'))

def get_auth_token():
    """Obter token de autenticação"""
    try:
        response = requests.post(
            f"{API_BASE}/auth/login",
            json={"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD}
        )
        
        if response.status_code == 200:
            return response.json().get('token')
        else:
            logger.error(f"Falha na autenticação: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        logger.error(f"Erro ao obter token: {str(e)}")
        return None

def check_new_emails():
    """Verificar novos emails"""
    logger.info("Iniciando verificação de novos emails...")
    
    token = get_auth_token()
    if not token:
        logger.error("Não foi possível obter token de autenticação")
        return
    
    try:
        # Verificar novos emails
        check_response = requests.post(
            f"{API_BASE}/email-triggers/check-new",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if check_response.status_code == 200:
            check_data = check_response.json()
            logger.info(f"Verificação concluída: {check_data.get('processed_count')} emails processados")
            
            # Se houver novos emails, processar automaticamente
            if check_data.get('processed_count', 0) > 0:
                process_response = requests.post(
                    f"{API_BASE}/email-triggers/auto-process",
                    headers={"Authorization": f"Bearer {token}"}
                )
                
                if process_response.status_code == 200:
                    process_data = process_response.json()
                    logger.info(f"Processamento automático: {process_data.get('success')} sucesso, {process_data.get('failed')} falhas")
                else:
                    logger.error(f"Erro no processamento automático: {process_response.status_code} - {process_response.text}")
        else:
            logger.error(f"Erro na verificação de emails: {check_response.status_code} - {check_response.text}")
    
    except Exception as e:
        logger.error(f"Erro ao verificar/processar emails: {str(e)}")

def main():
    logger.info(f"Iniciando agendador de verificação de emails (intervalo: {CHECK_INTERVAL_MINUTES} minutos)")
    
    # Agendar verificação periódica
    schedule.every(CHECK_INTERVAL_MINUTES).minutes.do(check_new_emails)
    
    # Executar uma verificação inicial
    check_new_emails()
    
    # Loop principal
    try:
        while True:
            schedule.run_pending()
            time.sleep(1)
    except KeyboardInterrupt:
        logger.info("Agendador interrompido pelo usuário")
    except Exception as e:
        logger.error(f"Erro no loop principal: {str(e)}")

if __name__ == "__main__":
    main()