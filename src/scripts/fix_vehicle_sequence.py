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

def fix_vehicle_sequence():
    """Corrige a sequência de IDs da tabela 'vehicle' para evitar conflitos de chave primária"""
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
                # Obter o maior ID atual da tabela vehicle
                result = db.session.execute(text("SELECT MAX(id) FROM vehicle")).fetchone()
                max_id = result[0] if result[0] is not None else 0
                
                print(f"Maior ID encontrado na tabela vehicle: {max_id}")
                
                # Resetar a sequência para o próximo valor após o maior ID
                next_id = max_id + 1
                db.session.execute(text(f"ALTER SEQUENCE vehicle_id_seq RESTART WITH {next_id}"))
                db.session.commit()
                
                print(f"Sequência de IDs da tabela vehicle redefinida para começar em {next_id}")
            else:
                print("Este script só funciona com PostgreSQL. Nenhuma alteração foi feita.")
                
        except Exception as e:
            print(f"Erro ao corrigir a sequência: {str(e)}")
            db.session.rollback()

if __name__ == "__main__":
    fix_vehicle_sequence()