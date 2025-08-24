import os
import sys

# Adicionar o diretório raiz ao path para importar os módulos corretamente
root_path = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, root_path)

# Imprimir o sys.path para debug
print("Python sys.path:")
for p in sys.path:
    print(f"  - {p}")

# Tentar importar os módulos problemáticos
try:
    print("\nTentando importar src.models.store_location...")
    from src.models.store_location import StoreLocation
    print("✓ Módulo store_location importado com sucesso!")
except ImportError as e:
    print(f"✗ ERRO ao importar store_location: {e}")

try:
    print("\nTentando importar src.models.car_model.car_model...")
    from src.models.car_model.car_model import CarBrand, CarModel
    print("✓ Módulo car_model importado com sucesso!")
except ImportError as e:
    print(f"✗ ERRO ao importar car_model: {e}")

try:
    print("\nTentando importar src.models.vehicle...")
    from src.models.vehicle import Vehicle
    print("✓ Módulo vehicle importado com sucesso!")
except ImportError as e:
    print(f"✗ ERRO ao importar vehicle: {e}")

try:
    print("\nTentando importar src.main...")
    from src.main import app
    print("✓ Módulo main importado com sucesso!")
except ImportError as e:
    print(f"✗ ERRO ao importar main: {e}")

print("\nTeste de importações concluído!")