# Configuração simples do Gunicorn para o Render.com

import os
import sys

# Adicionar o diretório raiz ao path para importar os módulos corretamente
root_path = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, root_path)

# Configurações básicas
workers = 4
threads = 2
timeout = 120
bind = f"0.0.0.0:{os.getenv('PORT', '5000')}"

# Configurações de log
accesslog = '-'
errorlog = '-'

# Outras configurações
worker_class = 'sync'
preload_app = False