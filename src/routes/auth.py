from flask import Blueprint, jsonify, request, current_app
from ..models.user import User, db
from datetime import datetime, timedelta
import jwt
from functools import wraps

auth_bp = Blueprint('auth', __name__)

def token_required(f):
    """Decorator para proteger rotas que requerem autenticação"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Verificar se o token está no header Authorization
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]  # Bearer TOKEN
            except IndexError:
                return jsonify({'message': 'Token format invalid'}), 401
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            # Decodificar o token
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.filter_by(id=data['user_id']).first()
            if not current_user or not current_user.is_active:
                return jsonify({'message': 'Token is invalid'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token is invalid'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

def admin_required(f):
    """Decorator para proteger rotas que requerem privilégios de admin"""
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if current_user.role != 'admin':
            return jsonify({'message': 'Admin privileges required'}), 403
        return f(current_user, *args, **kwargs)
    
    return decorated

@auth_bp.route('/login', methods=['POST'])
def login():
    """Fazer login e obter token JWT"""
    try:
        data = request.json
        
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({'message': 'Username and password are required'}), 400
        
        user = User.query.filter_by(username=data['username']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'message': 'Invalid credentials'}), 401
        
        if not user.is_active:
            return jsonify({'message': 'Account is disabled'}), 401
        
        # Gerar token JWT
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, current_app.config['SECRET_KEY'], algorithm='HS256')
        
        # Garantir que o token seja uma string
        if isinstance(token, bytes):
            token = token.decode('utf-8')
            
        # Preparar resposta com dados do usuário
        user_data = user.to_dict()
        
        # Criar o objeto de resposta
        response_data = {
            'token': token,
            'user': user_data
        }
        
        # Garantir que a resposta seja um JSON válido
        response = jsonify(response_data)
        
        # Definir cabeçalhos explícitos para evitar problemas de CORS
        response.headers.add('Content-Type', 'application/json')
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        
        # Log para debug
        current_app.logger.info(f"Login bem-sucedido para usuário: {user.username}")
        current_app.logger.debug(f"Resposta JSON: {response_data}")
        
        return response
    except Exception as e:
        # Log do erro
        current_app.logger.error(f"Erro no login: {str(e)}")
        return jsonify({'message': f'Erro no servidor: {str(e)}'}), 500

@auth_bp.route('/register', methods=['POST'])
def register():
    """Registar um novo utilizador (apenas admin pode criar utilizadores)"""
    data = request.json
    
    if not data or not all(k in data for k in ('username', 'email', 'password')):
        return jsonify({'message': 'Username, email and password are required'}), 400
    
    # Verificar se o utilizador já existe
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already exists'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already exists'}), 400
    
    # Criar novo utilizador
    user = User(
        username=data['username'],
        email=data['email'],
        role=data.get('role', 'admin')
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({
        'message': 'User created successfully',
        'user': user.to_dict()
    }), 201

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    """Obter informações do utilizador atual"""
    return jsonify(current_user.to_dict())

@auth_bp.route('/change-password', methods=['POST'])
@token_required
def change_password(current_user):
    """Alterar a password do utilizador atual"""
    data = request.json
    
    if not data or not all(k in data for k in ('current_password', 'new_password')):
        return jsonify({'message': 'Current password and new password are required'}), 400
    
    if not current_user.check_password(data['current_password']):
        return jsonify({'message': 'Current password is incorrect'}), 400
    
    current_user.set_password(data['new_password'])
    db.session.commit()
    
    return jsonify({'message': 'Password changed successfully'})

@auth_bp.route('/users', methods=['GET'])
@token_required
@admin_required
def get_all_users(current_user):
    """Obter todos os utilizadores (apenas admin)"""
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

@auth_bp.route('/users/<int:user_id>/toggle-status', methods=['POST'])
@token_required
@admin_required
def toggle_user_status(current_user, user_id):
    """Ativar/desativar um utilizador (apenas admin)"""
    user = User.query.get_or_404(user_id)
    
    if user.id == current_user.id:
        return jsonify({'message': 'Cannot disable your own account'}), 400
    
    user.is_active = not user.is_active
    db.session.commit()
    
    status = 'activated' if user.is_active else 'deactivated'
    return jsonify({
        'message': f'User {status} successfully',
        'user': user.to_dict()
    })

@auth_bp.route('/users/<int:user_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_user(current_user, user_id):
    """Eliminar um utilizador (apenas admin)"""
    user = User.query.get_or_404(user_id)
    
    if user.id == current_user.id:
        return jsonify({'message': 'Cannot delete your own account'}), 400
    
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({'message': 'User deleted successfully'})

