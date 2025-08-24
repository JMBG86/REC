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
    
    # Verificar se a tabela existe
    cursor.execute("""
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'rent_a_car'
    )
    """)
    
    tabela_existe = cursor.fetchone()[0]
    
    if tabela_existe:
        # Fazer backup dos dados existentes
        print("Fazendo backup dos dados existentes...")
        cursor.execute("""
        CREATE TEMPORARY TABLE rent_a_car_backup AS 
        SELECT * FROM rent_a_car
        """)
        
        # Contar quantos registros foram salvos no backup
        cursor.execute("SELECT COUNT(*) FROM rent_a_car_backup")
        num_registros = cursor.fetchone()[0]
        print(f"Backup de {num_registros} registros criado com sucesso.")
        
        # Remover a tabela existente
        print("Removendo tabela existente...")
        cursor.execute("DROP TABLE IF EXISTS rent_a_car CASCADE")
        print("Tabela removida com sucesso.")
    
    # Criar a tabela novamente com todas as colunas necessárias
    print("Criando tabela rent_a_car...")
    cursor.execute("""
    CREATE TABLE rent_a_car (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        contacto_email VARCHAR(120),
        contacto_telefone VARCHAR(20),
        endereco VARCHAR(200),
        cidade VARCHAR(100),
        codigo_postal VARCHAR(20),
        pais VARCHAR(50) DEFAULT 'Portugal',
        nif VARCHAR(20),
        website VARCHAR(200),
        logo_url VARCHAR(500),
        descricao TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    print("Tabela criada com sucesso.")
    
    # Restaurar os dados do backup, se existirem
    if tabela_existe and num_registros > 0:
        print("Restaurando dados do backup...")
        
        # Obter as colunas da tabela de backup
        cursor.execute("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'rent_a_car_backup'
        """)
        
        colunas_backup = [row[0] for row in cursor.fetchall()]
        colunas_str = ", ".join(colunas_backup)
        
        # Inserir apenas as colunas que existem em ambas as tabelas
        cursor.execute(f"""
        INSERT INTO rent_a_car ({colunas_str})
        SELECT {colunas_str} FROM rent_a_car_backup
        """)
        
        print(f"Dados restaurados com sucesso.")
    
    # Verificar as colunas da tabela após a recriação
    cursor.execute("""
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'rent_a_car'
    """)
    
    colunas_atuais = [row[0] for row in cursor.fetchall()]
    print(f"Colunas na tabela recriada: {colunas_atuais}")
    
    # Fechar a conexão
    cursor.close()
    conn.close()
    
    print("Script concluído com sucesso!")
    
except Exception as e:
    print(f"Erro ao executar o script: {e}")