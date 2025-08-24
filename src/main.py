import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from dotenv import load_dotenv
from src.models.user import db
from src.routes.user import user_bp
from src.routes.vehicle import vehicle_bp
from src.routes.auth import auth_bp
from src.routes.document import document_bp
from src.routes.email_trigger import email_trigger_bp
from src.routes.admin import admin_bp

# Importar todos os modelos para que sejam criadas as tabelas
from src.models.vehicle import Vehicle, VehicleUpdate, Document
from src.models.rent_a_car import RentACar, EmailTrigger
from src.models.car_model.car_model import CarBrand, CarModel
from src.models.store_location import StoreLocation

# Carregar variáveis de ambiente
load_dotenv()

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'asdf#FGSgvasgf$5$WGT')

# Configurar CORS para permitir requests do frontend
CORS(app, origins="*")

app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(vehicle_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(document_bp, url_prefix='/api')
app.register_blueprint(email_trigger_bp, url_prefix='/api')
app.register_blueprint(admin_bp, url_prefix='/api/admin')

@app.route('/api/health')
def health_check():
    return jsonify({'status': 'ok', 'message': 'API is running'})


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
