import os
import sys

# Adicionar o diretório raiz ao path para importar os módulos corretamente
root_path = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, root_path)

# Garantir que os diretórios de módulos sejam reconhecidos como pacotes
src_path = os.path.join(root_path, 'src')
models_path = os.path.join(src_path, 'models')
routes_path = os.path.join(src_path, 'routes')
services_path = os.path.join(src_path, 'services')
scripts_path = os.path.join(src_path, 'scripts')

# Importar a aplicação após configurar os caminhos
from src.main import app

if __name__ == "__main__":
    app.run()