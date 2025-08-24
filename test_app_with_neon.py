import os
import sys
import requests
import json
from dotenv import load_dotenv
from flask import Flask
from sqlalchemy import create_engine, text

# Adicionar o diretório raiz ao path para importar os módulos
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Carregar variáveis de ambiente
load_dotenv()

# Importar os modelos e configurações necessárias
from src.models.user import db, User
from src.models.vehicle import Vehicle
from src.models.rent_a_car import RentACar

# Criar uma aplicação Flask de teste
app = Flask(__name__)

# Configurar o banco de dados
database_url = os.getenv('DATABASE_URL')
if not database_url:
    print("Erro: A variável de ambiente DATABASE_URL não está definida.")
    sys.exit(1)

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inicializar o banco de dados
db.init_app(app)

def test_database_models():
    """Testa os modelos do banco de dados"""
    print("\n=== Testando modelos do banco de dados ===")
    
    with app.app_context():
        # Testar modelo User
        try:
            users_count = User.query.count()
            print(f"✅ Modelo User: {users_count} registros encontrados")
        except Exception as e:
            print(f"❌ Erro ao acessar modelo User: {str(e)}")
        
        # Testar modelo Vehicle
        try:
            vehicles_count = Vehicle.query.count()
            print(f"✅ Modelo Vehicle: {vehicles_count} registros encontrados")
            
            # Se houver veículos, mostrar alguns detalhes do primeiro
            if vehicles_count > 0:
                vehicle = Vehicle.query.first()
                print(f"   Exemplo de veículo: {vehicle.marca} {vehicle.modelo} (Matrícula: {vehicle.matricula})")
        except Exception as e:
            print(f"❌ Erro ao acessar modelo Vehicle: {str(e)}")
        
        # Testar modelo RentACar
        try:
            rent_a_cars_count = RentACar.query.count()
            print(f"✅ Modelo RentACar: {rent_a_cars_count} registros encontrados")
        except Exception as e:
            print(f"❌ Erro ao acessar modelo RentACar: {str(e)}")

def test_api_endpoints():
    """Testa os endpoints da API com a aplicação em execução"""
    print("\n=== Testando endpoints da API ===")
    print("Nota: Este teste requer que a aplicação esteja em execução em http://localhost:5000")
    
    base_url = "http://localhost:5000/api"
    
    # Testar endpoint de login
    try:
        response = requests.post(
            f"{base_url}/auth/login", 
            json={"username": "admin", "password": "admin"}
        )
        
        if response.status_code == 200:
            token = response.json().get('token')
            print(f"✅ Endpoint de login: Funcionando corretamente (status {response.status_code})")
            
            # Se o login for bem-sucedido, testar outros endpoints
            headers = {"Authorization": f"Bearer {token}"}
            
            # Testar endpoint de veículos
            vehicles_response = requests.get(f"{base_url}/vehicles", headers=headers)
            if vehicles_response.status_code == 200:
                vehicles = vehicles_response.json()
                print(f"✅ Endpoint de veículos: Funcionando corretamente ({len(vehicles)} veículos retornados)")
            else:
                print(f"❌ Endpoint de veículos: Erro (status {vehicles_response.status_code})")
                
            # Testar endpoint de usuários
            users_response = requests.get(f"{base_url}/users", headers=headers)
            if users_response.status_code == 200:
                users = users_response.json()
                print(f"✅ Endpoint de usuários: Funcionando corretamente ({len(users)} usuários retornados)")
            else:
                print(f"❌ Endpoint de usuários: Erro (status {users_response.status_code})")
        else:
            print(f"❌ Endpoint de login: Erro (status {response.status_code})")
            print(f"   Resposta: {response.text}")
    except requests.exceptions.ConnectionError:
        print("❌ Não foi possível conectar à API. Certifique-se de que a aplicação está em execução.")
    except Exception as e:
        print(f"❌ Erro ao testar endpoints da API: {str(e)}")

def main():
    print("=== Teste da Aplicação com Banco de Dados Neon.tech ===")
    
    # Testar modelos do banco de dados
    test_database_models()
    
    # Perguntar se o usuário deseja testar os endpoints da API
    test_api = input("\nDeseja testar os endpoints da API? (s/n): ")
    if test_api.lower() == 's':
        test_api_endpoints()
    
    print("\n=== Teste concluído ===")

if __name__ == "__main__":
    main()