import os
import sys
import sqlite3
import psycopg2
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Adicionar o diretório raiz ao path para importar os módulos
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Carregar variáveis de ambiente
load_dotenv()

# Configuração do banco de dados SQLite (origem)
sqlite_db_path = os.path.join('src', 'database', 'app.db')
sqlite_uri = f'sqlite:///{sqlite_db_path}'

# Configuração do banco de dados PostgreSQL (destino)
postgres_uri = os.getenv('DATABASE_URL')

if not postgres_uri:
    print("Erro: A variável de ambiente DATABASE_URL não está definida.")
    print("Por favor, configure a variável DATABASE_URL no arquivo .env com a string de conexão do Neon.tech.")
    sys.exit(1)

def setup_postgres_db():
    """Inicializa o banco de dados PostgreSQL usando Flask-Migrate"""
    print("Inicializando o banco de dados PostgreSQL...")
    os.system("flask db init")
    os.system("flask db migrate -m \"Migração inicial para Neon.tech\"")
    os.system("flask db upgrade")
    print("Banco de dados PostgreSQL inicializado com sucesso!")

def limpar_tabelas_postgres():
    """Limpa todas as tabelas no banco de dados PostgreSQL antes da migração"""
    try:
        # Conectar ao banco de dados PostgreSQL
        postgres_uri = os.environ.get('DATABASE_URL')
        postgres_engine = create_engine(postgres_uri)
        postgres_session = sessionmaker(bind=postgres_engine)()
        
        # Limpar tabelas em ordem para evitar problemas de chave estrangeira
        try:
            postgres_session.execute(text('TRUNCATE TABLE "vehicle_update" CASCADE'))
        except Exception:
            print("Tabela vehicle_update não encontrada ou já está vazia.")
            
        try:
            postgres_session.execute(text('TRUNCATE TABLE "document" CASCADE'))
        except Exception:
            print("Tabela document não encontrada ou já está vazia.")
            
        try:
            postgres_session.execute(text('TRUNCATE TABLE "vehicle" CASCADE'))
        except Exception:
            print("Tabela vehicle não encontrada ou já está vazia.")
            
        try:
            postgres_session.execute(text('TRUNCATE TABLE "user" CASCADE'))
        except Exception:
            print("Tabela user não encontrada ou já está vazia.")
            
        try:
            postgres_session.execute(text('TRUNCATE TABLE "rent_a_car" CASCADE'))
        except Exception:
            print("Tabela rent_a_car não encontrada ou já está vazia.")
        
        postgres_session.commit()
        print("Tabelas PostgreSQL limpas com sucesso!")
        return True
    except Exception as e:
        print(f"Erro ao limpar tabelas PostgreSQL: {e}")
        return False

def migrate_data():
    """Migra os dados do SQLite para o PostgreSQL"""
    # Conectar ao banco de dados SQLite
    sqlite_conn = sqlite3.connect(sqlite_db_path)
    sqlite_cursor = sqlite_conn.cursor()
    
    # Conectar ao banco de dados PostgreSQL
    postgres_engine = create_engine(postgres_uri)
    Session = sessionmaker(bind=postgres_engine)
    postgres_session = Session()
    
    try:
        # Obter todas as tabelas do SQLite
        sqlite_cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = sqlite_cursor.fetchall()
        
        for table in tables:
            table_name = table[0]
            if table_name == 'sqlite_sequence':
                continue
                
            print(f"Migrando tabela: {table_name}")
            
            # Obter os dados da tabela SQLite
            sqlite_cursor.execute(f"SELECT * FROM {table_name};")
            rows = sqlite_cursor.fetchall()
            
            # Obter os nomes das colunas
            sqlite_cursor.execute(f"PRAGMA table_info({table_name});")
            columns = sqlite_cursor.fetchall()
            column_names = [column[1] for column in columns]
            
            # Migrar os dados para o PostgreSQL
            for row in rows:
                # Criar dicionário de valores para inserção
                values = {column_names[i]: row[i] for i in range(len(column_names))}
                
                # Converter tipos de dados conforme necessário
                if table_name == 'vehicle':
                    # Converter nuipc e gps_ativo de inteiro para booleano
                    if 'nuipc' in values and values['nuipc'] is not None:
                        values['nuipc'] = bool(values['nuipc'])
                    if 'gps_ativo' in values and values['gps_ativo'] is not None:
                        values['gps_ativo'] = bool(values['gps_ativo'])
                elif table_name == 'user':
                    # Converter is_active de inteiro para booleano
                    if 'is_active' in values and values['is_active'] is not None:
                        values['is_active'] = bool(values['is_active'])
                
                # Construir a query de inserção
                columns_str = ", ".join(column_names)
                placeholders = ", ".join([f":{col}" for col in column_names])
                
                # Tratar tabelas com nomes reservados no PostgreSQL
                if table_name == 'user':
                    insert_query = text(f"INSERT INTO \"user\" ({columns_str}) VALUES ({placeholders})")
                else:
                    insert_query = text(f"INSERT INTO {table_name} ({columns_str}) VALUES ({placeholders})")
                
                # Executar a inserção
                postgres_session.execute(insert_query, values)
            
            postgres_session.commit()
            print(f"Tabela {table_name} migrada com sucesso!")
        
        print("\nMigração de dados concluída com sucesso!")
    
    except Exception as e:
        postgres_session.rollback()
        print(f"Erro durante a migração: {str(e)}")
    
    finally:
        sqlite_conn.close()
        postgres_session.close()

def main():
    print("=== Migração de SQLite para PostgreSQL (Neon.tech) ===")
    print("Este script irá migrar os dados do banco SQLite para o PostgreSQL no Neon.tech.")
    print("Certifique-se de que a variável DATABASE_URL está configurada corretamente no arquivo .env.")
    print("\nAtenção: Este processo irá sobrescrever os dados existentes no banco PostgreSQL.")
    
    confirm = input("\nDeseja continuar? (s/n): ")
    if confirm.lower() != 's':
        print("Migração cancelada.")
        return
    
    # Inicializar o banco de dados PostgreSQL
    setup_postgres_db()
    
    # Limpar tabelas existentes no PostgreSQL
    limpar_tabelas_postgres()
    
    # Migrar os dados
    migrate_data()
    
    print("\nPróximos passos:")
    print("1. Verifique se todos os dados foram migrados corretamente.")
    print("2. Atualize a aplicação para usar exclusivamente o banco de dados PostgreSQL.")
    print("3. Faça backup do banco de dados SQLite antes de removê-lo.")

if __name__ == "__main__":
    main()