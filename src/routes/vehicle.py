from flask import Blueprint, jsonify, request, send_file
from src.models.user import db
from src.models.vehicle import Vehicle, VehicleUpdate, Document
# Importar diretamente do pacote models
from src.models import CarBrand, CarModel
from src.models.store_location import StoreLocation
from src.routes.auth import token_required
from datetime import datetime
import os
import uuid
from werkzeug.utils import secure_filename

vehicle_bp = Blueprint('vehicle', __name__)

@vehicle_bp.route('/vehicles', methods=['GET'])
@token_required
def get_vehicles(current_user):
    """Obter todos os veículos com filtros opcionais"""
    status = request.args.get('status')
    marca = request.args.get('marca')
    loja = request.args.get('loja')
    
    query = Vehicle.query
    
    if status:
        query = query.filter(Vehicle.status == status)
    if marca:
        query = query.filter(Vehicle.marca.ilike(f'%{marca}%'))
    if loja:
        query = query.filter(Vehicle.loja_aluguer.ilike(f'%{loja}%'))
    
    vehicles = query.order_by(Vehicle.created_at.desc()).all()
    return jsonify([vehicle.to_dict() for vehicle in vehicles])

@vehicle_bp.route('/vehicles', methods=['POST'])
@token_required
def create_vehicle(current_user):
    """Criar um novo veículo"""
    data = request.json
    
    # Verificar se a matrícula já existe
    existing_vehicle = Vehicle.query.filter_by(matricula=data['matricula']).first()
    if existing_vehicle:
        return jsonify({'error': 'Veículo com esta matrícula já existe'}), 400
    
    vehicle = Vehicle(
        matricula=data['matricula'],
        marca=data['marca'],
        modelo=data['modelo'],
        # Removendo referências às colunas que não existem
        # car_brand_id=data.get('car_brand_id'),
        # car_model_id=data.get('car_model_id'),
        # store_location_id=data.get('store_location_id'),
        vin=data.get('vin'),
        valor=data.get('valor'),
        nuipc=data.get('nuipc', False),
        nuipc_numero=data.get('nuipc_numero'),
        gps_ativo=data.get('gps_ativo', False),
        status=data.get('status', 'em_tratamento'),
        data_desaparecimento=datetime.fromisoformat(data['data_desaparecimento']) if data.get('data_desaparecimento') else None,
        loja_aluguer=data.get('loja_aluguer'),
        observacoes=data.get('observacoes'),
        cliente_nome=data.get('cliente_nome'),
        cliente_contacto=data.get('cliente_contacto'),
        cliente_morada=data.get('cliente_morada'),
        cliente_email=data.get('cliente_email'),
        cliente_observacoes=data.get('cliente_observacoes')
    )
    
    db.session.add(vehicle)
    db.session.commit()
    return jsonify(vehicle.to_dict()), 201

@vehicle_bp.route('/vehicles/<int:vehicle_id>', methods=['GET'])
@token_required
def get_vehicle(current_user, vehicle_id):
    """Obter um veículo específico com todas as suas informações"""
    vehicle = Vehicle.query.get_or_404(vehicle_id)
    vehicle_data = vehicle.to_dict()
    
    # Adicionar atualizações
    updates = VehicleUpdate.query.filter_by(vehicle_id=vehicle_id).order_by(VehicleUpdate.data_atualizacao.desc()).all()
    vehicle_data['atualizacoes'] = [update.to_dict() for update in updates]
    
    # Adicionar documentos
    documents = Document.query.filter_by(vehicle_id=vehicle_id).order_by(Document.data_upload.desc()).all()
    vehicle_data['documentos'] = [doc.to_dict() for doc in documents]
    
    return jsonify(vehicle_data)

@vehicle_bp.route('/vehicles/<int:vehicle_id>', methods=['PUT'])
@token_required
def update_vehicle(current_user, vehicle_id):
    """Atualizar um veículo"""
    vehicle = Vehicle.query.get_or_404(vehicle_id)
    data = request.json
    
    vehicle.marca = data.get('marca', vehicle.marca)
    vehicle.modelo = data.get('modelo', vehicle.modelo)
    vehicle.car_brand_id = data.get('car_brand_id', vehicle.car_brand_id)
    vehicle.car_model_id = data.get('car_model_id', vehicle.car_model_id)
    vehicle.store_location_id = data.get('store_location_id', vehicle.store_location_id)
    vehicle.vin = data.get('vin', vehicle.vin)
    vehicle.valor = data.get('valor', vehicle.valor)
    vehicle.nuipc = data.get('nuipc', vehicle.nuipc)
    vehicle.nuipc_numero = data.get('nuipc_numero', vehicle.nuipc_numero)
    vehicle.gps_ativo = data.get('gps_ativo', vehicle.gps_ativo)
    vehicle.status = data.get('status', vehicle.status)
    vehicle.loja_aluguer = data.get('loja_aluguer', vehicle.loja_aluguer)
    vehicle.observacoes = data.get('observacoes', vehicle.observacoes)
    vehicle.cliente_nome = data.get('cliente_nome', vehicle.cliente_nome)
    vehicle.cliente_contacto = data.get('cliente_contacto', vehicle.cliente_contacto)
    vehicle.cliente_morada = data.get('cliente_morada', vehicle.cliente_morada)
    vehicle.cliente_email = data.get('cliente_email', vehicle.cliente_email)
    vehicle.cliente_observacoes = data.get('cliente_observacoes', vehicle.cliente_observacoes)
    
    if data.get('data_desaparecimento'):
        vehicle.data_desaparecimento = datetime.fromisoformat(data['data_desaparecimento'])
    if data.get('data_recuperacao'):
        vehicle.data_recuperacao = datetime.fromisoformat(data['data_recuperacao'])
    
    vehicle.updated_at = datetime.utcnow()
    
    db.session.commit()
    return jsonify(vehicle.to_dict())

