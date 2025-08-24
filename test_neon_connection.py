import os
import sys
import time
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Adicionar o diretório raiz ao path para importar os módulos
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Carregar variáveis de ambiente
load_dotenv()

# Obter a string de conexão do Neon.tech
database_url = os.getenv('DATABASE_URL')

if not database_url:
    print("Erro: A variável de ambiente DATABASE_URL não está definida.")
    print("Por favor, configure a variável DATABASE_URL no arquivo .env com a string de conexão do Neon.tech.")
    sys.exit(1)

print("Testando conexão com o banco de dados Neon.tech...")

try:
    # Criar engine do SQLAlchemy com parâmetros de pool para melhor desempenho
    engine = create_engine(
        database_url,
        pool_pre_ping=True,  # Verifica se a conexão está ativa antes de usá-la
        pool_recycle=3600,   # Recicla conexões após 1 hora
        connect_args={
            "connect_timeout": 10  # Timeout de conexão em segundos
        }
    )
    
    # Testar conexão
    with engine.connect() as conn:
        # Verificar se a conexão está funcionando
        result = conn.execute(text("SELECT 1"))
        print("✅ Conexão com o banco de dados Neon.tech estabelecida com sucesso!")
        
        # Verificar tabelas existentes
        result = conn.execute(text(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
        ))
        tables = [row[0] for row in result]
        
        if tables:
            print(f"\nTabelas encontradas no banco de dados ({len(tables)}):\n")
            for table in sorted(tables):
                print(f"- {table}")
                
            # Verificar contagem de registros em cada tabela
            print("\nContagem de registros por tabela:")
            for table in sorted(tables):
                try:
                    count_result = conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
                    count = count_result.scalar()
                    print(f"- {table}: {count} registros")
                except Exception as e:
                    print(f"- {table}: Erro ao contar registros - {str(e)}")
        else:
            print("\nNenhuma tabela encontrada no banco de dados.")
            print("Execute o script de migração para criar as tabelas e migrar os dados.")
    
    print("\n✅ Teste de conexão concluído com sucesso!")
    print("A aplicação está configurada corretamente para usar o Neon.tech.")
    
except Exception as e:
    print(f"\n❌ Erro ao conectar ao banco de dados Neon.tech: {str(e)}")
    print("\nVerifique:")
    print("1. Se a string de conexão está correta no arquivo .env")
    print("2. Se o banco de dados está acessível (firewall, VPN, etc.)")
    print("3. Se as credenciais estão corretas")
    print("4. Se o driver psycopg2 está instalado corretamente")