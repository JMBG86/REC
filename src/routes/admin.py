from flask import Blueprint, jsonify, request, current_app
from src.models.user import User, db
# Importar diretamente do pacote models
from src.models import CarBrand, CarModel
from src.models.rent_a_car import RentACar
from src.models.store_location import StoreLocation
from src.routes.auth import token_required, admin_required
from datetime import datetime

admin_bp = Blueprint('admin', __name__)

# Rotas para gerenciar marcas de carros
@admin_bp.route('/car-brands', methods=['GET'])
@token_required
@admin_required
def get_car_brands(current_user):
    """Obter todas as marcas de carros"""
    brands = CarBrand.query.all()
    return jsonify({
        'success': True,
        'data': [brand.to_dict() for brand in brands]
    }), 200

@admin_bp.route('/car-brands', methods=['POST'])
@token_required
@admin_required
def create_car_brand(current_user):
    """Criar uma nova marca de carro"""
    data = request.get_json()
    
    if not data or not data.get('name'):
        return jsonify({
            'success': False,
            'message': 'Nome da marca é obrigatório'
        }), 400
    
    # Verificar se a marca já existe
    existing_brand = CarBrand.query.filter_by(name=data['name']).first()
    if existing_brand:
        return jsonify({
            'success': False,
            'message': 'Marca já existe'
        }), 400
    
    # Criar nova marca
    new_brand = CarBrand(
        name=data['name'],
        is_active=data.get('is_active', True)
    )
    
    db.session.add(new_brand)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Marca criada com sucesso',
        'data': new_brand.to_dict()
    }), 201

@admin_bp.route('/car-brands/<int:brand_id>', methods=['PUT'])
@token_required
@admin_required
def update_car_brand(current_user, brand_id):
    """Atualizar uma marca de carro existente"""
    brand = CarBrand.query.get(brand_id)
    if not brand:
        return jsonify({
            'success': False,
            'message': 'Marca não encontrada'
        }), 404
    
    data = request.get_json()
    
    if 'name' in data:
        # Verificar se o novo nome já existe em outra marca
        if data['name'] != brand.name:
            existing_brand = CarBrand.query.filter_by(name=data['name']).first()
            if existing_brand:
                return jsonify({
                    'success': False,
                    'message': 'Já existe uma marca com este nome'
                }), 400
        brand.name = data['name']
    
    if 'is_active' in data:
        brand.is_active = data['is_active']
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Marca atualizada com sucesso',
        'data': brand.to_dict()
    }), 200

@admin_bp.route('/car-brands/<int:brand_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_car_brand(current_user, brand_id):
    """Excluir uma marca de carro"""
    brand = CarBrand.query.get(brand_id)
    if not brand:
        return jsonify({
            'success': False,
            'message': 'Marca não encontrada'
        }), 404
    
    # Verificar se existem modelos associados a esta marca
    models = CarModel.query.filter_by(brand_id=brand_id).count()
    if models > 0:
        return jsonify({
            'success': False,
            'message': f'Não é possível excluir esta marca pois existem {models} modelos associados a ela'
        }), 400
    
    db.session.delete(brand)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Marca excluída com sucesso'
    }), 200

# Rotas para gerenciar modelos de carros
@admin_bp.route('/car-models', methods=['GET'])
@token_required
@admin_required
def get_car_models(current_user):
    """Obter todos os modelos de carros"""
    brand_id = request.args.get('brand_id', type=int)
    
    if brand_id:
        models = CarModel.query.filter_by(brand_id=brand_id).all()
    else:
        models = CarModel.query.all()
    
    return jsonify({
        'success': True,
        'data': [model.to_dict() for model in models]
    }), 200

@admin_bp.route('/car-models', methods=['POST'])
@token_required
@admin_required
def create_car_model(current_user):
    """Criar um novo modelo de carro"""
    data = request.get_json()
    
    if not data or not data.get('name') or not data.get('brand_id'):
        return jsonify({
            'success': False,
            'message': 'Nome do modelo e ID da marca são obrigatórios'
        }), 400
    
    # Verificar se a marca existe
    brand = CarBrand.query.get(data['brand_id'])
    if not brand:
        return jsonify({
            'success': False,
            'message': 'Marca não encontrada'
        }), 404
    
    # Criar novo modelo
    new_model = CarModel(
        name=data['name'],
        brand_id=data['brand_id'],
        description=data.get('description'),
        is_active=data.get('is_active', True)
    )
    
    db.session.add(new_model)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Modelo criado com sucesso',
        'data': new_model.to_dict()
    }), 201

