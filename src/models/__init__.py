# Este arquivo permite que o Python reconheça este diretório como um pacote

# Garantir que os módulos sejam carregados na ordem correta para evitar problemas de importação circular
# Primeiro importamos o módulo user que contém a definição do db
from . import user

# Em seguida, importamos os outros módulos que dependem do db
try:
    # Importar explicitamente os módulos na ordem correta
    from . import rent_a_car
    from . import store_location
    from . import car_model
    from . import vehicle
except ImportError as e:
    print(f"ERRO ao importar módulos no __init__.py: {e}")

# Outros módulos devem importar diretamente o que precisam