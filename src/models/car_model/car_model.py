# Usar importação absoluta para garantir que o módulo seja encontrado
from src.models.user import db
from datetime import datetime

class CarBrand(db.Model):
    """Modelo para gerenciar marcas de carros"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamento com modelos de carros
    car_models = db.relationship('CarModel', backref='brand', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<CarBrand {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class CarModel(db.Model):
    """Modelo para gerenciar modelos de carros"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    brand_id = db.Column(db.Integer, db.ForeignKey('car_brand.id'), nullable=False)
    description = db.Column(db.Text, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<CarModel {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'brand_id': self.brand_id,
            'brand_name': self.brand.name if self.brand else None,
            'description': self.description,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }