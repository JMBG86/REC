import sys
import os

# Adicionar o diretório raiz ao path para importar os módulos corretamente
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from flask import Flask
from src.models.user import db
from sqlalchemy import text
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

def update_vehicle_vin_column():
    """Remove a restrição de unicidade da coluna 'vin' na tabela 'vehicle'"""
    # Configuração do Flask e do banco de dados
    app = Flask(__name__)
    database_url = os.getenv('DATABASE_URL')
    if database_url is None:
        # Fallback para SQLite se DATABASE_URL não estiver definido
        database_url = f"sqlite:///{os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database', 'app.db')}"
        print("AVISO: Usando SQLite como fallback. Configure DATABASE_URL para usar Neon.tech.")
    
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Inicializar o banco de dados com o app
    db.init_app(app)
    
    with app.app_context():
        try:
            # Verificar se estamos usando PostgreSQL
            if 'postgresql' in database_url:
                # Verificar se a restrição de unicidade existe
                result = db.session.execute(text("""
                    SELECT constraint_name 
                    FROM information_schema.table_constraints 
                    WHERE table_name = 'vehicle' 
                    AND constraint_type = 'UNIQUE' 
                    AND constraint_name LIKE '%vin%'
                """)).fetchall()
                
                if result:
                    for row in result:
                        constraint_name = row[0]
                        print(f"Removendo restrição de unicidade: {constraint_name}")
                        db.session.execute(text(f"ALTER TABLE vehicle DROP CONSTRAINT IF EXISTS {constraint_name}"))
                    
                    db.session.commit()
                    print("Restrições de unicidade da coluna 'vin' removidas com sucesso.")
                else:
                    print("Nenhuma restrição de unicidade encontrada para a coluna 'vin'.")
                    
                # Verificar se existem índices únicos para a coluna 'vin'
                result = db.session.execute(text("""
                    SELECT indexname 
                    FROM pg_indexes 
                    WHERE tablename = 'vehicle' 
                    AND indexname LIKE '%vin%'
                """)).fetchall()
                
                if result:
                    for row in result:
                        index_name = row[0]
                        print(f"Removendo índice: {index_name}")
                        db.session.execute(text(f"DROP INDEX IF EXISTS {index_name}"))
                    
                    db.session.commit()
                    print("Índices da coluna 'vin' removidos com sucesso.")
                else:
                    print("Nenhum índice encontrado para a coluna 'vin'.")
                    
            else:
                print("Este script só funciona com PostgreSQL. Nenhuma alteração foi feita.")
                
        except Exception as e:
            print(f"Erro ao atualizar a coluna 'vin': {str(e)}")
            db.session.rollback()

if __name__ == "__main__":
    update_vehicle_vin_column()