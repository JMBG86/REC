import os
import sys

# Adicionar o diretório raiz ao path para importar os módulos corretamente
root_path = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, root_path)

# Configurar o ambiente antes de importar a aplicação
os.environ.setdefault('PYTHONPATH', root_path)

# Importar o app diretamente de src.main
from src.main import app

# Arquivo wsgi.py simplificado para o Render
if __name__ == '__main__':
    app.run()