import os
import sys
import importlib.util

# Adicionar o diretório raiz ao path para importar os módulos corretamente
root_path = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, root_path)

# Garantir que os diretórios de módulos sejam reconhecidos como pacotes
src_path = os.path.join(root_path, 'src')
models_path = os.path.join(src_path, 'models')
routes_path = os.path.join(src_path, 'routes')
services_path = os.path.join(src_path, 'services')
scripts_path = os.path.join(src_path, 'scripts')

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

# Adicionar diretórios ao sys.path para garantir que os módulos sejam encontrados
car_model_dir = os.path.join(models_path, 'car_model')
for path in [src_path, models_path, routes_path, services_path, scripts_path, car_model_dir]:
    if os.path.exists(path) and path not in sys.path:
        sys.path.insert(0, path)

# Importar a aplicação após configurar os caminhos
from src.main import app

if __name__ == "__main__":
    app.run()