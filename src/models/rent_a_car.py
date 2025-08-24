from src.models.user import db
from datetime import datetime

class RentACar(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    contacto_email = db.Column(db.String(120), nullable=True)
    contacto_telefone = db.Column(db.String(20), nullable=True)
    endereco = db.Column(db.String(200), nullable=True)
    nif = db.Column(db.String(20), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamento com utilizadores (um rent-a-car pode ter vários utilizadores)
    users = db.relationship('User', backref='rent_a_car', lazy=True)

    def __repr__(self):
        return f'<RentACar {self.nome}>'

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'contacto_email': self.contacto_email,
            'contacto_telefone': self.contacto_telefone,
            'endereco': self.endereco,
            'nif': self.nif,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class EmailTrigger(db.Model):
    """Modelo para registar emails recebidos e processados automaticamente"""
    id = db.Column(db.Integer, primary_key=True)
    email_from = db.Column(db.String(120), nullable=False)
    email_subject = db.Column(db.String(200), nullable=True)
    email_body = db.Column(db.Text, nullable=True)
    processed = db.Column(db.Boolean, default=False)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicle.id'), nullable=True)
    extracted_data = db.Column(db.JSON, nullable=True)  # Dados extraídos do email
    received_at = db.Column(db.DateTime, default=datetime.utcnow)
    processed_at = db.Column(db.DateTime, nullable=True)
    error_message = db.Column(db.Text, nullable=True)

    def __repr__(self):
        return f'<EmailTrigger {self.email_from} - {self.email_subject}>'

    def to_dict(self):
        return {
            'id': self.id,
            'email_from': self.email_from,
            'email_subject': self.email_subject,
            'email_body': self.email_body,
            'processed': self.processed,
            'vehicle_id': self.vehicle_id,
            'extracted_data': self.extracted_data,
            'received_at': self.received_at.isoformat() if self.received_at else None,
            'processed_at': self.processed_at.isoformat() if self.processed_at else None,
            'error_message': self.error_message
        }

