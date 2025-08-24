#!/usr/bin/env python3
import sys
import os

# Adicionar o diretório do projeto ao path
sys.path.insert(0, os.path.dirname(__file__))

from src.models.user import db, User
from src.main import app

def create_admin_user():
    with app.app_context():
        # Verificar se já existe um utilizador admin
        existing_admin = User.query.filter_by(username='admin').first()
        if existing_admin:
            print("Utilizador admin já existe!")
            return
        
        # Criar utilizador admin
        admin = User(
            username='admin',
            email='admin@test.com',
            role='admin'
        )
        admin.set_password('admin123')
        
        db.session.add(admin)
        db.session.commit()
        
        print("Utilizador admin criado com sucesso!")
        print("Username: admin")
        print("Password: admin123")

if __name__ == '__main__':
    create_admin_user()

