import os
import sys

# Adicionar o diretório raiz ao path para importar os módulos corretamente
root_path = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, root_path)
sys.path.insert(0, os.path.join(root_path, 'src'))

# Imprimir o sys.path para debug
print("Python sys.path:")
for p in sys.path:
    print(f"  - {p}")

# Tentar importar a aplicação Flask
try:
    print("\nTentando importar app de src.main...")
    from src.main import app
    print("✓ App importado com sucesso!")
    
    # Verificar as rotas registradas
    print("\nRotas registradas:")
    for rule in app.url_map.iter_rules():
        print(f"  - {rule.endpoint}: {rule.rule}")
    
    # Verificar os modelos importados
    print("\nModelos importados:")
    try:
        from src.models.store_location import StoreLocation
        print("  - StoreLocation: OK")
    except ImportError as e:
        print(f"  - StoreLocation: ERRO - {e}")
    
    try:
        from src.models.vehicle import Vehicle
        print("  - Vehicle: OK")
    except ImportError as e:
        print(f"  - Vehicle: ERRO - {e}")
    
    try:
        from src.models.car_model.car_model import CarBrand, CarModel
        print("  - CarBrand/CarModel: OK")
    except ImportError as e:
        print(f"  - CarBrand/CarModel: ERRO - {e}")
    
except ImportError as e:
    print(f"✗ ERRO ao importar app: {e}")

print("\nTeste da aplicação concluído!")