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

# Verificar se o módulo car_model.py existe
car_model_path = os.path.join(models_path, 'car_model.py')
if not os.path.exists(car_model_path):
    print(f"ERRO: O arquivo {car_model_path} não foi encontrado!")
    print(f"Arquivos em {models_path}: {os.listdir(models_path) if os.path.exists(models_path) else 'diretório não existe'}")
    print(f"Estrutura de diretórios: {os.listdir(root_path)}")
    print(f"Estrutura de src: {os.listdir(src_path) if os.path.exists(src_path) else 'diretório não existe'}")

# Adicionar diretórios ao sys.path para garantir que os módulos sejam encontrados
for path in [src_path, models_path, routes_path, services_path, scripts_path]:
    if path not in sys.path:
        sys.path.insert(0, path)

# Importar a aplicação após configurar os caminhos
from src.main import app

if __name__ == "__main__":
    app.run()