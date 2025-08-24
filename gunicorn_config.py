# Configuração do Gunicorn para o Render.com

import os
import sys

# Adicionar o diretório raiz ao path para importar os módulos corretamente
root_path = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, root_path)
sys.path.insert(0, os.path.join(root_path, 'src'))

# Imprimir o sys.path para debug
print("Python sys.path:")
for p in sys.path:
    print(f"  - {p}")

# Número de workers - recomendado (2 x núcleos) + 1
workers = int(os.getenv('WEB_CONCURRENCY', 4))

# Threads por worker
threads = int(os.getenv('PYTHON_THREADS', 1))

# Timeout em segundos
timeout = 120

# Bind na porta fornecida pelo Render ou 5000 como fallback
bind = f"0.0.0.0:{os.getenv('PORT', '5000')}"

# Configurações de log
accesslog = '-'
errorlog = '-'

# Preload app para melhor performance
preload_app = True

# Worker class
worker_class = 'sync'