@vehicle_bp.route('/vehicles/<int:vehicle_id>', methods=['DELETE'])
@token_required
def delete_vehicle(current_user, vehicle_id):
    """Eliminar um veículo"""
    vehicle = Vehicle.query.get_or_404(vehicle_id)
    db.session.delete(vehicle)
    db.session.commit()
    return '', 204

@vehicle_bp.route('/vehicles/<int:vehicle_id>/updates', methods=['POST'])
@token_required
def add_vehicle_update(current_user, vehicle_id):
    """Adicionar uma atualização a um veículo"""
    vehicle = Vehicle.query.get_or_404(vehicle_id)
    data = request.json
    
    update = VehicleUpdate(
        vehicle_id=vehicle_id,
        descricao=data['descricao'],
        tipo=data['tipo'],
        localizacao=data.get('localizacao'),
        created_by=current_user.id
    )
    
    db.session.add(update)
    db.session.commit()
    return jsonify(update.to_dict()), 201

@vehicle_bp.route('/vehicles/<int:vehicle_id>/updates/<int:update_id>', methods=['DELETE'])
@token_required
def delete_vehicle_update(current_user, vehicle_id, update_id):
    """Eliminar uma atualização de um veículo"""
    update = VehicleUpdate.query.filter_by(id=update_id, vehicle_id=vehicle_id).first_or_404()
    db.session.delete(update)
    db.session.commit()
    return '', 204

@vehicle_bp.route('/vehicles/<string:matricula>', methods=['GET'])
@token_required
def get_vehicle_by_matricula(current_user, matricula):
    """Obter um veículo pela matrícula"""
    vehicle = Vehicle.query.filter_by(matricula=matricula).first_or_404()
    return jsonify(vehicle.to_dict())

@vehicle_bp.route('/dashboard/stats', methods=['GET'])
@token_required
def get_dashboard_stats(current_user):
    """Obter estatísticas para o dashboard"""
    try:
        total_vehicles = Vehicle.query.count()
        em_tratamento = Vehicle.query.filter_by(status='em_tratamento').count()
        submetidos = Vehicle.query.filter_by(status='submetido').count()
        recuperados = Vehicle.query.filter_by(status='recuperado').count()
        perdidos = Vehicle.query.filter_by(status='perdido').count()
        
        # Estatísticas por marca (usando apenas o campo marca para compatibilidade)
        marca_stats = db.session.query(Vehicle.marca, db.func.count(Vehicle.id)).group_by(Vehicle.marca).all()
        
        # Estatísticas por loja (usando apenas o campo loja_aluguer para compatibilidade)
        loja_stats = db.session.query(Vehicle.loja_aluguer, db.func.count(Vehicle.id)).filter(Vehicle.loja_aluguer.isnot(None)).group_by(Vehicle.loja_aluguer).all()
        
        # Valor total dos carros em falta (não recuperados)
        valor_total = db.session.query(db.func.sum(Vehicle.valor)).filter(Vehicle.status != 'recuperado').scalar() or 0
        
        return jsonify({
            'total_vehicles': total_vehicles,
            'em_tratamento': em_tratamento,
            'submetidos': submetidos,
            'recuperados': recuperados,
            'perdidos': perdidos,
            'marca_stats': [{'marca': marca, 'count': count} for marca, count in marca_stats],
            'loja_stats': [{'loja': loja, 'count': count} for loja, count in loja_stats],
            'valor_total_em_falta': float(valor_total)
        })
    except Exception as e:
        print(f"Erro ao obter estatísticas do dashboard: {str(e)}")
        return jsonify({
            'total_vehicles': 0,
            'em_tratamento': 0,
            'submetidos': 0,
            'recuperados': 0,
            'perdidos': 0,
            'marca_stats': [],
            'loja_stats': [],
            'valor_total_em_falta': 0
        }), 500

@vehicle_bp.route('/reports/vehicle/<int:vehicle_id>', methods=['GET'])
@token_required
def generate_vehicle_report(current_user, vehicle_id):
    """Gerar relatório completo de um veículo"""
    vehicle = Vehicle.query.get_or_404(vehicle_id)
    
    # Obter todas as atualizações
    updates = VehicleUpdate.query.filter_by(vehicle_id=vehicle_id).order_by(VehicleUpdate.data_atualizacao.asc()).all()
    
    # Obter todos os documentos
    documents = Document.query.filter_by(vehicle_id=vehicle_id).order_by(Document.data_upload.asc()).all()
    
    report = {
        'vehicle': vehicle.to_dict(),
        'timeline': [update.to_dict() for update in updates],
        'documents': [doc.to_dict() for doc in documents],
        'generated_at': datetime.utcnow().isoformat(),
        'generated_by': current_user.username
    }
    
    return jsonify(report)