@admin_bp.route('/car-models/<int:model_id>', methods=['PUT'])
@token_required
@admin_required
def update_car_model(current_user, model_id):
    """Atualizar um modelo de carro existente"""
    model = CarModel.query.get(model_id)
    if not model:
        return jsonify({
            'success': False,
            'message': 'Modelo não encontrado'
        }), 404
    
    data = request.get_json()
    
    if 'name' in data:
        model.name = data['name']
    
    if 'brand_id' in data:
        # Verificar se a marca existe
        brand = CarBrand.query.get(data['brand_id'])
        if not brand:
            return jsonify({
                'success': False,
                'message': 'Marca não encontrada'
            }), 404
        model.brand_id = data['brand_id']
    
    if 'description' in data:
        model.description = data['description']
    
    if 'is_active' in data:
        model.is_active = data['is_active']
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Modelo atualizado com sucesso',
        'data': model.to_dict()
    }), 200

@admin_bp.route('/car-models/<int:model_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_car_model(current_user, model_id):
    """Excluir um modelo de carro"""
    model = CarModel.query.get(model_id)
    if not model:
        return jsonify({
            'success': False,
            'message': 'Modelo não encontrado'
        }), 404
    
    # Verificar se existem veículos associados a este modelo
    from src.models.vehicle import Vehicle
    vehicles = Vehicle.query.filter_by(car_model_id=model_id).count()
    if vehicles > 0:
        return jsonify({
            'success': False,
            'message': f'Não é possível excluir este modelo pois existem {vehicles} veículos associados a ele'
        }), 400
    
    db.session.delete(model)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Modelo excluído com sucesso'
    }), 200

# Rotas para gerenciar empresas de aluguel de carros
@admin_bp.route('/rent-a-cars', methods=['GET'])
@token_required
@admin_required
def get_rent_a_cars(current_user):
    """Obter todas as empresas de aluguel de carros"""
    rent_a_cars = RentACar.query.all()
    return jsonify({
        'success': True,
        'data': [rac.to_dict() for rac in rent_a_cars]
    }), 200

@admin_bp.route('/rent-a-cars', methods=['POST'])
@token_required
@admin_required
def create_rent_a_car(current_user):
    """Criar uma nova empresa de aluguel de carros"""
    data = request.get_json()
    
    if not data or not data.get('nome'):
        return jsonify({
            'success': False,
            'message': 'Nome da empresa é obrigatório'
        }), 400
    
    # Criar nova empresa
    new_rac = RentACar(
        nome=data['nome'],
        contacto_email=data.get('contacto_email'),
        contacto_telefone=data.get('contacto_telefone'),
        endereco=data.get('endereco'),
        cidade=data.get('cidade'),
        codigo_postal=data.get('codigo_postal'),
        pais=data.get('pais', 'Portugal'),
        nif=data.get('nif'),
        website=data.get('website'),
        logo_url=data.get('logo_url'),
        descricao=data.get('descricao'),
        is_active=data.get('is_active', True)
    )
    
    db.session.add(new_rac)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Empresa criada com sucesso',
        'data': new_rac.to_dict()
    }), 201

@admin_bp.route('/rent-a-cars/<int:rac_id>', methods=['PUT'])
@token_required
@admin_required
def update_rent_a_car(current_user, rac_id):
    """Atualizar uma empresa de aluguel de carros existente"""
    rac = RentACar.query.get(rac_id)
    if not rac:
        return jsonify({
            'success': False,
            'message': 'Empresa não encontrada'
        }), 404
    
    data = request.get_json()
    
    # Atualizar campos
    if 'nome' in data:
        rac.nome = data['nome']
    if 'contacto_email' in data:
        rac.contacto_email = data['contacto_email']
    if 'contacto_telefone' in data:
        rac.contacto_telefone = data['contacto_telefone']
    if 'endereco' in data:
        rac.endereco = data['endereco']
    if 'cidade' in data:
        rac.cidade = data['cidade']
    if 'codigo_postal' in data:
        rac.codigo_postal = data['codigo_postal']
    if 'pais' in data:
        rac.pais = data['pais']
    if 'nif' in data:
        rac.nif = data['nif']
    if 'website' in data:
        rac.website = data['website']
    if 'logo_url' in data:
        rac.logo_url = data['logo_url']
    if 'descricao' in data:
        rac.descricao = data['descricao']
    if 'is_active' in data:
        rac.is_active = data['is_active']
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Empresa atualizada com sucesso',
        'data': rac.to_dict()
    }), 200

