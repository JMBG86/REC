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

def fix_vehicle_vin_constraint():
    """Corrige a restrição de unicidade da coluna 'vin' na tabela 'vehicle' para permitir múltiplos valores vazios"""
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
                # Remover a restrição de unicidade existente
                db.session.execute(text("ALTER TABLE vehicle DROP CONSTRAINT IF EXISTS vehicle_vin_key"))
                
                # Adicionar uma nova restrição de unicidade que ignora valores vazios
                db.session.execute(text("CREATE UNIQUE INDEX vehicle_vin_unique_idx ON vehicle (vin) WHERE vin IS NOT NULL AND vin != ''"))
                
                db.session.commit()
                print("Restrição de unicidade da coluna 'vin' modificada com sucesso para permitir múltiplos valores vazios.")
            else:
                print("Este script só funciona com PostgreSQL. Nenhuma alteração foi feita.")
                
        except Exception as e:
            print(f"Erro ao modificar a restrição de unicidade: {str(e)}")
            db.session.rollback()

if __name__ == "__main__":
    fix_vehicle_vin_constraint()