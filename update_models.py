import os
import sys

# Adicionar o diretório atual ao path do Python
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.main import app, db
from src.models.car_model import CarBrand, CarModel
# Usar importação absoluta para evitar problemas no Render
from src.models.store_location import StoreLocation
from src.models.rent_a_car import RentACar
from src.models.vehicle import Vehicle

# Usar o contexto da aplicação
with app.app_context():
    # Criar as tabelas no banco de dados
    print("Criando/atualizando tabelas no banco de dados...")
    db.create_all()
    print("Tabelas criadas/atualizadas com sucesso!")

    # Verificar se as tabelas foram criadas
    print("\nVerificando tabelas criadas:")
    print(f"CarBrand: {CarBrand.__tablename__}")
    print(f"CarModel: {CarModel.__tablename__}")
    print(f"RentACar: {RentACar.__tablename__}")
    print(f"StoreLocation: {StoreLocation.__tablename__}")
    print(f"Vehicle: {Vehicle.__tablename__}")

print("\nScript concluído com sucesso!")