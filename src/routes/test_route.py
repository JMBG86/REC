from flask import Blueprint, jsonify

test_bp = Blueprint('test', __name__)

@test_bp.route('/api/test')
def test_route():
    return jsonify({'status': 'ok', 'message': 'Rota de teste funcionando corretamente'})