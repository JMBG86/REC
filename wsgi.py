import os
import sys
import importlib.util

# Adicionar o diretório raiz ao path para importar os módulos corretamente
root_path = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, root_path)

# Imprimir o sys.path para debug
print("Python sys.path:")
for p in sys.path:
    print(f"  - {p}")

# Garantir que os diretórios de módulos sejam reconhecidos como pacotes
src_path = os.path.join(root_path, 'src')
models_path = os.path.join(src_path, 'models')
routes_path = os.path.join(src_path, 'routes')
services_path = os.path.join(src_path, 'services')
scripts_path = os.path.join(src_path, 'scripts')

# Adicionar diretórios ao sys.path para garantir que os módulos sejam encontrados
for path in [src_path, models_path, routes_path, services_path, scripts_path]:
    if os.path.exists(path) and path not in sys.path:
        sys.path.insert(0, path)

# Verificar se os diretórios existem e criar arquivos __init__.py se necessário
for path in [src_path, models_path, routes_path, services_path, scripts_path]:
    if not os.path.exists(path):
        os.makedirs(path)
    init_file = os.path.join(path, '__init__.py')
    if not os.path.exists(init_file):
        with open(init_file, 'w') as f:
            f.write('# Este arquivo permite que o Python reconheça este diretório como um pacote\n')

# Verificar se o módulo car_model existe como diretório
car_model_dir = os.path.join(models_path, 'car_model')
if not os.path.exists(car_model_dir):
    print(f"ERRO: O diretório {car_model_dir} não foi encontrado!")
    print(f"Arquivos em {models_path}: {os.listdir(models_path) if os.path.exists(models_path) else 'diretório não existe'}")
    print(f"Estrutura de diretórios: {os.listdir(root_path)}")
    print(f"Estrutura de src: {os.listdir(src_path) if os.path.exists(src_path) else 'diretório não existe'}")
else:
    # Verificar se os arquivos necessários existem no diretório car_model
    car_model_init = os.path.join(car_model_dir, '__init__.py')
    car_model_file = os.path.join(car_model_dir, 'car_model.py')
    if not os.path.exists(car_model_init) or not os.path.exists(car_model_file):
        print(f"ERRO: Arquivos necessários não encontrados em {car_model_dir}!")
        print(f"Arquivos em {car_model_dir}: {os.listdir(car_model_dir)}")

# Verificar se o módulo store_location.py existe
store_location_file = os.path.join(models_path, 'store_location.py')
if not os.path.exists(store_location_file):
    print(f"ERRO: O arquivo {store_location_file} não foi encontrado!")
    print(f"Arquivos em {models_path}: {os.listdir(models_path) if os.path.exists(models_path) else 'diretório não existe'}")

# Adicionar car_model_dir ao sys.path
car_model_dir = os.path.join(models_path, 'car_model')
if os.path.exists(car_model_dir) and car_model_dir not in sys.path:
    sys.path.insert(0, car_model_dir)

# Importar a aplicação Flask
try:
    print("Tentando importar app de src.main...")
    from src.main import app
    print("✓ App importado com sucesso!")
except ImportError as e:
    print(f"✗ ERRO ao importar app: {e}")
    # Tentar importação alternativa
    try:
        print("Tentando importação alternativa...")
        spec = importlib.util.spec_from_file_location("main", os.path.join(src_path, "main.py"))
        main = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(main)
        app = main.app
        print("✓ App importado com sucesso via importlib!")
    except Exception as e:
        print(f"✗ ERRO na importação alternativa: {e}")
        raise

# Imprimir o sys.path para debug
print("Python sys.path:")
for p in sys.path:
    print(f"  - {p}")

# Tentar importar o módulo store_location para verificar se está acessível
try:
    from src.models.store_location import StoreLocation
    print("Módulo store_location importado com sucesso!")
except ImportError as e:
    print(f"ERRO ao importar store_location: {e}")
    # Tentar importação alternativa
    try:
        import importlib.util
        spec = importlib.util.spec_from_file_location("store_location", store_location_file)
        if spec:
            store_location = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(store_location)
            print("Módulo store_location carregado manualmente com sucesso!")
            # Adicionar ao sys.modules para futuras importações
            sys.modules["src.models.store_location"] = store_location
    except Exception as e2:
        print(f"ERRO na importação alternativa: {e2}")


# Importar a aplicação após configurar os caminhos
from src.main import app

if __name__ == "__main__":
    app.run()