from flask import Blueprint, jsonify, request, current_app
from ..models.rent_a_car import EmailTrigger
from ..models.user import db
from .auth import token_required, admin_required
from ..services.email_service import EmailService
from datetime import datetime
import os

email_trigger_bp = Blueprint('email_trigger', __name__)

@email_trigger_bp.route('/email-triggers', methods=['GET'])
@token_required
def get_email_triggers(current_user):
    """Obter todos os email triggers"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    processed = request.args.get('processed')
    
    query = EmailTrigger.query
    
    if processed is not None:
        processed = processed.lower() == 'true'
        query = query.filter_by(processed=processed)
    
    # Ordenar por data de recebimento (mais recentes primeiro)
    query = query.order_by(EmailTrigger.received_at.desc())
    
    # Paginação
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    email_triggers = pagination.items
    
    return jsonify({
        'email_triggers': [trigger.to_dict() for trigger in email_triggers],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    })

@email_trigger_bp.route('/email-triggers/<int:trigger_id>', methods=['GET'])
@token_required
def get_email_trigger(current_user, trigger_id):
    """Obter um email trigger específico"""
    trigger = EmailTrigger.query.get_or_404(trigger_id)
    return jsonify(trigger.to_dict())

@email_trigger_bp.route('/email-triggers/<int:trigger_id>/process', methods=['POST'])
@token_required
def process_email_trigger(current_user, trigger_id):
    """Processar um email trigger manualmente"""
    trigger = EmailTrigger.query.get_or_404(trigger_id)
    
    if trigger.processed:
        return jsonify({'message': 'Este email já foi processado'}), 400
    
    # Inicializar o serviço de email
    email_service = EmailService(
        email_address=os.environ.get('EMAIL_ADDRESS', 'seu_email@gmail.com'),
        password=os.environ.get('EMAIL_PASSWORD', 'sua_senha')
    )
    
    # Processar o email e criar veículo
    vehicle, message = email_service.create_vehicle_from_email(trigger_id)
    
    if vehicle:
        return jsonify({
            'message': message,
            'vehicle_id': vehicle.id,
            'email_trigger': trigger.to_dict()
        })
    else:
        return jsonify({
            'message': message,
            'email_trigger': trigger.to_dict()
        }), 400

@email_trigger_bp.route('/email-triggers/check-new', methods=['POST'])
@token_required
@admin_required
def check_new_emails(current_user):
    """Verificar e processar novos emails"""
    # Inicializar o serviço de email
    email_service = EmailService(
        email_address=os.environ.get('EMAIL_ADDRESS', 'seu_email@gmail.com'),
        password=os.environ.get('EMAIL_PASSWORD', 'sua_senha')
    )
    
    # Processar emails não lidos
    processed_count = email_service.process_emails()
    
    return jsonify({
        'message': f'{processed_count} emails processados',
        'processed_count': processed_count
    })

@email_trigger_bp.route('/email-triggers/auto-process', methods=['POST'])
@token_required
@admin_required
def auto_process_emails(current_user):
    """Processar automaticamente todos os emails não processados"""
    # Buscar todos os triggers não processados
    unprocessed_triggers = EmailTrigger.query.filter_by(processed=False).all()
    
    # Inicializar o serviço de email
    email_service = EmailService(
        email_address=os.environ.get('EMAIL_ADDRESS', 'seu_email@gmail.com'),
        password=os.environ.get('EMAIL_PASSWORD', 'sua_senha')
    )
    
    results = {
        'success': 0,
        'failed': 0,
        'details': []
    }
    
    for trigger in unprocessed_triggers:
        vehicle, message = email_service.create_vehicle_from_email(trigger.id)
        
        result = {
            'trigger_id': trigger.id,
            'message': message,
            'success': vehicle is not None
        }
        
        if vehicle:
            result['vehicle_id'] = vehicle.id
            results['success'] += 1
        else:
            results['failed'] += 1
        
        results['details'].append(result)
    
    return jsonify(results)