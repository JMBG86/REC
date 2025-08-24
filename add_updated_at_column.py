import os
import psycopg2
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Obter a string de conexão do banco de dados
database_url = os.getenv('DATABASE_URL')

if not database_url:
    print("Erro: DATABASE_URL não encontrada nas variáveis de ambiente.")
    exit(1)

try:
    # Conectar ao banco de dados
    conn = psycopg2.connect(database_url)
    conn.autocommit = True
    cursor = conn.cursor()
    
    # Adicionar a coluna updated_at se não existir
    cursor.execute("""
    ALTER TABLE rent_a_car 
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    """)
    
    print("Coluna 'updated_at' adicionada com sucesso à tabela 'rent_a_car' ou já existia.")
    
    # Fechar a conexão
    cursor.close()
    conn.close()
    
    print("Script concluído com sucesso!")
    
except Exception as e:
    print(f"Erro ao executar o script: {e}")