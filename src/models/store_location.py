# Usar importação absoluta para garantir que o módulo seja encontrado
from src.models.user import db
from datetime import datetime

class StoreLocation(db.Model):
    """Modelo para gerenciar localizações de lojas de aluguel de carros"""
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    rent_a_car_id = db.Column(db.Integer, db.ForeignKey('rent_a_car.id'), nullable=False)
    endereco = db.Column(db.String(200), nullable=True)
    cidade = db.Column(db.String(100), nullable=True)
    codigo_postal = db.Column(db.String(20), nullable=True)
    pais = db.Column(db.String(50), nullable=True, default='Portugal')
    contacto_telefone = db.Column(db.String(20), nullable=True)
    contacto_email = db.Column(db.String(120), nullable=True)
    horario_funcionamento = db.Column(db.String(200), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamento com a empresa de aluguel
    rent_a_car = db.relationship('RentACar', backref=db.backref('locations', lazy=True))
    
    def __repr__(self):
        return f'<StoreLocation {self.nome} - {self.rent_a_car.nome if self.rent_a_car else "N/A"}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'rent_a_car_id': self.rent_a_car_id,
            'rent_a_car_nome': self.rent_a_car.nome if self.rent_a_car else None,
            'endereco': self.endereco,
            'cidade': self.cidade,
            'codigo_postal': self.codigo_postal,
            'pais': self.pais,
            'contacto_telefone': self.contacto_telefone,
            'contacto_email': self.contacto_email,
            'horario_funcionamento': self.horario_funcionamento,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }