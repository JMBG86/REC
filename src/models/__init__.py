# Este arquivo permite que o Python reconheça este diretório como um pacote

# Importar explicitamente o módulo store_location para garantir que ele seja carregado
try:
    from . import store_location
except ImportError as e:
    print(f"ERRO ao importar store_location no __init__.py: {e}")

# Outros módulos devem importar diretamente o que precisam