@admin_bp.route('/rent-a-cars/<int:rac_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_rent_a_car(current_user, rac_id):
    """Excluir uma empresa de aluguel de carros"""
    rac = RentACar.query.get(rac_id)
    if not rac:
        return jsonify({
            'success': False,
            'message': 'Empresa não encontrada'
        }), 404
    
    # Verificar se existem usuários ou localizações associados a esta empresa
    users = User.query.filter_by(rent_a_car_id=rac_id).count()
    locations = StoreLocation.query.filter_by(rent_a_car_id=rac_id).count()
    
    if users > 0 or locations > 0:
        return jsonify({
            'success': False,
            'message': f'Não é possível excluir esta empresa pois existem {users} usuários e {locations} localizações associados a ela'
        }), 400
    
    db.session.delete(rac)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Empresa excluída com sucesso'
    }), 200

# Rotas para gerenciar localizações de lojas
@admin_bp.route('/store-locations', methods=['GET'])
@token_required
@admin_required
def get_store_locations(current_user):
    """Obter todas as localizações de lojas"""
    rent_a_car_id = request.args.get('rent_a_car_id', type=int)
    
    if rent_a_car_id:
        locations = StoreLocation.query.filter_by(rent_a_car_id=rent_a_car_id).all()
    else:
        locations = StoreLocation.query.all()
    
    return jsonify({
        'success': True,
        'data': [location.to_dict() for location in locations]
    }), 200

@admin_bp.route('/store-locations', methods=['POST'])
@token_required
@admin_required
def create_store_location(current_user):
    """Criar uma nova localização de loja"""
    data = request.get_json()
    
    if not data or not data.get('nome') or not data.get('rent_a_car_id'):
        return jsonify({
            'success': False,
            'message': 'Nome da loja e ID da empresa são obrigatórios'
        }), 400
    
    # Verificar se a empresa existe
    rac = RentACar.query.get(data['rent_a_car_id'])
    if not rac:
        return jsonify({
            'success': False,
            'message': 'Empresa não encontrada'
        }), 404
    
    # Criar nova localização
    new_location = StoreLocation(
        nome=data['nome'],
        rent_a_car_id=data['rent_a_car_id'],
        endereco=data.get('endereco'),
        cidade=data.get('cidade'),
        codigo_postal=data.get('codigo_postal'),
        pais=data.get('pais', 'Portugal'),
        contacto_telefone=data.get('contacto_telefone'),
        contacto_email=data.get('contacto_email'),
        horario_funcionamento=data.get('horario_funcionamento'),
        is_active=data.get('is_active', True)
    )
    
    db.session.add(new_location)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Localização criada com sucesso',
        'data': new_location.to_dict()
    }), 201

@admin_bp.route('/store-locations/<int:location_id>', methods=['PUT'])
@token_required
@admin_required
def update_store_location(current_user, location_id):
    """Atualizar uma localização de loja existente"""
    location = StoreLocation.query.get(location_id)
    if not location:
        return jsonify({
            'success': False,
            'message': 'Localização não encontrada'
        }), 404
    
    data = request.get_json()
    
    # Atualizar campos
    if 'nome' in data:
        location.nome = data['nome']
    if 'rent_a_car_id' in data:
        # Verificar se a empresa existe
        rac = RentACar.query.get(data['rent_a_car_id'])
        if not rac:
            return jsonify({
                'success': False,
                'message': 'Empresa não encontrada'
            }), 404
        location.rent_a_car_id = data['rent_a_car_id']
    if 'endereco' in data:
        location.endereco = data['endereco']
    if 'cidade' in data:
        location.cidade = data['cidade']
    if 'codigo_postal' in data:
        location.codigo_postal = data['codigo_postal']
    if 'pais' in data:
        location.pais = data['pais']
    if 'contacto_telefone' in data:
        location.contacto_telefone = data['contacto_telefone']
    if 'contacto_email' in data:
        location.contacto_email = data['contacto_email']
    if 'horario_funcionamento' in data:
        location.horario_funcionamento = data['horario_funcionamento']
    if 'is_active' in data:
        location.is_active = data['is_active']
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Localização atualizada com sucesso',
        'data': location.to_dict()
    }), 200

@admin_bp.route('/store-locations/<int:location_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_store_location(current_user, location_id):
    """Excluir uma localização de loja"""
    location = StoreLocation.query.get(location_id)
    if not location:
        return jsonify({
            'success': False,
            'message': 'Localização não encontrada'
        }), 404
    
    # Verificar se existem veículos associados a esta localização
    from src.models.vehicle import Vehicle
    vehicles = Vehicle.query.filter_by(store_location_id=location_id).count()
    if vehicles > 0:
        return jsonify({
            'success': False,
            'message': f'Não é possível excluir esta localização pois existem {vehicles} veículos associados a ela'
        }), 400
    
    db.session.delete(location)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Localização excluída com sucesso'
    }), 200