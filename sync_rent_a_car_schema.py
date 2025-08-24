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
    
    # Lista de todas as colunas que devem existir na tabela rent_a_car
    colunas = [
        ("nome", "VARCHAR(100) NOT NULL"),
        ("contacto_email", "VARCHAR(120)"),
        ("contacto_telefone", "VARCHAR(20)"),
        ("endereco", "VARCHAR(200)"),
        ("cidade", "VARCHAR(100)"),
        ("codigo_postal", "VARCHAR(20)"),
        ("pais", "VARCHAR(50) DEFAULT 'Portugal'"),
        ("nif", "VARCHAR(20)"),
        ("website", "VARCHAR(200)"),
        ("logo_url", "VARCHAR(500)"),
        ("descricao", "TEXT"),
        ("is_active", "BOOLEAN DEFAULT TRUE"),
        ("created_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"),
        ("updated_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    ]
    
    # Verificar quais colunas existem na tabela
    cursor.execute("""
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'rent_a_car'
    """)
    
    colunas_existentes = [row[0] for row in cursor.fetchall()]
    print(f"Colunas existentes: {colunas_existentes}")
    
    # Adicionar colunas faltantes
    for nome_coluna, tipo_coluna in colunas:
        if nome_coluna.lower() not in [col.lower() for col in colunas_existentes]:
            print(f"Adicionando coluna {nome_coluna}...")
            cursor.execute(f"""
            ALTER TABLE rent_a_car 
            ADD COLUMN {nome_coluna} {tipo_coluna}
            """)
            print(f"Coluna {nome_coluna} adicionada com sucesso!")
    
    # Verificar novamente as colunas após as alterações
    cursor.execute("""
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'rent_a_car'
    """)
    
    colunas_atualizadas = [row[0] for row in cursor.fetchall()]
    print(f"Colunas após atualização: {colunas_atualizadas}")
    
    # Fechar a conexão
    cursor.close()
    conn.close()
    
    print("Script concluído com sucesso!")
    
except Exception as e:
    print(f"Erro ao executar o script: {e}")