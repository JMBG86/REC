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

# Verificar se DATABASE_URL foi carregado
if 'DATABASE_URL' in os.environ:
    print("✅ DATABASE_URL carregado com sucesso")
else:
    print("❌ DATABASE_URL não foi carregado")

# Importar o app diretamente de src.main
from src.main import app

# Iniciar o servidor Flask em modo de desenvolvimento com hot-reloading
if __name__ == '__main__':
    print("\nIniciando o servidor Flask em modo de desenvolvimento...")
    app.run(debug=True, use_reloader=True, host='127.0.0.1', port=5000)