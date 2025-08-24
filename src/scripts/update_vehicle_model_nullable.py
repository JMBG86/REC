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

def update_vehicle_model_column():
    """Atualiza a coluna 'modelo' da tabela 'vehicle' para permitir valores nulos"""
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
            # Verificar se a coluna existe e seu estado atual
            result = db.session.execute(text("""SELECT column_name, is_nullable 
                                           FROM information_schema.columns 
                                           WHERE table_name = 'vehicle' AND column_name = 'modelo'""")).fetchone()
            
            if result:
                column_name, is_nullable = result
                print(f"Coluna 'modelo' encontrada. Estado atual: nullable={is_nullable}")
                
                if is_nullable == 'NO':
                    # Alterar a coluna para aceitar valores nulos
                    db.session.execute(text("ALTER TABLE vehicle ALTER COLUMN modelo DROP NOT NULL"))
                    db.session.commit()
                    print("Coluna 'modelo' alterada para aceitar valores nulos com sucesso!")
                else:
                    print("A coluna 'modelo' já aceita valores nulos. Nenhuma alteração necessária.")
            else:
                print("Coluna 'modelo' não encontrada na tabela 'vehicle'.")
                
        except Exception as e:
            print(f"Erro ao atualizar a coluna 'modelo': {str(e)}")
            db.session.rollback()

if __name__ == "__main__":
    update_vehicle_model_column()