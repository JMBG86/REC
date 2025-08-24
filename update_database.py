#!/usr/bin/env python3
"""
Script para atualizar a base de dados com os novos campos do modelo Vehicle
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.main import app
from src.models.user import db
from src.models.vehicle import Vehicle
from sqlalchemy import text

def update_database():
    """Atualizar a base de dados com os novos campos"""
    with app.app_context():
        try:
            # Verificar se as colunas já existem
            inspector = db.inspect(db.engine)
            columns = [col['name'] for col in inspector.get_columns('vehicle')]
            
            new_columns = [
                'nuipc_numero',
                'cliente_nome', 
                'cliente_contacto',
                'cliente_morada',
                'cliente_email',
                'cliente_observacoes'
            ]
            
            # Adicionar colunas que não existem
            for column in new_columns:
                if column not in columns:
                    print(f"Adicionando coluna: {column}")
                    if column == 'nuipc_numero':
                        db.engine.execute(text(f"ALTER TABLE vehicle ADD COLUMN {column} VARCHAR(50)"))
                    elif column in ['cliente_nome', 'cliente_email']:
                        db.engine.execute(text(f"ALTER TABLE vehicle ADD COLUMN {column} VARCHAR(200)"))
                    elif column == 'cliente_contacto':
                        db.engine.execute(text(f"ALTER TABLE vehicle ADD COLUMN {column} VARCHAR(50)"))
                    elif column == 'cliente_morada':
                        db.engine.execute(text(f"ALTER TABLE vehicle ADD COLUMN {column} VARCHAR(500)"))
                    elif column == 'cliente_observacoes':
                        db.engine.execute(text(f"ALTER TABLE vehicle ADD COLUMN {column} TEXT"))
                else:
                    print(f"Coluna {column} já existe")
            
            print("Base de dados atualizada com sucesso!")
            
        except Exception as e:
            print(f"Erro ao atualizar base de dados: {e}")
            # Se falhar, recriar toda a base de dados
            print("Recriando toda a base de dados...")
            db.drop_all()
            db.create_all()
            print("Base de dados recriada com sucesso!")

if __name__ == '__main__':
    update_database()

