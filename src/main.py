import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from dotenv import load_dotenv

# Importar o db primeiro
from src.models.user import db

# Importar o módulo models para garantir que todos os modelos sejam carregados na ordem correta
import src.models
from src.models.test_model import TestModel  # Importando o modelo de teste

# Importar os blueprints após os modelos
from src.routes.user import user_bp
from src.routes.vehicle import vehicle_bp
from src.routes.auth import auth_bp
from src.routes.document import document_bp
from src.routes.email_trigger import email_trigger_bp
from src.routes.admin import admin_bp
from src.routes.test_route import test_bp  # Importando o novo blueprint de teste

# Carregar variáveis de ambiente
load_dotenv()

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'asdf#FGSgvasgf$5$WGT')

# Configurar CORS para permitir requests do frontend com credenciais
cors = CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "http://localhost:5173", "https://rec-frontend.vercel.app", "https://rec-frontend-uha5.onrender.com", "https://rec-frontend.onrender.com", "https://rec-frontend-new.onrender.com"],
        "supports_credentials": True,
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type", "Authorization"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "max_age": 3600
    }
})

# Adicionar um endpoint de saúde para verificar se o servidor está funcionando
@app.route('/api/health', methods=['GET', 'OPTIONS'])
def health_check():
    return jsonify({"status": "ok", "message": "API está funcionando corretamente"})


app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(vehicle_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(document_bp, url_prefix='/api')
app.register_blueprint(email_trigger_bp, url_prefix='/api')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(test_bp)  # Registrando o novo blueprint de teste

# Rota de saúde já definida acima


# Configuração da base de dados
# Usar o DATABASE_URL do .env se disponível, caso contrário usar SQLite como fallback
database_url = os.getenv('DATABASE_URL')
if database_url is None:
    # Fallback para SQLite se DATABASE_URL não estiver definido
    database_url = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
    print("AVISO: Usando SQLite como fallback. Configure DATABASE_URL para usar Neon.tech.")

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_CONTENT_LENGTH', 16 * 1024 * 1024))  # 16MB max file size por padrão

# Inicializar o banco de dados e o sistema de migração
db.init_app(app)
migrate = Migrate(app, db)

# Não criar tabelas automaticamente, usar migrações em vez disso
# with app.app_context():
#     db.create_all()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
