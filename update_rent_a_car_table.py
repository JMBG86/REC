#!/usr/bin/env python3
"""
Script para atualizar a tabela rent_a_car com os campos definidos no modelo
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.main import app
from src.models.user import db
from src.models.rent_a_car import RentACar
from sqlalchemy import text

def update_rent_a_car_table():
    """Atualizar a tabela rent_a_car com os campos definidos no modelo"""
    with app.app_context():
        try:
            # Verificar se as colunas já existem
            inspector = db.inspect(db.engine)
            columns = [col['name'] for col in inspector.get_columns('rent_a_car')]
            
            # Definir as colunas que devem existir na tabela rent_a_car
            expected_columns = [
                'nome',
                'contacto_email',
                'contacto_telefone',
                'endereco',
                'cidade',
                'codigo_postal',
                'pais',
                'nif',
                'website',
                'logo_url',
                'descricao',
                'is_active',
                'created_at',
                'updated_at'
            ]
            
            # Adicionar colunas que não existem
            with db.engine.connect() as conn:
                for column in expected_columns:
                    if column not in columns:
                        print(f"Adicionando coluna: {column}")
                        if column in ['nome', 'cidade', 'pais', 'nif']:
                            conn.execute(text(f"ALTER TABLE rent_a_car ADD COLUMN {column} VARCHAR(100)"))
                        elif column in ['contacto_email', 'website']:
                            conn.execute(text(f"ALTER TABLE rent_a_car ADD COLUMN {column} VARCHAR(200)"))
                        elif column in ['contacto_telefone', 'codigo_postal']:
                            conn.execute(text(f"ALTER TABLE rent_a_car ADD COLUMN {column} VARCHAR(20)"))
                        elif column == 'endereco':
                            conn.execute(text(f"ALTER TABLE rent_a_car ADD COLUMN {column} VARCHAR(200)"))
                        elif column == 'logo_url':
                            conn.execute(text(f"ALTER TABLE rent_a_car ADD COLUMN {column} VARCHAR(500)"))
                        elif column == 'descricao':
                            conn.execute(text(f"ALTER TABLE rent_a_car ADD COLUMN {column} TEXT"))
                        elif column == 'is_active':
                            conn.execute(text(f"ALTER TABLE rent_a_car ADD COLUMN {column} BOOLEAN DEFAULT TRUE"))
                        elif column in ['created_at', 'updated_at']:
                            conn.execute(text(f"ALTER TABLE rent_a_car ADD COLUMN {column} TIMESTAMP DEFAULT CURRENT_TIMESTAMP"))
                else:
                    print(f"Coluna {column} já existe")
            
            print("Tabela rent_a_car atualizada com sucesso!")
            
        except Exception as e:
            print(f"Erro ao atualizar a tabela rent_a_car: {e}")
            raise

if __name__ == "__main__":
    update_rent_a_car_table()