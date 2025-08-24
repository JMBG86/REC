import os
import sys

# Adicionar o diretório raiz ao path para importar os módulos corretamente
root_path = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, root_path)

# Configurar o ambiente antes de importar a aplicação
os.environ.setdefault('PYTHONPATH', root_path)

# Carregar variáveis de ambiente do arquivo .env se existir
from dotenv import load_dotenv
load_dotenv()

# Importar o app diretamente de src.main
from src.main import app

# Iniciar o servidor com Waitress
if __name__ == '__main__':
    from waitress import serve
    print("✅ DATABASE_URL carregado com sucesso\n")
    print("Iniciando o servidor Waitress...")
    serve(app, host='127.0.0.1', port=5000, threads=4)