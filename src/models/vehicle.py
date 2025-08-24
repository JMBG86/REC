from src.models.user import db
from datetime import datetime
from src.models.car_model import CarBrand, CarModel
from src.models.store_location import StoreLocation

class Vehicle(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    matricula = db.Column(db.String(20), unique=True, nullable=False, index=True)
    marca = db.Column(db.String(50), nullable=False)
    modelo = db.Column(db.String(100), nullable=True)
    # Comentando as colunas que não existem no banco de dados
    # car_brand_id = db.Column(db.Integer, db.ForeignKey('car_brand.id'), nullable=True)
    # car_model_id = db.Column(db.Integer, db.ForeignKey('car_model.id'), nullable=True)
    vin = db.Column(db.String(17), nullable=True)
    valor = db.Column(db.Numeric(10, 2), nullable=True)
    nuipc = db.Column(db.Boolean, default=False)  # Queixa na polícia
    nuipc_numero = db.Column(db.String(50), nullable=True)  # Número da queixa NUIPC
    gps_ativo = db.Column(db.Boolean, default=False)  # Pedido de GPS ativo
    status = db.Column(db.String(50), nullable=False, default='em_tratamento')  # em_tratamento, submetido, recuperado, perdido
    data_submissao = db.Column(db.DateTime, default=datetime.utcnow)
    data_recuperacao = db.Column(db.DateTime, nullable=True)
    data_desaparecimento = db.Column(db.DateTime, nullable=True)
    loja_aluguer = db.Column(db.String(100), nullable=True)  # Loja onde foi alugado (campo legado)
    # store_location_id = db.Column(db.Integer, db.ForeignKey('store_location.id'), nullable=True)  # Nova referência à localização da loja
    observacoes = db.Column(db.Text, nullable=True)
    
    # Informações do cliente
    cliente_nome = db.Column(db.String(200), nullable=True)  # Nome de quem alugou
    cliente_contacto = db.Column(db.String(50), nullable=True)  # Contacto do cliente
    cliente_morada = db.Column(db.String(500), nullable=True)  # Morada do cliente
    cliente_email = db.Column(db.String(200), nullable=True)  # Email do cliente
    cliente_observacoes = db.Column(db.Text, nullable=True)  # Observações sobre o cliente
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    atualizacoes = db.relationship('VehicleUpdate', backref='vehicle', lazy=True, cascade='all, delete-orphan')
    documentos = db.relationship('Document', backref='vehicle', lazy=True, cascade='all, delete-orphan')
    # Comentando os relacionamentos que dependem das colunas que não existem
    # car_brand = db.relationship('CarBrand', backref=db.backref('vehicles', lazy=True))
    # car_model = db.relationship('CarModel', backref=db.backref('vehicles', lazy=True))
    # store_location = db.relationship('StoreLocation', backref=db.backref('vehicles', lazy=True))

    def __repr__(self):
        return f'<Vehicle {self.matricula}>'

    def to_dict(self):
        return {
            'id': self.id,
            'matricula': self.matricula,
            'marca': self.marca,
            'modelo': self.modelo,
            # Removendo referências às colunas que não existem
            # 'car_brand_id': self.car_brand_id,
            # 'car_model_id': self.car_model_id,
            # 'car_brand_name': CarBrand.query.get(self.car_brand_id).name if self.car_brand_id else None,
            # 'car_model_name': CarModel.query.get(self.car_model_id).name if self.car_model_id else None,
            # 'store_location_id': self.store_location_id,
            # 'store_location_name': StoreLocation.query.get(self.store_location_id).nome if self.store_location_id else None,
            'vin': self.vin,
            'valor': float(self.valor) if self.valor else None,
            'nuipc': self.nuipc,
            'nuipc_numero': self.nuipc_numero,
            'gps_ativo': self.gps_ativo,
            'status': self.status,
            'data_submissao': self.data_submissao.isoformat() if self.data_submissao else None,
            'data_recuperacao': self.data_recuperacao.isoformat() if self.data_recuperacao else None,
            'data_desaparecimento': self.data_desaparecimento.isoformat() if self.data_desaparecimento else None,
            'loja_aluguer': self.loja_aluguer,
            'observacoes': self.observacoes,
            'cliente_nome': self.cliente_nome,
            'cliente_contacto': self.cliente_contacto,
            'cliente_morada': self.cliente_morada,
            'cliente_email': self.cliente_email,
            'cliente_observacoes': self.cliente_observacoes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class VehicleUpdate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicle.id'), nullable=False)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow)
    descricao = db.Column(db.Text, nullable=False)
    tipo = db.Column(db.String(50), nullable=False)  # localizacao, acao, observacao, etc.
    localizacao = db.Column(db.String(200), nullable=True)  # Para atualizações de localização
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)

    def __repr__(self):
        return f'<VehicleUpdate {self.id} - {self.tipo}>'

    def to_dict(self):
        return {
            'id': self.id,
            'vehicle_id': self.vehicle_id,
            'data_atualizacao': self.data_atualizacao.isoformat() if self.data_atualizacao else None,
            'descricao': self.descricao,
            'tipo': self.tipo,
            'localizacao': self.localizacao,
            'created_by': self.created_by
        }

class Document(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicle.id'), nullable=False)
    nome_ficheiro = db.Column(db.String(255), nullable=False)
    nome_original = db.Column(db.String(255), nullable=False)
    tipo_documento = db.Column(db.String(50), nullable=False)  # contrato, queixa, relatorio, etc.
    caminho_ficheiro = db.Column(db.String(500), nullable=False)
    tamanho_ficheiro = db.Column(db.Integer, nullable=True)
    data_upload = db.Column(db.DateTime, default=datetime.utcnow)
    uploaded_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    origem = db.Column(db.String(50), default='manual')  # manual, email_automatico

    def __repr__(self):
        return f'<Document {self.nome_ficheiro}>'

    def to_dict(self):
        return {
            'id': self.id,
            'vehicle_id': self.vehicle_id,
            'nome_ficheiro': self.nome_ficheiro,
            'nome_original': self.nome_original,
            'tipo_documento': self.tipo_documento,
            'caminho_ficheiro': self.caminho_ficheiro,
            'tamanho_ficheiro': self.tamanho_ficheiro,
            'data_upload': self.data_upload.isoformat() if self.data_upload else None,
            'uploaded_by': self.uploaded_by,
            'origem': self.origem
        }

