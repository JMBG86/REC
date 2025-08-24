#!/usr/bin/env python3
"""
Script para adicionar colunas faltantes na tabela rent_a_car
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.main import app, db
from sqlalchemy import text

def add_columns_to_rent_a_car():
    """Adicionar colunas faltantes na tabela rent_a_car"""
    with app.app_context():
        try:
            with db.engine.connect() as conn:
                # Adicionar colunas faltantes
                print("Adicionando colunas faltantes na tabela rent_a_car...")
                
                # Adicionar coluna cidade
                conn.execute(text("ALTER TABLE rent_a_car ADD COLUMN IF NOT EXISTS cidade VARCHAR(100)"))
                print("Coluna cidade adicionada")
                
                # Adicionar coluna codigo_postal
                conn.execute(text("ALTER TABLE rent_a_car ADD COLUMN IF NOT EXISTS codigo_postal VARCHAR(20)"))
                print("Coluna codigo_postal adicionada")
                
                # Adicionar coluna pais
                conn.execute(text("ALTER TABLE rent_a_car ADD COLUMN IF NOT EXISTS pais VARCHAR(50) DEFAULT 'Portugal'"))
                print("Coluna pais adicionada")
                
                # Adicionar coluna website
                conn.execute(text("ALTER TABLE rent_a_car ADD COLUMN IF NOT EXISTS website VARCHAR(200)"))
                print("Coluna website adicionada")
                
                # Adicionar coluna logo_url
                conn.execute(text("ALTER TABLE rent_a_car ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500)"))
                print("Coluna logo_url adicionada")
                
                # Adicionar coluna descricao
                conn.execute(text("ALTER TABLE rent_a_car ADD COLUMN IF NOT EXISTS descricao TEXT"))
                print("Coluna descricao adicionada")
                
                # Commit das alterações
                conn.commit()
                
                print("Colunas adicionadas com sucesso!")
                
        except Exception as e:
            print(f"Erro ao adicionar colunas: {e}")
            raise

if __name__ == "__main__":
    add_columns_to_rent_a_car()