import os
import sys

# Adicionar o diretório raiz ao path para importar os módulos corretamente
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.main import app

if __name__ == "__main__":
    app.run()