import os
import sys
import subprocess
from dotenv import load_dotenv

# Carregar variáveis de ambiente do arquivo .env
load_dotenv()

# Verificar se DATABASE_URL foi carregado
if 'DATABASE_URL' in os.environ:
    print("✅ DATABASE_URL carregado com sucesso")
else:
    print("❌ DATABASE_URL não foi carregado")
    print("Verificando arquivo .env...")
    try:
        with open('.env', 'r') as f:
            print("Conteúdo do arquivo .env:")
            print(f.read())
    except Exception as e:
        print(f"Erro ao ler arquivo .env: {e}")

# Executar o servidor Flask
print("\nIniciando o servidor Flask...")
subprocess.run([sys.executable, "wsgi.py"])