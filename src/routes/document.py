from flask import Blueprint, jsonify, request, send_file, current_app
from werkzeug.utils import secure_filename
from src.models.user import db
from src.models.vehicle import Vehicle, Document
from src.routes.auth import token_required
import os
import uuid
from datetime import datetime

document_bp = Blueprint('document', __name__)

ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'txt'}
UPLOAD_FOLDER = 'uploads'

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def ensure_upload_folder():
    """Garantir que a pasta de uploads existe"""
    upload_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), UPLOAD_FOLDER)
    if not os.path.exists(upload_path):
        os.makedirs(upload_path)
    return upload_path

@document_bp.route('/vehicles/<int:vehicle_id>/documents', methods=['POST'])
@token_required
def upload_document(current_user, vehicle_id):
    """Upload de documento para um veículo"""
    vehicle = Vehicle.query.get_or_404(vehicle_id)
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400
    
    # Gerar nome único para o ficheiro
    filename = secure_filename(file.filename)
    unique_filename = f"{uuid.uuid4()}_{filename}"
    
    # Garantir que a pasta de uploads existe
    upload_path = ensure_upload_folder()
    file_path = os.path.join(upload_path, unique_filename)
    
    # Guardar o ficheiro
    file.save(file_path)
    
    # Criar registo na base de dados
    document = Document(
        vehicle_id=vehicle_id,
        nome_ficheiro=unique_filename,
        nome_original=filename,
        tipo_documento=request.form.get('tipo_documento', 'outros'),
        caminho_ficheiro=file_path,
        tamanho_ficheiro=os.path.getsize(file_path),
        uploaded_by=current_user.id,
        origem='manual'
    )
    
    db.session.add(document)
    db.session.commit()
    
    return jsonify(document.to_dict()), 201

@document_bp.route('/vehicles/<int:vehicle_id>/documents', methods=['GET'])
@token_required
def get_vehicle_documents(current_user, vehicle_id):
    """Obter todos os documentos de um veículo"""
    vehicle = Vehicle.query.get_or_404(vehicle_id)
    documents = Document.query.filter_by(vehicle_id=vehicle_id).order_by(Document.data_upload.desc()).all()
    return jsonify([doc.to_dict() for doc in documents])

@document_bp.route('/documents/<int:document_id>', methods=['GET'])
@token_required
def download_document(current_user, document_id):
    """Download de um documento"""
    document = Document.query.get_or_404(document_id)
    
    if not os.path.exists(document.caminho_ficheiro):
        return jsonify({'error': 'File not found on disk'}), 404
    
    return send_file(
        document.caminho_ficheiro,
        as_attachment=True,
        download_name=document.nome_original
    )

@document_bp.route('/documents/<int:document_id>', methods=['DELETE'])
@token_required
def delete_document(current_user, document_id):
    """Eliminar um documento"""
    document = Document.query.get_or_404(document_id)
    
    # Eliminar o ficheiro do disco
    if os.path.exists(document.caminho_ficheiro):
        os.remove(document.caminho_ficheiro)
    
    # Eliminar o registo da base de dados
    db.session.delete(document)
    db.session.commit()
    
    return '', 204

@document_bp.route('/documents/<int:document_id>', methods=['PUT'])
@token_required
def update_document_info(current_user, document_id):
    """Atualizar informações de um documento (sem alterar o ficheiro)"""
    document = Document.query.get_or_404(document_id)
    data = request.json
    
    document.tipo_documento = data.get('tipo_documento', document.tipo_documento)
    
    db.session.commit()
    return jsonify(document.to_dict())

@document_bp.route('/documents/types', methods=['GET'])
@token_required
def get_document_types(current_user):
    """Obter tipos de documentos disponíveis"""
    types = [
        'contrato',
        'queixa_policia',
        'relatorio_gps',
        'comunicacao_cliente',
        'fotografia',
        'outros'
    ]
    return jsonify(types)

