"""
ABMT Commercial System - Main Flask Application
Port 5001 | comercial.db
"""
import os
import json
import secrets
import calendar
import threading
import time
from datetime import datetime, timedelta
from functools import wraps
from collections import defaultdict

from flask import Flask, request, jsonify, render_template, session, send_file, send_from_directory, Response, g
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

from database import get_db as _raw_get_db, init_db, get_next_number, do_backup, check_backup_on_start, update_fts, DB_PATH, BACKUP_DIR, restore_from_cloud

app = Flask(__name__)

# === GZIP COMPRESSION ===
try:
    from flask_compress import Compress
    app.config['COMPRESS_MIMETYPES'] = [
        'text/html', 'text/css', 'text/javascript',
        'application/javascript', 'application/json',
        'image/svg+xml'
    ]
    app.config['COMPRESS_MIN_SIZE'] = 500
    Compress(app)
except ImportError:
    pass

# === AUTO-CLOSE DB CONNECTIONS ===
# Track all connections opened during a request and close them automatically
# This prevents "database is locked" from leaked connections
def get_db():
    """Get a DB connection that will be auto-closed at end of request."""
    conn = _raw_get_db()
    if not hasattr(g, '_db_conns'):
        g._db_conns = []
    g._db_conns.append(conn)
    return conn

@app.teardown_appcontext
def _close_db_connections(exception):
    """Auto-close any DB connections opened during this request."""
    conns = getattr(g, '_db_conns', [])
    for conn in conns:
        try:
            conn.close()
        except Exception:
            pass
_secret_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.secret_key')
def _get_or_create_secret():
    if os.environ.get('SECRET_KEY'):
        return os.environ['SECRET_KEY']
    if os.path.exists(_secret_file):
        with open(_secret_file, 'r') as f:
            return f.read().strip()
    key = secrets.token_hex(32)
    with open(_secret_file, 'w') as f:
        f.write(key)
    return key
app.secret_key = _get_or_create_secret()
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=8)
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5MB max upload

# Rate limiting para login — máximo 5 tentativas por IP em 15 minutos
_login_attempts = {}  # {ip: [(timestamp, ...),]}
_LOGIN_MAX = 5
_LOGIN_WINDOW = 900  # 15 min em segundos
_login_lock = threading.Lock()
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = not app.debug  # Secure em produção

# === CACHE HEADERS FOR STATIC FILES + SECURITY HEADERS ===
@app.after_request
def add_cache_headers(response):
    """Add cache headers and security headers."""
    if request.path.startswith('/static/'):
        # Cache static assets for 1 hour, revalidate after
        response.headers['Cache-Control'] = 'public, max-age=3600, stale-while-revalidate=86400'
    elif request.path.startswith('/api/'):
        # API responses: no cache
        response.headers['Cache-Control'] = 'no-store'

    # Security headers — apply to all responses
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    response.headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
    # HSTS only in production (HTTPS)
    if not app.debug:
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'

    # Trigger cloud backup after successful write operations (POST/PUT/PATCH/DELETE)
    if request.method in ('POST', 'PUT', 'PATCH', 'DELETE') and request.path.startswith('/api/') and response.status_code < 400:
        _trigger_cloud_backup()
    return response

_data_dir = os.environ.get('RAILWAY_VOLUME_MOUNT_PATH') or os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(_data_dir, 'uploads')
UPLOAD_DELETED_DIR = os.path.join(UPLOAD_DIR, 'deleted')
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(UPLOAD_DELETED_DIR, exist_ok=True)

CATEGORIAS = [
    'Transformador Usado', 'Transformador Novo', 'Bobinas de Aço Silício',
    'Chapas de Aço Silício', 'Chapas de Aço Silício Cortadas', 'Caixa e Núcleo',
    'Cobre', 'Alumínio', 'Óleo Isolante', 'Radiadores', 'Papel Kraft',
    'Retalho / Sucata', 'Diversos'
]

UFS = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT',
       'PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO']

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def validar_cnpj_cpf(doc):
    """Validate CNPJ (14 digits) or CPF (11 digits). Returns (is_valid, cleaned_doc)."""
    import re
    doc = re.sub(r'[^0-9]', '', str(doc))

    if len(doc) == 11:
        # CPF validation
        if doc == doc[0] * 11:
            return False, doc
        soma = sum(int(doc[i]) * (10 - i) for i in range(9))
        d1 = 11 - (soma % 11)
        d1 = 0 if d1 >= 10 else d1
        if int(doc[9]) != d1:
            return False, doc
        soma = sum(int(doc[i]) * (11 - i) for i in range(10))
        d2 = 11 - (soma % 11)
        d2 = 0 if d2 >= 10 else d2
        return int(doc[10]) == d2, doc

    elif len(doc) == 14:
        # CNPJ validation
        if doc == doc[0] * 14:
            return False, doc
        pesos1 = [5,4,3,2,9,8,7,6,5,4,3,2]
        soma = sum(int(doc[i]) * pesos1[i] for i in range(12))
        d1 = 11 - (soma % 11)
        d1 = 0 if d1 >= 10 else d1
        if int(doc[12]) != d1:
            return False, doc
        pesos2 = [6,5,4,3,2,9,8,7,6,5,4,3,2]
        soma = sum(int(doc[i]) * pesos2[i] for i in range(13))
        d2 = 11 - (soma % 11)
        d2 = 0 if d2 >= 10 else d2
        return int(doc[13]) == d2, doc

    return False, doc

# ============ CSRF PROTECTION ============

@app.before_request
def csrf_protect():
    if request.method in ('POST', 'PUT', 'DELETE'):
        if request.path == '/api/login':
            return  # skip for login
        token = request.headers.get('X-CSRF-Token', '')
        if token != session.get('csrf_token', ''):
            return jsonify({'error': 'Token CSRF inválido'}), 403

# ============ AUTH HELPERS ============

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Não autenticado'}), 401
        # Enforce troca de senha obrigatória — só permite /change-password, /me, /csrf e /logout
        if session.get('must_change_password') and request.path not in ('/api/change-password', '/api/me', '/api/csrf', '/api/logout'):
            return jsonify({'error': 'Troca de senha obrigatória', 'must_change_password': True}), 403
        return f(*args, **kwargs)
    return decorated

def gestor_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Não autenticado'}), 401
        if session.get('must_change_password') and request.path not in ('/api/change-password', '/api/me', '/api/csrf', '/api/logout'):
            return jsonify({'error': 'Troca de senha obrigatória', 'must_change_password': True}), 403
        if session.get('perfil') not in ('gerente', 'diretor'):
            return jsonify({'error': 'Acesso restrito a gestor/diretor'}), 403
        return f(*args, **kwargs)
    return decorated


# Defaults de permissão para vendedor — só ver_dashboard é liberado por padrão
_PERM_DEFAULTS_VENDEDOR = {
    'ver_dashboard': True,
    'ver_relatorios': False,
    'ver_intelligence': False,
    'ver_pipeline': False,
    'ver_fechamento': False,
    'ver_compras': False,
    'ver_margem': False,
    'ver_comissao_outros': False,
    'exportar_dados': False,
}


def user_has_permission(key):
    """Verifica se o usuário logado tem uma permissão.
    Gerentes e diretores sempre têm tudo. Vendedores usam overrides + defaults.
    """
    perfil = session.get('perfil')
    if perfil in ('gerente', 'diretor'):
        return True
    uid = session.get('user_id')
    if not uid:
        return False
    try:
        conn = _raw_get_db()
        row = conn.execute("SELECT permissoes FROM users WHERE id=?", (uid,)).fetchone()
        conn.close()
        perms = json.loads(row['permissoes']) if row and row['permissoes'] else {}
    except Exception:
        perms = {}
    if key in perms:
        return bool(perms[key])
    return _PERM_DEFAULTS_VENDEDOR.get(key, False)


def permission_required(perm_key):
    """Decorator: bloqueia endpoint se o usuário não tem a permissão.
    Gerentes/diretores passam sempre."""
    def wrapper(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if 'user_id' not in session:
                return jsonify({'error': 'Não autenticado'}), 401
            if session.get('must_change_password'):
                return jsonify({'error': 'Troca de senha obrigatória', 'must_change_password': True}), 403
            if not user_has_permission(perm_key):
                return jsonify({'error': 'Você não tem permissão para acessar este recurso'}), 403
            return f(*args, **kwargs)
        return decorated
    return wrapper

def get_current_user():
    user = {
        'id': session.get('user_id'),
        'nome': session.get('nome'),
        'perfil': session.get('perfil')
    }
    # Fetch per-user permissions from DB (cached in session would be faster but
    # this ensures admin changes take effect immediately)
    if user['id']:
        try:
            conn = _raw_get_db()
            row = conn.execute("SELECT permissoes FROM users WHERE id=?", (user['id'],)).fetchone()
            conn.close()
            if row and row['permissoes']:
                user['permissoes'] = json.loads(row['permissoes'])
            else:
                user['permissoes'] = {}
        except Exception:
            user['permissoes'] = {}
    return user

# ============ AUTH ROUTES ============

@app.route('/api/csrf')
@login_required
def get_csrf():
    if 'csrf_token' not in session:
        session['csrf_token'] = secrets.token_hex(32)
    return jsonify({'token': session['csrf_token']})


@app.route('/api/login', methods=['POST'])
def login():
    ip = request.remote_addr or '0.0.0.0'
    now = time.time()

    # Limpar tentativas expiradas e checar limite
    with _login_lock:
        attempts = _login_attempts.get(ip, [])
        attempts = [t for t in attempts if now - t < _LOGIN_WINDOW]
        _login_attempts[ip] = attempts
        if len(attempts) >= _LOGIN_MAX:
            wait = int(_LOGIN_WINDOW - (now - attempts[0]))
            return jsonify({'error': f'Muitas tentativas. Tente novamente em {wait}s.'}), 429

    data = request.json
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE username=? AND ativo=1",
                        (data.get('username', ''),)).fetchone()
    conn.close()
    if user and check_password_hash(user['password_hash'], data.get('password', '')):
        # Login OK — limpar tentativas deste IP
        with _login_lock:
            _login_attempts.pop(ip, None)
        session.clear()
        session.permanent = True
        session['user_id'] = user['id']
        session['nome'] = user['nome']
        session['perfil'] = user['perfil']
        session['must_change_password'] = bool(user['must_change_password']) if 'must_change_password' in user.keys() else False
        session['csrf_token'] = secrets.token_hex(32)
        return jsonify({
            'ok': True,
            'user': {'id': user['id'], 'nome': user['nome'], 'perfil': user['perfil']},
            'csrf_token': session['csrf_token'],
            'must_change_password': bool(user['must_change_password']) if 'must_change_password' in user.keys() else False
        })

    # Login falhou — registrar tentativa
    with _login_lock:
        _login_attempts.setdefault(ip, []).append(now)
    return jsonify({'error': 'Usuário ou senha inválidos'}), 401


@app.route('/api/change-password', methods=['POST'])
@login_required
def change_password():
    data = request.json
    new_password = data.get('new_password', '').strip()
    current_password = data.get('current_password', '').strip()

    if len(new_password) < 6:
        return jsonify({'error': 'Senha deve ter pelo menos 6 caracteres'}), 400

    conn = get_db()
    try:
        user = conn.execute("SELECT password_hash, must_change_password FROM users WHERE id=?",
                            (session['user_id'],)).fetchone()
        # Exigir senha atual EXCETO na troca obrigatória (primeiro login)
        if not user['must_change_password'] and not current_password:
            return jsonify({'error': 'Senha atual é obrigatória'}), 400
        if current_password and not check_password_hash(user['password_hash'], current_password):
            return jsonify({'error': 'Senha atual incorreta'}), 400

        conn.execute("UPDATE users SET password_hash=?, must_change_password=0 WHERE id=?",
                     (generate_password_hash(new_password), session['user_id']))
        conn.commit()
        session['must_change_password'] = False
        return jsonify({'ok': True})
    finally:
        conn.close()

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'ok': True})

@app.route('/api/me')
def me():
    if 'user_id' not in session:
        return jsonify({'authenticated': False})
    return jsonify({'authenticated': True, 'user': get_current_user()})

# ============ DASHBOARD ============

@app.route('/api/dashboard')
@login_required
def dashboard():
    user = get_current_user()
    conn = get_db()
    try:
        now = datetime.now()
        mes = now.month
        ano = now.year

        # Filter by user if vendedor
        vendedor_filter = ""
        params = []
        if user['perfil'] == 'vendedor':
            vendedor_filter = "AND vendedor_id = ?"
            params = [user['id']]

        # Proposals stats
        props_abertas = conn.execute(
            f"SELECT COUNT(*) as c FROM propostas WHERE status NOT IN ('Convertida','Perdida','Expirada') {vendedor_filter}",
            params).fetchone()['c']

        # OVs this month
        ov_vend_filter = vendedor_filter.replace('vendedor_id', 'ov.vendedor_id') if vendedor_filter else ''
        ovs_mes = conn.execute(
            f"""SELECT COALESCE(SUM(i.valor_total), 0) as total
            FROM ordens_venda ov JOIN ov_items i ON i.ov_id = ov.id
            WHERE strftime('%m', ov.data_emissao)=? AND strftime('%Y', ov.data_emissao)=?
            AND ov.status != 'Cancelada' {ov_vend_filter}""",
            [f'{mes:02d}', str(ano)] + params).fetchone()['total']

        # OCs this month
        oc_comp_filter = vendedor_filter.replace('vendedor_id', 'oc.comprador_id') if vendedor_filter else ''
        ocs_mes = conn.execute(
            f"""SELECT COALESCE(SUM(i.valor_total), 0) as total
            FROM ordens_compra oc JOIN oc_items i ON i.oc_id = oc.id
            WHERE strftime('%m', oc.data_emissao)=? AND strftime('%Y', oc.data_emissao)=?
            AND oc.status != 'Cancelada' {oc_comp_filter}""",
            [f'{mes:02d}', str(ano)] + params).fetchone()['total']

        hoje = now.strftime('%Y-%m-%d')
        followups_hoje = conn.execute(
            "SELECT COUNT(*) as c FROM followups WHERE user_id=? AND concluido=0 AND date(data_hora)=?",
            (user['id'], hoje)).fetchone()['c']

        followups_atrasados = conn.execute(
            "SELECT COUNT(*) as c FROM followups WHERE user_id=? AND concluido=0 AND date(data_hora)<?",
            (user['id'], hoje)).fetchone()['c']

        vencidas_total = 0
        if user['perfil'] in ('gerente', 'diretor'):
            vencidas_total = conn.execute(
                "SELECT COALESCE(SUM(valor),0) as t FROM ov_parcelas WHERE (status='Pendente' OR status='Vencida') AND date(data_vencimento)<?",
                (hoje,)).fetchone()['t']

        notif_count = conn.execute(
            "SELECT COUNT(*) as c FROM notificacoes WHERE user_id=? AND lida=0",
            (user['id'],)).fetchone()['c']

        return jsonify({
            'propostas_abertas': props_abertas,
            'ovs_mes': ovs_mes,
            'ocs_mes': ocs_mes,
            'followups_hoje': followups_hoje,
            'followups_atrasados': followups_atrasados,
            'vencidas_total': vencidas_total,
            'notificacoes': notif_count,
            'mes': mes,
            'ano': ano
        })
    finally:
        conn.close()

# ============ MEU DIA ============

@app.route('/api/meu-dia')
@login_required
def meu_dia():
    """Tela do vendedor: tudo que precisa pra começar o dia em uma única chamada."""
    user = get_current_user()
    conn = get_db()
    try:
        return _meu_dia_impl(user, conn)
    finally:
        conn.close()

def _meu_dia_impl(user, conn):
    hoje = datetime.now().strftime('%Y-%m-%d')
    now = datetime.now()
    mes = now.month
    ano = now.year

    # 1. Follow-ups de hoje + atrasados
    followups_hoje = conn.execute(
        """SELECT f.id, f.acao, f.data_hora, f.concluido, f.vinculo_tipo, f.vinculo_id,
            c.razao_social
        FROM followups f
        LEFT JOIN cadastros c ON f.cadastro_id = c.id
        WHERE f.user_id = ? AND f.concluido = 0 AND date(f.data_hora) <= ?
        ORDER BY f.data_hora ASC LIMIT 30""",
        (user['id'], hoje)).fetchall()

    followups = []
    for f in followups_hoje:
        atrasado = f['data_hora'][:10] < hoje if f['data_hora'] else False
        # Buscar número da proposta/OV vinculada se houver
        vinculo_label = ''
        vinculo_id = None
        if f['vinculo_tipo'] == 'proposta' and f['vinculo_id']:
            p = conn.execute("SELECT id, numero FROM propostas WHERE id=?", (f['vinculo_id'],)).fetchone()
            if p:
                vinculo_label = p['numero']
                vinculo_id = p['id']
        elif f['vinculo_tipo'] == 'ov' and f['vinculo_id']:
            o = conn.execute("SELECT id, numero FROM ordens_venda WHERE id=?", (f['vinculo_id'],)).fetchone()
            if o:
                vinculo_label = o['numero']
                vinculo_id = o['id']
        followups.append({
            'id': f['id'], 'acao': f['acao'], 'data_hora': f['data_hora'],
            'vinculo_tipo': f['vinculo_tipo'], 'vinculo_id': vinculo_id,
            'vinculo_label': vinculo_label, 'cliente': f['razao_social'],
            'atrasado': atrasado
        })

    # 2. Propostas aguardando ação do vendedor (Elaboração, Negociação)
    vend_filter = "AND p.vendedor_id = ?" if user['perfil'] == 'vendedor' else ''
    vend_params = [user['id']] if user['perfil'] == 'vendedor' else []

    # Buscar propostas pendentes com status Rascunho, Elaboração, Negociação, Enviada
    propostas_pendentes = conn.execute(
        f"""SELECT p.id, p.numero, p.tipo, p.status, p.data_emissao,
            c.razao_social,
            (SELECT COALESCE(SUM(pi.valor_total),0) FROM proposta_items pi WHERE pi.proposta_id=p.id) as valor_total
        FROM propostas p
        LEFT JOIN cadastros c ON p.cadastro_id = c.id
        WHERE p.status IN ('Rascunho','Elaboração','Negociação','Enviada') {vend_filter}
        ORDER BY p.data_emissao DESC LIMIT 15""",
        vend_params).fetchall()

    propostas = [{'id': p['id'], 'numero': p['numero'], 'tipo': p['tipo'],
                  'status': p['status'], 'data': p['data_emissao'],
                  'valor': p['valor_total'], 'cliente': p['razao_social']}
                 for p in propostas_pendentes]

    # 3. Resumo do mês (propostas, OVs, conversão)
    vend_filter_raw = "AND vendedor_id = ?" if user['perfil'] == 'vendedor' else ''
    props_mes = conn.execute(
        f"SELECT COUNT(*) as c FROM propostas WHERE strftime('%m',data_emissao)=? AND strftime('%Y',data_emissao)=? {vend_filter_raw}",
        [f'{mes:02d}', str(ano)] + vend_params).fetchone()['c']

    ov_vend_filter = vend_filter.replace('p.vendedor_id', 'ov.vendedor_id')
    ovs_mes = conn.execute(
        f"""SELECT COUNT(*) as qtd, COALESCE(SUM(i.valor_total),0) as total,
            COALESCE(SUM(i.comissao_valor),0) as comissao
        FROM ordens_venda ov JOIN ov_items i ON i.ov_id = ov.id
        WHERE strftime('%m',ov.data_emissao)=? AND strftime('%Y',ov.data_emissao)=?
        AND ov.status != 'Cancelada' {ov_vend_filter}""",
        [f'{mes:02d}', str(ano)] + vend_params).fetchone()

    # Conversão do mês: propostas convertidas vs criadas
    props_convertidas = conn.execute(
        f"SELECT COUNT(*) as c FROM propostas WHERE status='Convertida' AND strftime('%m',data_emissao)=? AND strftime('%Y',data_emissao)=? {vend_filter_raw}",
        [f'{mes:02d}', str(ano)] + vend_params).fetchone()['c']
    taxa_conversao = round(props_convertidas / props_mes * 100) if props_mes > 0 else 0

    # Meta do mês (tabela metas) — chave mes no formato 'YYYY-MM'
    mes_key = f'{ano}-{mes:02d}'
    meta_row = conn.execute(
        "SELECT meta_mensal, meta_semanal FROM metas WHERE user_id=? AND mes=?",
        (user['id'], mes_key)).fetchone()
    meta_mensal = meta_row['meta_mensal'] if meta_row else 0
    meta_semanal = meta_row['meta_semanal'] if meta_row else 0
    pct_meta = round(ovs_mes['total'] / meta_mensal * 100) if meta_mensal and meta_mensal > 0 else 0

    # 4. Recompra — clientes que passaram do ciclo
    recompra_rows = conn.execute(f"""
        SELECT ov.cadastro_id, c.razao_social, c.contato_whatsapp, ov.data_emissao
        FROM ordens_venda ov
        JOIN cadastros c ON ov.cadastro_id = c.id
        WHERE ov.status != 'Cancelada' {ov_vend_filter}
        ORDER BY ov.cadastro_id, ov.data_emissao
    """, vend_params).fetchall()

    compras_por_cliente = defaultdict(list)
    cliente_info = {}
    for r in recompra_rows:
        compras_por_cliente[r['cadastro_id']].append(r['data_emissao'])
        cliente_info[r['cadastro_id']] = {'nome': r['razao_social'], 'whatsapp': r['contato_whatsapp']}

    recompra = []
    for cad_id, datas_str in compras_por_cliente.items():
        if len(datas_str) < 2:
            continue
        datas = sorted([datetime.strptime(d[:10], '%Y-%m-%d') for d in datas_str])
        intervalos = [(datas[i+1] - datas[i]).days for i in range(len(datas)-1)]
        avg_freq = sum(intervalos) / len(intervalos)
        if avg_freq < 1:
            continue
        days_since = (now - datas[-1]).days
        atraso = days_since - round(avg_freq)
        if atraso >= 10:
            info = cliente_info[cad_id]
            recompra.append({
                'cadastro_id': cad_id, 'nome': info['nome'], 'whatsapp': info['whatsapp'],
                'frequencia_media': round(avg_freq), 'dias_sem_comprar': days_since,
                'atraso_dias': atraso, 'nivel': 'risco' if atraso > 30 else 'atencao'
            })
    recompra.sort(key=lambda x: x['atraso_dias'], reverse=True)

    return jsonify({
        'followups': followups,
        'propostas': propostas,
        'resumo_mes': {
            'propostas_criadas': props_mes,
            'propostas_convertidas': props_convertidas,
            'taxa_conversao': taxa_conversao,
            'ovs_qtd': ovs_mes['qtd'],
            'ovs_total': ovs_mes['total'],
            'comissao_estimada': ovs_mes['comissao'],
            'meta_mensal': meta_mensal,
            'meta_semanal': meta_semanal,
            'pct_meta': pct_meta,
            'mes': mes, 'ano': ano
        },
        'recompra': recompra[:10]
    })


# ============ CADASTROS (CLIENTS/SUPPLIERS) ============

@app.route('/api/cadastros', methods=['GET'])
@login_required
def list_cadastros():
    conn = get_db()
    page = int(request.args.get('page', 1))
    per_page = min(int(request.args.get('per_page', 30)), 100)
    search = request.args.get('search', '')
    status = request.args.get('status', '')

    user = get_current_user()
    query = "SELECT * FROM cadastros WHERE 1=1"
    params = []

    # Vendedor vê cadastros onde é responsável OU tem propostas/OVs vinculadas
    if user['perfil'] == 'vendedor':
        query += """ AND (vendedor_responsavel_id=? OR id IN (
            SELECT DISTINCT cadastro_id FROM propostas WHERE vendedor_id=?
            UNION SELECT DISTINCT cadastro_id FROM ordens_venda WHERE vendedor_id=?))"""
        params += [user['id'], user['id'], user['id']]

    if search:
        # Strip formatting for CNPJ/CPF search (digits only match)
        search_digits = ''.join(c for c in search if c.isdigit())
        if search_digits and len(search_digits) >= 11:
            query += " AND REPLACE(REPLACE(REPLACE(cnpj_cpf, '.', ''), '/', ''), '-', '') LIKE ?"
            params += [f'%{search_digits}%']
        else:
            query += " AND (razao_social LIKE ? OR nome_fantasia LIKE ? OR cnpj_cpf LIKE ?)"
            s = f'%{search}%'
            params += [s, s, s]
    if status:
        query += " AND status = ?"
        params.append(status)

    segmento = request.args.get('segmento', '')
    if segmento == '_sem':
        query += " AND (segmento IS NULL OR segmento = '')"
    elif segmento:
        query += " AND segmento = ?"
        params.append(segmento)

    papel = request.args.get('papel', '')
    if papel == 'cliente':
        query += " AND id IN (SELECT DISTINCT cadastro_id FROM ordens_venda WHERE status != 'Cancelada')"
    elif papel == 'fornecedor':
        query += " AND id IN (SELECT DISTINCT cadastro_id FROM ordens_compra WHERE status != 'Cancelada')"
    elif papel == 'ambos':
        query += " AND id IN (SELECT DISTINCT cadastro_id FROM ordens_venda WHERE status != 'Cancelada') AND id IN (SELECT DISTINCT cadastro_id FROM ordens_compra WHERE status != 'Cancelada')"

    total = conn.execute(query.replace("SELECT *", "SELECT COUNT(*) as c"), params).fetchone()['c']
    query += " ORDER BY razao_social LIMIT ? OFFSET ?"
    params += [per_page, (page - 1) * per_page]

    rows = conn.execute(query, params).fetchall()
    items = [dict(r) for r in rows]

    # Enrich with role info (cliente/fornecedor/ambos) + LTV health
    if items:
        ids = [i['id'] for i in items]
        placeholders = ','.join('?' * len(ids))
        # Check which cadastros appear in OVs (cliente)
        clientes_ids = set(r['cadastro_id'] for r in conn.execute(
            f"SELECT DISTINCT cadastro_id FROM ordens_venda WHERE cadastro_id IN ({placeholders}) AND status!='Cancelada'", ids).fetchall())
        # Check which cadastros appear in OCs (fornecedor)
        fornecedores_ids = set(r['cadastro_id'] for r in conn.execute(
            f"SELECT DISTINCT cadastro_id FROM ordens_compra WHERE cadastro_id IN ({placeholders}) AND status!='Cancelada'", ids).fetchall())

        # LTV: bulk fetch last purchase date + purchase count + total value per cadastro
        ltv_rows = conn.execute(f"""
            SELECT ov.cadastro_id,
                MAX(ov.data_emissao) as ultima_compra,
                COUNT(DISTINCT ov.id) as total_pedidos,
                COALESCE(SUM(it.total), 0) as ltv_total
            FROM ordens_venda ov
            LEFT JOIN (SELECT ov_id, SUM(valor_total) as total FROM ov_items GROUP BY ov_id) it ON it.ov_id = ov.id
            WHERE ov.cadastro_id IN ({placeholders}) AND ov.status != 'Cancelada'
            GROUP BY ov.cadastro_id
        """, ids).fetchall()
        ltv_map = {r['cadastro_id']: dict(r) for r in ltv_rows}

        # LTV: bulk fetch all purchase dates for frequency calculation (clients with 2+ OVs)
        freq_rows = conn.execute(f"""
            SELECT cadastro_id, data_emissao
            FROM ordens_venda
            WHERE cadastro_id IN ({placeholders}) AND status != 'Cancelada'
            ORDER BY cadastro_id, data_emissao
        """, ids).fetchall()
        compras_por_cad = defaultdict(list)
        for r in freq_rows:
            compras_por_cad[r['cadastro_id']].append(r['data_emissao'])

        hoje = datetime.now()

        for item in items:
            is_cliente = item['id'] in clientes_ids
            is_fornecedor = item['id'] in fornecedores_ids
            if is_cliente and is_fornecedor:
                item['papel'] = 'Ambos'
            elif is_fornecedor:
                item['papel'] = 'Fornecedor'
            elif is_cliente:
                item['papel'] = 'Cliente'
            else:
                item['papel'] = None

            # LTV health data
            ltv = ltv_map.get(item['id'])
            if ltv and ltv['ultima_compra']:
                last_dt = datetime.strptime(ltv['ultima_compra'][:10], '%Y-%m-%d')
                item['dias_sem_comprar'] = (hoje - last_dt).days
                item['ltv_total'] = ltv['ltv_total']
                item['total_pedidos'] = ltv['total_pedidos']

                # Calculate average frequency from individual purchase dates
                datas_str = compras_por_cad.get(item['id'], [])
                if len(datas_str) >= 2:
                    datas = sorted([datetime.strptime(d[:10], '%Y-%m-%d') for d in datas_str])
                    intervalos = [(datas[i+1] - datas[i]).days for i in range(len(datas)-1)]
                    avg_freq = sum(intervalos) / len(intervalos)
                    item['frequencia_media'] = round(avg_freq)
                    atraso = item['dias_sem_comprar'] - round(avg_freq)
                    if atraso > 30:
                        item['saude'] = 'risco'
                    elif atraso > 10:
                        item['saude'] = 'atencao'
                    else:
                        item['saude'] = 'ok'
                else:
                    item['frequencia_media'] = None
                    item['saude'] = None
            else:
                item['dias_sem_comprar'] = None
                item['ltv_total'] = 0
                item['total_pedidos'] = 0
                item['frequencia_media'] = None
                item['saude'] = None

    conn.close()
    return jsonify({'items': items, 'total': total, 'page': page})

@app.route('/api/cadastros', methods=['POST'])
@login_required
def create_cadastro():
    data = request.json
    conn = get_db()
    user = get_current_user()

    # Validate CNPJ/CPF
    if data.get('cnpj_cpf'):
        is_valid, cleaned = validar_cnpj_cpf(data['cnpj_cpf'])
        if not is_valid:
            conn.close()
            return jsonify({'error': 'CNPJ/CPF inválido — verifique os dígitos'}), 400
        data['cnpj_cpf'] = cleaned

    # Check duplicate CNPJ
    existing = conn.execute("SELECT id FROM cadastros WHERE cnpj_cpf=?", (data['cnpj_cpf'],)).fetchone()
    if existing:
        conn.close()
        return jsonify({'error': 'CNPJ/CPF já cadastrado', 'id': existing['id']}), 409

    conn.execute('''INSERT INTO cadastros (cnpj_cpf, tipo_pessoa, razao_social, nome_fantasia,
        inscricao_estadual, endereco_cep, endereco_rua, endereco_numero, endereco_complemento,
        endereco_bairro, endereco_cidade, endereco_uf, contato_nome, contato_cargo,
        contato_telefone, contato_whatsapp, contato_email, contatos_adicionais, segmento,
        tags, vendedor_responsavel_id, observacoes, limite_faturamento, status, regime_tributario)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''',
        (data['cnpj_cpf'], data.get('tipo_pessoa', 'PJ'), data['razao_social'],
         data.get('nome_fantasia'), data.get('inscricao_estadual'),
         data.get('endereco_cep'), data.get('endereco_rua'), data.get('endereco_numero'),
         data.get('endereco_complemento'), data.get('endereco_bairro'),
         data.get('endereco_cidade'), data.get('endereco_uf'),
         data.get('contato_nome'), data.get('contato_cargo'),
         data.get('contato_telefone'), data.get('contato_whatsapp'),
         data.get('contato_email'), json.dumps(data.get('contatos_adicionais', [])),
         data.get('segmento'), json.dumps(data.get('tags', [])),
         data.get('vendedor_responsavel_id', user['id']),
         data.get('observacoes'), data.get('limite_faturamento'), 'Ativo',
         data.get('regime_tributario')))

    cid = conn.execute("SELECT last_insert_rowid() as id").fetchone()['id']
    conn.commit()

    # Update FTS
    update_fts('cadastro', cid, f"{data['cnpj_cpf']} {data['razao_social']} {data.get('nome_fantasia','')} {data.get('contato_nome','')}")

    conn.close()
    return jsonify({'ok': True, 'id': cid}), 201

@app.route('/api/cadastros/<int:id>', methods=['GET'])
@login_required
def get_cadastro(id):
    conn = get_db()
    row = conn.execute("SELECT * FROM cadastros WHERE id=?", (id,)).fetchone()
    if not row:
        conn.close()
        return jsonify({'error': 'Não encontrado'}), 404

    cadastro = dict(row)

    # CRM: Visão Comercial de Crédito
    # Parcelas com vencimento futuro = crédito tomado (assumimos que não foi pago ainda)
    # Parcelas com vencimento passado = crédito liberado (assumimos que já foi pago)
    hoje = datetime.now().strftime('%Y-%m-%d')

    credito_tomado = conn.execute(
        """SELECT COALESCE(SUM(p.valor),0) as total FROM ov_parcelas p
           JOIN ordens_venda ov ON p.ov_id=ov.id
           WHERE ov.cadastro_id=? AND ov.status!='Cancelada' AND date(p.data_vencimento) >= ?""",
        (id, hoje)).fetchone()['total']
    credito_liberado = conn.execute(
        """SELECT COALESCE(SUM(p.valor),0) as total FROM ov_parcelas p
           JOIN ordens_venda ov ON p.ov_id=ov.id
           WHERE ov.cadastro_id=? AND ov.status!='Cancelada' AND date(p.data_vencimento) < ?""",
        (id, hoje)).fetchone()['total']

    cadastro['credito_tomado'] = credito_tomado
    cadastro['credito_liberado'] = credito_liberado
    cadastro['limite_tomado'] = credito_tomado  # backward compat
    if cadastro['limite_faturamento']:
        cadastro['limite_disponivel'] = cadastro['limite_faturamento'] - credito_tomado
    else:
        cadastro['limite_disponivel'] = None

    # Próximas parcelas a vencer (crédito que vai liberar)
    proximas_parcelas = conn.execute(
        """SELECT p.valor, p.data_vencimento, p.numero_parcela, p.total_parcelas, ov.numero as ov_numero
           FROM ov_parcelas p JOIN ordens_venda ov ON p.ov_id=ov.id
           WHERE ov.cadastro_id=? AND ov.status!='Cancelada' AND date(p.data_vencimento) >= ?
           ORDER BY p.data_vencimento ASC LIMIT 10""", (id, hoje)).fetchall()
    cadastro['proximas_parcelas'] = [dict(r) for r in proximas_parcelas]

    # Próxima data que libera crédito significativo
    if proximas_parcelas:
        cadastro['proxima_liberacao'] = proximas_parcelas[0]['data_vencimento']
        cadastro['valor_proxima_liberacao'] = proximas_parcelas[0]['valor']
    else:
        cadastro['proxima_liberacao'] = None
        cadastro['valor_proxima_liberacao'] = 0

    # Last transactions
    ultimas_ovs = conn.execute(
        "SELECT id, numero, data_emissao, (SELECT COALESCE(SUM(valor_total),0) FROM ov_items WHERE ov_id=ordens_venda.id) as valor_total FROM ordens_venda WHERE cadastro_id=? AND status!='Cancelada' ORDER BY data_emissao DESC LIMIT 5",
        (id,)).fetchall()
    cadastro['ultimas_ovs'] = [dict(r) for r in ultimas_ovs]

    # Parcelas pendentes (visão comercial - próximas a vencer)
    parcelas_list = conn.execute(
        """SELECT p.*, ov.numero as ov_numero FROM ov_parcelas p
           JOIN ordens_venda ov ON p.ov_id=ov.id
           WHERE ov.cadastro_id=? AND ov.status!='Cancelada' AND date(p.data_vencimento) >= ?
           ORDER BY p.data_vencimento LIMIT 10""", (id, hoje)).fetchall()
    cadastro['parcelas_abertas'] = [dict(r) for r in parcelas_list]

    # Price history by category (last 3 per category)
    historico = conn.execute(
        """SELECT oi.categoria, oi.valor_unitario, oi.unidade, ov.data_emissao
           FROM ov_items oi JOIN ordens_venda ov ON oi.ov_id=ov.id
           WHERE ov.cadastro_id=? AND ov.status!='Cancelada'
           ORDER BY ov.data_emissao DESC LIMIT 30""", (id,)).fetchall()
    cadastro['historico_precos'] = [dict(r) for r in historico]

    # Annual summary (calculated live)
    ano = datetime.now().year
    resumo = conn.execute(
        """SELECT COUNT(*) as total_ovs, COALESCE(SUM(
            (SELECT COALESCE(SUM(valor_total),0) FROM ov_items WHERE ov_id=ordens_venda.id)
        ),0) as total_valor FROM ordens_venda
        WHERE cadastro_id=? AND strftime('%Y',data_emissao)=? AND status!='Cancelada'""",
        (id, str(ano))).fetchone()
    cadastro['resumo_anual'] = {'total_ovs': resumo['total_ovs'], 'total_valor': resumo['total_valor'], 'ano': ano}

    # === Dual Role: Cliente/Fornecedor detection ===
    total_vendido = conn.execute(
        """SELECT COUNT(*) as qtd, COALESCE(SUM(
            (SELECT COALESCE(SUM(valor_total),0) FROM ov_items WHERE ov_id=ordens_venda.id)
        ),0) as valor FROM ordens_venda WHERE cadastro_id=? AND status!='Cancelada'""", (id,)).fetchone()

    total_comprado = conn.execute(
        """SELECT COUNT(*) as qtd, COALESCE(SUM(
            (SELECT COALESCE(SUM(valor_total),0) FROM oc_items WHERE oc_id=ordens_compra.id)
        ),0) as valor FROM ordens_compra WHERE cadastro_id=? AND status!='Cancelada'""", (id,)).fetchone()

    is_cliente = total_vendido['qtd'] > 0
    is_fornecedor = total_comprado['qtd'] > 0

    if is_cliente and is_fornecedor:
        cadastro['papel'] = 'Ambos'
    elif is_fornecedor:
        cadastro['papel'] = 'Fornecedor'
    elif is_cliente:
        cadastro['papel'] = 'Cliente'
    else:
        cadastro['papel'] = None

    cadastro['total_vendido_valor'] = total_vendido['valor']
    cadastro['total_vendido_qtd'] = total_vendido['qtd']
    cadastro['total_comprado_valor'] = total_comprado['valor']
    cadastro['total_comprado_qtd'] = total_comprado['qtd']
    cadastro['saldo_relacionamento'] = total_vendido['valor'] - total_comprado['valor']

    # === LTV Health: frequency, days since last purchase, timeline ===
    if is_cliente:
        all_ov_dates = conn.execute(
            """SELECT data_emissao FROM ordens_venda
               WHERE cadastro_id=? AND status!='Cancelada' ORDER BY data_emissao""",
            (id,)).fetchall()
        datas = [datetime.strptime(r['data_emissao'][:10], '%Y-%m-%d') for r in all_ov_dates]
        if datas:
            cadastro['dias_sem_comprar'] = (datetime.now() - datas[-1]).days
            cadastro['ltv_total'] = total_vendido['valor']
            cadastro['total_pedidos_historico'] = total_vendido['qtd']
            if len(datas) >= 2:
                intervalos = [(datas[i+1] - datas[i]).days for i in range(len(datas)-1)]
                avg_freq = sum(intervalos) / len(intervalos)
                cadastro['frequencia_media'] = round(avg_freq)
                atraso = cadastro['dias_sem_comprar'] - round(avg_freq)
                cadastro['atraso_ciclo'] = max(0, atraso)
                if atraso > 30:
                    cadastro['saude'] = 'risco'
                elif atraso > 10:
                    cadastro['saude'] = 'atencao'
                else:
                    cadastro['saude'] = 'ok'
            else:
                cadastro['frequencia_media'] = None
                cadastro['saude'] = None
                cadastro['atraso_ciclo'] = 0

            # Timeline: last 12 months purchase activity
            timeline = []
            agora = datetime.now()
            for i in range(11, -1, -1):
                mes_dt = agora - timedelta(days=i*30)
                m, y = mes_dt.month, mes_dt.year
                count = sum(1 for d in datas if d.month == m and d.year == y)
                valor_mes = conn.execute(
                    """SELECT COALESCE(SUM(it.total),0) as v FROM ordens_venda ov
                       LEFT JOIN (SELECT ov_id, SUM(valor_total) as total FROM ov_items GROUP BY ov_id) it ON it.ov_id=ov.id
                       WHERE ov.cadastro_id=? AND ov.status!='Cancelada'
                       AND strftime('%m',ov.data_emissao)=? AND strftime('%Y',ov.data_emissao)=?""",
                    (id, f'{m:02d}', str(y))).fetchone()['v']
                timeline.append({'mes': f'{m:02d}/{y}', 'pedidos': count, 'valor': valor_mes})
            cadastro['timeline_compras'] = timeline

            # Last OV id for "repetir pedido"
            last_ov = conn.execute(
                "SELECT id FROM ordens_venda WHERE cadastro_id=? AND status!='Cancelada' ORDER BY data_emissao DESC LIMIT 1",
                (id,)).fetchone()
            cadastro['ultima_ov_id'] = last_ov['id'] if last_ov else None
        else:
            cadastro['dias_sem_comprar'] = None
            cadastro['saude'] = None
            cadastro['timeline_compras'] = []
            cadastro['ultima_ov_id'] = None

    # Last purchases (OCs) for this cadastro as supplier
    if is_fornecedor:
        ultimas_ocs = conn.execute(
            """SELECT oc.id, oc.numero, oc.data_emissao,
               (SELECT COALESCE(SUM(valor_total),0) FROM oc_items WHERE oc_id=oc.id) as valor_total
               FROM ordens_compra oc WHERE oc.cadastro_id=? AND oc.status!='Cancelada'
               ORDER BY oc.data_emissao DESC LIMIT 5""", (id,)).fetchall()
        cadastro['ultimas_ocs'] = [dict(r) for r in ultimas_ocs]

        # Purchase price history
        hist_compras = conn.execute(
            """SELECT oi.categoria, oi.valor_unitario, oi.unidade, oc.data_emissao
               FROM oc_items oi JOIN ordens_compra oc ON oi.oc_id=oc.id
               WHERE oc.cadastro_id=? AND oc.status!='Cancelada'
               ORDER BY oc.data_emissao DESC LIMIT 30""", (id,)).fetchall()
        cadastro['historico_precos_compra'] = [dict(r) for r in hist_compras]

        # Annual purchase summary
        resumo_compra = conn.execute(
            """SELECT COUNT(*) as total_ocs, COALESCE(SUM(
                (SELECT COALESCE(SUM(valor_total),0) FROM oc_items WHERE oc_id=ordens_compra.id)
            ),0) as total_valor FROM ordens_compra
            WHERE cadastro_id=? AND strftime('%Y',data_emissao)=? AND status!='Cancelada'""",
            (id, str(ano))).fetchone()
        cadastro['resumo_anual_compra'] = {'total_ocs': resumo_compra['total_ocs'], 'total_valor': resumo_compra['total_valor'], 'ano': ano}

    conn.close()
    return jsonify(cadastro)

@app.route('/api/cadastros/<int:id>', methods=['PUT'])
@login_required
def update_cadastro(id):
    data = request.json
    user = get_current_user()
    conn = get_db()
    try:
        # Ownership check: vendedor só edita cadastros sob sua responsabilidade
        cad_row = conn.execute("SELECT vendedor_responsavel_id FROM cadastros WHERE id=?", (id,)).fetchone()
        if not cad_row:
            return jsonify({'error': 'Cadastro não encontrado'}), 404
        if user['perfil'] == 'vendedor' and cad_row['vendedor_responsavel_id'] and cad_row['vendedor_responsavel_id'] != user['id']:
            return jsonify({'error': 'Sem permissão para editar cliente de outro vendedor'}), 403

        fields = []
        params = []
        updatable = ['razao_social','nome_fantasia','inscricao_estadual','endereco_cep','endereco_rua',
                     'endereco_numero','endereco_complemento','endereco_bairro','endereco_cidade','endereco_uf',
                     'contato_nome','contato_cargo','contato_telefone','contato_whatsapp','contato_email',
                     'segmento','observacoes','limite_faturamento','status','vendedor_responsavel_id','dias_inadimplencia',
                     'regime_tributario']
        # Vendedor não pode reassinar responsável nem mudar status/limite
        if user['perfil'] == 'vendedor':
            updatable = [f for f in updatable if f not in ('vendedor_responsavel_id', 'status', 'limite_faturamento')]
        for f in updatable:
            if f in data:
                fields.append(f"{f}=?")
                params.append(data[f])
        if 'tags' in data:
            fields.append("tags=?")
            params.append(json.dumps(data['tags']))
        if 'contatos_adicionais' in data:
            fields.append("contatos_adicionais=?")
            params.append(json.dumps(data['contatos_adicionais']))

        fields.append("updated_at=datetime('now','localtime')")
        params.append(id)
        conn.execute(f"UPDATE cadastros SET {', '.join(fields)} WHERE id=?", params)

        # Audit log for cadastro changes
        user = get_current_user()
        conn.execute("INSERT INTO audit_log (user_id, acao, entidade_tipo, entidade_id, detalhes) VALUES (?,?,?,?,?)",
                     (user['id'], 'editar', 'cadastro', id, json.dumps({k: data[k] for k in data if k in updatable or k in ('tags', 'contatos_adicionais')})))
        conn.commit()

        # Update FTS index with new data
        try:
            cad = conn.execute("SELECT razao_social, cnpj_cpf, nome_fantasia FROM cadastros WHERE id=?", (id,)).fetchone()
            if cad:
                update_fts('cadastro', id, f"{cad['razao_social']} {cad['cnpj_cpf']} {cad['nome_fantasia'] or ''}")
        except Exception:
            pass
        return jsonify({'ok': True})
    except Exception as e:
        conn.rollback()
        app.logger.exception('Erro interno'); return jsonify({'error': 'Erro interno do servidor'}), 500
    finally:
        conn.close()

# ============ PROPOSALS ============

@app.route('/api/propostas', methods=['GET'])
@login_required
def list_propostas():
    user = get_current_user()
    conn = get_db()
    page = int(request.args.get('page', 1))
    per_page = min(int(request.args.get('per_page', 30)), 100)
    tipo = request.args.get('tipo', '')
    status = request.args.get('status', '')
    search = request.args.get('search', '')
    # Bloqueia propostas de COMPRA para quem não tem permissão
    if tipo == 'COMPRA' and not user_has_permission('ver_compras'):
        conn.close()
        return jsonify({'error': 'Você não tem permissão para acessar compras'}), 403
    # Vendedor SEMPRE vê só as suas — sem bypass por query param
    only_mine = 'true' if user['perfil'] == 'vendedor' else request.args.get('only_mine', 'false')

    query = """SELECT p.*, c.razao_social, c.nome_fantasia, u.nome as vendedor_nome,
        COALESCE((SELECT SUM(valor_total) FROM proposta_items WHERE proposta_id=p.id),0) as valor_total,
        COALESCE((SELECT SUM(peso_total) FROM proposta_items WHERE proposta_id=p.id),0) as peso_total
        FROM propostas p LEFT JOIN cadastros c ON p.cadastro_id=c.id LEFT JOIN users u ON p.vendedor_id=u.id WHERE 1=1"""
    params = []

    if tipo:
        query += " AND p.tipo=?"
        params.append(tipo)
    if status:
        query += " AND p.status=?"
        params.append(status)
    if search:
        query += " AND (p.numero LIKE ? OR c.razao_social LIKE ? OR c.nome_fantasia LIKE ?)"
        s = f'%{search}%'
        params += [s, s, s]
    cadastro_id = request.args.get('cadastro_id', '')
    if cadastro_id:
        query += " AND p.cadastro_id=?"
        params.append(int(cadastro_id))
    if only_mine == 'true':
        query += " AND p.vendedor_id=?"
        params.append(user['id'])

    # Check expiration on read — wrapped in try/except so failures don't block listing
    try:
        conn.execute("""UPDATE propostas SET status='Expirada'
                        WHERE status IN ('Rascunho','Enviada','Em Negociação')
                        AND data_expiracao IS NOT NULL AND date(data_expiracao) < date('now','localtime')""")
        conn.commit()
    except Exception:
        pass  # Expiration will be retried on next request

    try:
        # Build count query by finding the main FROM clause
        from_idx = query.index('FROM propostas p')
        count_query = "SELECT COUNT(*) as c " + query[from_idx:]
        total = conn.execute(count_query, params).fetchone()['c']

        query += " ORDER BY p.updated_at DESC LIMIT ? OFFSET ?"
        params += [per_page, (page - 1) * per_page]
        rows = conn.execute(query, params).fetchall()

        results = [dict(r) for r in rows]
    finally:
        conn.close()
    return jsonify({'items': results, 'total': total, 'page': page})

@app.route('/api/propostas', methods=['POST'])
@login_required
def create_proposta():
    data = request.json
    user = get_current_user()
    conn = get_db()

    validade = data.get('validade_dias', 7)
    data_exp = (datetime.now() + timedelta(days=validade)).strftime('%Y-%m-%d')

    try:
        conn.execute("BEGIN IMMEDIATE")
        numero = get_next_number('PROP', conn)
        conn.execute('''INSERT INTO propostas (numero, tipo, cadastro_id, vendedor_id, uf_destino,
            icms_isento, proposta_vinculada_id, validade_dias, data_expiracao, condicao_pagamento,
            forma_pagamento, dados_pagamento, frete, transportadora, valor_frete, obs_transporte,
            prazo_entrega, garantia, obs_cliente, obs_interna, incluir_dados_bancarios,
            incluir_politica, mostrar_impostos, intermediario_id, valor_bruto_venda,
            valor_liquido_venda, comissao_forma, intermediario_obs,
            juros_total, valor_liquido_abmt, taxa_juros_aplicada, data_base_faturamento)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''',
            (numero, data['tipo'], data.get('cadastro_id'),
             data.get('vendedor_id', user['id']) if user['perfil'] != 'vendedor' else user['id'],
             data.get('uf_destino'), data.get('icms_isento', 0), data.get('proposta_vinculada_id'),
             validade, data_exp, json.dumps(data.get('condicao_pagamento', {})),
             data.get('forma_pagamento', 'Faturado'), json.dumps(data.get('dados_pagamento', {})),
             data.get('frete', 'FOB'), data.get('transportadora'), data.get('valor_frete'),
             data.get('obs_transporte'), data.get('prazo_entrega'), data.get('garantia'),
             data.get('obs_cliente'), data.get('obs_interna'),
             data.get('incluir_dados_bancarios', 0), data.get('incluir_politica', 0),
             data.get('mostrar_impostos', 1), data.get('intermediario_id'),
             data.get('valor_bruto_venda'), data.get('valor_liquido_venda'),
             data.get('comissao_forma'), data.get('intermediario_obs'),
             data.get('juros_total', 0), data.get('valor_liquido_abmt', 0),
             data.get('taxa_juros_aplicada', 0), data.get('data_base_faturamento')))

        prop_id = conn.execute("SELECT last_insert_rowid() as id").fetchone()['id']

        # Insert items
        for i, item in enumerate(data.get('items', [])):
            _insert_proposta_item(conn, prop_id, i, item)

        # Compute juros_total from generated parcelas — backend é a fonte de verdade
        # (mantém o card de Custo Financeiro consistente com as parcelas reais).
        # Só VENDA tem juros; compra é à vista/sem juros.
        if data['tipo'] == 'VENDA':
            _atualizar_juros_proposta(conn, prop_id, data.get('condicao_pagamento', {}),
                                      data.get('data_base_faturamento'), data.get('taxa_juros_aplicada'))

        # Log
        conn.execute("INSERT INTO proposta_log (proposta_id, user_id, acao, detalhes) VALUES (?,?,?,?)",
                     (prop_id, user['id'], 'Criação', f'Proposta {numero} criada'))
        conn.commit()

        # FTS update inside same connection before closing
        try:
            cadastro = conn.execute("SELECT razao_social, cnpj_cpf FROM cadastros WHERE id=?", (data.get('cadastro_id'),)).fetchone()
            if cadastro:
                update_fts('proposta', prop_id, f"{numero} {cadastro['razao_social']} {cadastro['cnpj_cpf']}")
        except Exception:
            pass  # FTS failure shouldn't block proposta creation
    except Exception as e:
        conn.rollback()
        return jsonify({'error': 'Erro ao salvar: ' + str(e)}), 500
    finally:
        conn.close()
    return jsonify({'ok': True, 'id': prop_id, 'numero': numero}), 201


def _insert_proposta_item(conn, proposta_id, ordem, item):
    qtd = float(item.get('quantidade', 0))
    val_unit = float(item.get('valor_unitario', 0))
    peso_unit = item.get('peso_unitario')
    unidade = item.get('unidade', 'UNIDADE')

    # Calculate peso_total
    if unidade == 'KG':
        peso_total = qtd
    elif unidade == 'LITRO':
        peso_total = None
    elif peso_unit:
        peso_total = float(peso_unit) * qtd
    else:
        peso_total = None

    # Calculate valor_total
    desconto = float(item.get('desconto_valor', 0))
    desc_tipo = item.get('desconto_tipo')
    # When unit is KVA, val_unit = price per kVA → multiply by potência to get real value
    campos = item.get('campos_especificos', {})
    if unidade == 'KVA':
        potencia = float(campos.get('potencia', 0))
        if potencia > 0:
            valor_bruto = qtd * potencia * val_unit
        else:
            valor_bruto = qtd * val_unit
    else:
        valor_bruto = qtd * val_unit
    if desc_tipo == 'percentual':
        valor_total = valor_bruto * (1 - desconto / 100)
    elif desc_tipo == 'valor':
        valor_total = valor_bruto - desconto
    else:
        valor_total = valor_bruto

    # Add embalagem cost for Óleo Isolante
    embalagem_custo = float(campos.get('embalagem_custo_total', 0))
    if embalagem_custo > 0:
        valor_total += embalagem_custo

    conn.execute('''INSERT INTO proposta_items (proposta_id, ordem, categoria, campos_especificos,
        descricao_complementar, peso_unitario, peso_total, quantidade, unidade, valor_unitario,
        desconto_tipo, desconto_valor, valor_total)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)''',
        (proposta_id, ordem, item['categoria'], json.dumps(item.get('campos_especificos', {})),
         item.get('descricao_complementar'), peso_unit, peso_total, qtd, unidade,
         val_unit, desc_tipo, desconto, valor_total))


@app.route('/api/propostas/<int:id>', methods=['GET'])
@login_required
def get_proposta(id):
    conn = get_db()

    # Check expiration on read
    conn.execute("""UPDATE propostas SET status='Expirada'
                    WHERE id=? AND status IN ('Rascunho','Enviada','Em Negociação')
                    AND data_expiracao IS NOT NULL AND date(data_expiracao) < date('now','localtime')""", (id,))
    conn.commit()

    row = conn.execute("""SELECT p.*, c.razao_social, c.nome_fantasia, c.cnpj_cpf as cliente_cnpj,
        c.contato_whatsapp, c.contato_nome as cliente_contato, c.endereco_uf as cliente_uf,
        c.regime_tributario as cliente_regime_tributario,
        u.nome as vendedor_nome, u.perfil as vendedor_perfil,
        ci.razao_social as intermediario_nome
        FROM propostas p LEFT JOIN cadastros c ON p.cadastro_id=c.id
        LEFT JOIN users u ON p.vendedor_id=u.id
        LEFT JOIN cadastros ci ON p.intermediario_id=ci.id WHERE p.id=?""", (id,)).fetchone()

    if not row:
        conn.close()
        return jsonify({'error': 'Não encontrada'}), 404

    proposta = dict(row)
    proposta['items'] = [dict(r) for r in conn.execute("SELECT * FROM proposta_items WHERE proposta_id=? ORDER BY ordem", (id,)).fetchall()]
    proposta['log'] = [dict(r) for r in conn.execute("SELECT l.*, u.nome as user_nome FROM proposta_log l LEFT JOIN users u ON l.user_id=u.id WHERE proposta_id=? ORDER BY created_at DESC", (id,)).fetchall()]

    # Calculate totals
    proposta['valor_bruto'] = sum(i['valor_total'] or 0 for i in proposta['items'])
    proposta['peso_total'] = sum(i['peso_total'] or 0 for i in proposta['items'])

    # Tax calculations (only for VENDA)
    if proposta['tipo'] == 'VENDA':
        config = _get_configs(conn)
        pis_pct = float(config.get('pis_percentual', 9.25))
        icms_tabela = json.loads(config.get('icms_tabela', '{}'))
        uf = proposta.get('uf_destino') or proposta.get('cliente_uf') or 'SP'

        if uf == 'SP' and proposta.get('icms_isento'):
            icms_pct = 0
        else:
            icms_pct = icms_tabela.get(uf, 0)

        proposta['pis_percentual'] = pis_pct
        proposta['pis_valor'] = proposta['valor_bruto'] * pis_pct / 100
        proposta['icms_percentual'] = icms_pct
        proposta['icms_valor'] = proposta['valor_bruto'] * icms_pct / 100
        proposta['valor_liquido'] = proposta['valor_bruto'] - proposta['pis_valor'] - proposta['icms_valor']

        # Commission estimate (only for gestor/diretor)
        user = get_current_user()
        if user['perfil'] in ('gerente', 'diretor'):
            comissao_vendas = json.loads(config.get('comissao_vendas', '{}'))
            perfil_vendedor = proposta.get('vendedor_perfil', 'vendedor')
            perfil_key = 'gerente' if perfil_vendedor == 'gerente' else ('diretor' if perfil_vendedor == 'diretor' else 'vendedor')
            tabela = comissao_vendas.get(perfil_key, {})
            com_total = 0
            for item in proposta['items']:
                pct = tabela.get(item['categoria'], 0)
                item_liq = (item['valor_total'] or 0) * (1 - pis_pct/100 - icms_pct/100)
                com_total += item_liq * pct / 100
            proposta['comissao_estimada'] = com_total
            proposta['valor_final'] = proposta['valor_liquido'] - com_total

    # Client summary
    if proposta['cadastro_id']:
        parcelas = conn.execute(
            "SELECT COALESCE(SUM(valor),0) as t FROM ov_parcelas WHERE status IN ('Pendente','Vencida') AND ov_id IN (SELECT id FROM ordens_venda WHERE cadastro_id=?)",
            (proposta['cadastro_id'],)).fetchone()['t']
        cadastro_full = conn.execute("SELECT limite_faturamento FROM cadastros WHERE id=?", (proposta['cadastro_id'],)).fetchone()
        proposta['cliente_limite_tomado'] = parcelas
        lim = cadastro_full['limite_faturamento'] if cadastro_full else None
        proposta['cliente_limite'] = lim
        proposta['cliente_limite_disponivel'] = (lim - parcelas) if lim else None

        vencidas = conn.execute(
            "SELECT COUNT(*) as c FROM ov_parcelas WHERE status='Vencida' AND ov_id IN (SELECT id FROM ordens_venda WHERE cadastro_id=?)",
            (proposta['cadastro_id'],)).fetchone()['c']
        proposta['cliente_parcelas_vencidas'] = vencidas

    conn.close()
    return jsonify(proposta)


@app.route('/api/propostas/<int:id>', methods=['PUT'])
@login_required
def update_proposta(id):
    data = request.json
    user = get_current_user()
    conn = get_db()
    try:
        prop = conn.execute("SELECT status, data_emissao, vendedor_id FROM propostas WHERE id=?", (id,)).fetchone()
        if not prop:
            return jsonify({'error': 'Não encontrada'}), 404
        if prop['status'] in ('Convertida', 'Perdida'):
            return jsonify({'error': f'Proposta {prop["status"]} não pode ser editada'}), 400
        # Ownership check: vendedor só edita suas próprias propostas
        if user['perfil'] == 'vendedor' and prop['vendedor_id'] != user['id']:
            return jsonify({'error': 'Sem permissão para editar proposta de outro vendedor'}), 403

        # Update fields — vendedor não pode trocar vendedor_id nem cadastro_id de outro
        updatable = ['cadastro_id','vendedor_id','uf_destino','icms_isento','proposta_vinculada_id',
                     'validade_dias','condicao_pagamento','forma_pagamento','dados_pagamento',
                     'frete','transportadora','valor_frete','obs_transporte','prazo_entrega',
                     'garantia','obs_cliente','obs_interna','incluir_dados_bancarios',
                     'incluir_politica','mostrar_impostos','intermediario_id','valor_bruto_venda',
                     'valor_liquido_venda','comissao_forma','intermediario_obs',
                     'juros_total','valor_liquido_abmt','taxa_juros_aplicada','data_base_faturamento']
        if user['perfil'] == 'vendedor':
            updatable = [f for f in updatable if f not in ('vendedor_id', 'vendedor_responsavel_id')]
        fields = []
        params = []
        changes = []

        for f in updatable:
            if f in data:
                val = data[f]
                if f in ('condicao_pagamento', 'dados_pagamento'):
                    val = json.dumps(val)
                fields.append(f"{f}=?")
                params.append(val)
                changes.append(f)

        # Recalc expiration if validade changed — based on data_emissao, not now
        if 'validade_dias' in data:
            data_emissao_str = (prop['data_emissao'] if prop['data_emissao'] else None) or datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            try:
                data_emissao_dt = datetime.strptime(data_emissao_str[:10], '%Y-%m-%d')
            except Exception:
                data_emissao_dt = datetime.now()
            data_exp = (data_emissao_dt + timedelta(days=data['validade_dias'])).strftime('%Y-%m-%d')
            fields.append("data_expiracao=?")
            params.append(data_exp)

        fields.append("updated_at=datetime('now','localtime')")
        params.append(id)
        if fields:
            conn.execute(f"UPDATE propostas SET {', '.join(fields)} WHERE id=?", params)

        # Update items if provided
        if 'items' in data:
            conn.execute("DELETE FROM proposta_items WHERE proposta_id=?", (id,))
            for i, item in enumerate(data['items']):
                _insert_proposta_item(conn, id, i, item)
            changes.append('itens')

        # Recalcular juros se itens ou condição mudaram (VENDA) — usa valores já atualizados
        prop_full = conn.execute(
            "SELECT tipo, condicao_pagamento, data_base_faturamento, taxa_juros_aplicada FROM propostas WHERE id=?",
            (id,)
        ).fetchone()
        if prop_full and prop_full['tipo'] == 'VENDA' and ('items' in data or 'condicao_pagamento' in data):
            _atualizar_juros_proposta(conn, id, prop_full['condicao_pagamento'],
                                      prop_full['data_base_faturamento'], prop_full['taxa_juros_aplicada'])

        # Log
        if changes:
            conn.execute("INSERT INTO proposta_log (proposta_id, user_id, acao, detalhes) VALUES (?,?,?,?)",
                         (id, user['id'], 'Edição', f"Campos alterados: {', '.join(changes)}"))

        conn.commit()
    except Exception as e:
        conn.rollback()
        app.logger.exception('Erro interno'); return jsonify({'error': 'Erro interno do servidor'}), 500
    finally:
        conn.close()
    return jsonify({'ok': True})


@app.route('/api/condicoes-salvas', methods=['GET'])
@login_required
def get_condicoes_salvas():
    conn = get_db()
    rows = conn.execute("SELECT * FROM condicoes_salvas ORDER BY descricao").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/condicoes-salvas', methods=['POST'])
@login_required
def save_condicao():
    data = request.json
    desc = data.get('descricao', '').strip()
    if not desc:
        return jsonify({'error': 'Descrição vazia'}), 400
    conn = get_db()
    try:
        conn.execute("INSERT OR IGNORE INTO condicoes_salvas (descricao) VALUES (?)", (desc,))
        conn.commit()
    finally:
        conn.close()
    return jsonify({'ok': True})


@app.route('/api/propostas/<int:id>/status', methods=['PUT'])
@login_required
def update_proposta_status(id):
    data = request.json
    new_status = data.get('status')
    if not new_status:
        return jsonify({'error': 'Campo status é obrigatório'}), 400
    user = get_current_user()
    conn = get_db()
    try:
        prop = conn.execute("SELECT * FROM propostas WHERE id=?", (id,)).fetchone()
        if not prop:
            return jsonify({'error': 'Não encontrada'}), 404
        # Ownership check: vendedor só muda status das suas próprias propostas
        if user['perfil'] == 'vendedor' and prop['vendedor_id'] != user['id']:
            return jsonify({'error': 'Sem permissão para alterar proposta de outro vendedor'}), 403

        # Validate transitions
        valid_transitions = {
            'Rascunho': ['Enviada'],
            'Enviada': ['Em Negociação'],
            'Em Negociação': ['Aprovada', 'Perdida'],
            'Aprovada': ['Convertida', 'Em Negociação'],
            'Perdida': ['Em Negociação'],
            'Expirada': ['Em Negociação']
        }

        if new_status not in valid_transitions.get(prop['status'], []):
            # Gestor can go back from Aprovada
            if not (user['perfil'] in ('gerente','diretor') and new_status == 'Em Negociação' and prop['status'] == 'Aprovada'):
                return jsonify({'error': f'Transição {prop["status"]} → {new_status} não permitida'}), 400

        updates = {"status": new_status}
        if new_status == 'Perdida':
            updates['motivo_perda'] = data.get('motivo_perda', '')

        set_clause = ', '.join(f"{k}=?" for k in updates.keys())
        conn.execute(f"UPDATE propostas SET {set_clause}, updated_at=datetime('now','localtime') WHERE id=?",
                     list(updates.values()) + [id])

        conn.execute("INSERT INTO proposta_log (proposta_id, user_id, acao, detalhes) VALUES (?,?,?,?)",
                     (id, user['id'], 'Mudança de status', f"{prop['status']} → {new_status}"))
        conn.commit()
        return jsonify({'ok': True})
    except Exception as e:
        conn.rollback()
        app.logger.exception('Erro interno'); return jsonify({'error': 'Erro interno do servidor'}), 500
    finally:
        conn.close()


@app.route('/api/propostas/<int:id>/duplicar', methods=['POST'])
@login_required
def duplicar_proposta(id):
    """Duplicate a proposal with all items, reset status to Rascunho"""
    conn = get_db()
    user = get_current_user()
    prop = conn.execute("SELECT * FROM propostas WHERE id=?", (id,)).fetchone()
    if not prop:
        conn.close()
        return jsonify({'error': 'Proposta não encontrada'}), 404

    try:
        conn.execute("BEGIN IMMEDIATE")
        numero = get_next_number('PROP', conn)

        conn.execute('''INSERT INTO propostas (numero, tipo, status, cadastro_id, vendedor_id,
            uf_destino, icms_isento, data_emissao, validade_dias,
            condicao_pagamento, forma_pagamento, dados_pagamento,
            frete, transportadora, valor_frete, obs_transporte, prazo_entrega, garantia,
            obs_cliente, obs_interna, incluir_dados_bancarios, incluir_politica, mostrar_impostos,
            intermediario_id, valor_bruto_venda, valor_liquido_venda, comissao_forma, intermediario_obs,
            juros_total, valor_liquido_abmt, taxa_juros_aplicada, data_base_faturamento)
            VALUES (?,?,?,?,?,?,?,datetime('now','localtime'),?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''',
            (numero, prop['tipo'], 'Rascunho', prop['cadastro_id'], user['id'],
             prop['uf_destino'], prop['icms_isento'], prop['validade_dias'],
             prop['condicao_pagamento'], prop['forma_pagamento'], prop['dados_pagamento'],
             prop['frete'], prop['transportadora'], prop['valor_frete'],
             prop['obs_transporte'], prop['prazo_entrega'], prop['garantia'],
             prop['obs_cliente'], prop['obs_interna'],
             prop['incluir_dados_bancarios'], prop['incluir_politica'], prop['mostrar_impostos'],
             prop['intermediario_id'], prop['valor_bruto_venda'], prop['valor_liquido_venda'],
             prop['comissao_forma'], prop['intermediario_obs'],
             prop['juros_total'], prop['valor_liquido_abmt'], prop['taxa_juros_aplicada'],
             prop['data_base_faturamento']))

        new_id = conn.execute("SELECT last_insert_rowid() as id").fetchone()['id']

        # Copy items
        items = conn.execute("SELECT * FROM proposta_items WHERE proposta_id=?", (id,)).fetchall()
        for item in items:
            conn.execute('''INSERT INTO proposta_items (proposta_id, ordem, categoria, campos_especificos,
                descricao_complementar, peso_unitario, peso_total, quantidade, unidade,
                valor_unitario, desconto_tipo, desconto_valor, valor_total)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)''',
                (new_id, item['ordem'], item['categoria'], item['campos_especificos'],
                 item['descricao_complementar'], item['peso_unitario'], item['peso_total'],
                 item['quantidade'], item['unidade'], item['valor_unitario'],
                 item['desconto_tipo'], item['desconto_valor'], item['valor_total']))

        # Log
        conn.execute("INSERT INTO proposta_log (proposta_id, user_id, acao, detalhes) VALUES (?,?,?,?)",
            (new_id, user['id'], 'Criação', f'Duplicada da {prop["numero"]}'))

        conn.commit()
        conn.close()
        return jsonify({'ok': True, 'id': new_id, 'numero': numero})
    except Exception as e:
        conn.rollback()
        conn.close()
        app.logger.exception('Erro interno'); return jsonify({'error': 'Erro interno do servidor'}), 500


@app.route('/api/propostas/<int:id>/converter', methods=['POST'])
@login_required
def converter_proposta(id):
    """Convert approved proposal to OV or OC"""
    user = get_current_user()
    conn = get_db()

    try:
        # Lock first, then validate — prevents race condition where two requests
        # both pass status check before either changes the status
        conn.execute("BEGIN IMMEDIATE")

        prop = conn.execute("SELECT * FROM propostas WHERE id=?", (id,)).fetchone()
        if not prop:
            conn.rollback()
            return jsonify({'error': 'Proposta não encontrada'}), 404

        # Verificar status DENTRO da transação (com lock exclusivo)
        if prop['status'] not in ('Aprovada', 'Em Negociação', 'Enviada'):
            conn.rollback()
            return jsonify({'error': f'Proposta com status "{prop["status"]}" não pode ser convertida. Apenas propostas Aprovadas/Enviadas/Em Negociação.'}), 400

        # Verificar permissão: vendedor só converte suas próprias
        if user['perfil'] == 'vendedor' and prop['vendedor_id'] != user['id']:
            conn.rollback()
            return jsonify({'error': 'Sem permissão para converter proposta de outro vendedor'}), 403

        # Marcar como Convertida imediatamente para evitar conversão dupla
        conn.execute("UPDATE propostas SET status='Convertida', updated_at=datetime('now','localtime') WHERE id=?", (id,))

        items = conn.execute("SELECT * FROM proposta_items WHERE proposta_id=? ORDER BY ordem", (id,)).fetchall()
        if prop['tipo'] == 'VENDA':
            numero = get_next_number('OV', conn)
            # Preserve juros, intermediário and comissão fields from proposta
            # Use try/except for new columns to keep compat with older DBs
            try:
                juros_total = prop['juros_total'] or 0
            except (IndexError, KeyError):
                juros_total = 0
            try:
                valor_liquido_abmt = prop['valor_liquido_abmt'] or 0
            except (IndexError, KeyError):
                valor_liquido_abmt = 0
            try:
                taxa_juros_aplicada = prop['taxa_juros_aplicada'] or 0
            except (IndexError, KeyError):
                taxa_juros_aplicada = 0
            try:
                data_base_faturamento = prop['data_base_faturamento']
            except (IndexError, KeyError):
                data_base_faturamento = None
            try:
                intermediario_id = prop['intermediario_id']
            except (IndexError, KeyError):
                intermediario_id = None
            try:
                valor_bruto_venda = prop['valor_bruto_venda']
            except (IndexError, KeyError):
                valor_bruto_venda = None
            try:
                valor_liquido_venda = prop['valor_liquido_venda']
            except (IndexError, KeyError):
                valor_liquido_venda = None
            try:
                comissao_forma = prop['comissao_forma']
            except (IndexError, KeyError):
                comissao_forma = None
            try:
                intermediario_obs = prop['intermediario_obs']
            except (IndexError, KeyError):
                intermediario_obs = None

            conn.execute('''INSERT INTO ordens_venda (numero, proposta_id, cadastro_id, vendedor_id,
                uf_destino, icms_isento, data_emissao, data_entrega_prevista, condicao_pagamento,
                forma_pagamento, dados_pagamento, frete, transportadora, valor_frete, obs_transporte,
                observacoes, obs_interna,
                juros_total, valor_liquido_abmt, taxa_juros_aplicada, data_base_faturamento,
                intermediario_id, valor_bruto_venda, valor_liquido_venda, comissao_forma, intermediario_obs)
                VALUES (?,?,?,?,?,?,datetime('now','localtime'),?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''',
                (numero, id, prop['cadastro_id'], prop['vendedor_id'], prop['uf_destino'],
                 prop['icms_isento'], None, prop['condicao_pagamento'],
                 prop['forma_pagamento'], prop['dados_pagamento'], prop['frete'],
                 prop['transportadora'], prop['valor_frete'], prop['obs_transporte'],
                 prop['obs_cliente'], prop['obs_interna'],
                 juros_total, valor_liquido_abmt, taxa_juros_aplicada, data_base_faturamento,
                 intermediario_id, valor_bruto_venda, valor_liquido_venda, comissao_forma, intermediario_obs))
            ordem_id = conn.execute("SELECT last_insert_rowid() as id").fetchone()['id']

            # Copy items with commission (usa calcular_comissao_item)
            config = _get_configs(conn)
            vendedor = conn.execute("SELECT perfil FROM users WHERE id=?", (prop['vendedor_id'],)).fetchone()
            perfil_key = vendedor['perfil'] if vendedor else 'vendedor'
            pis_pct = float(config.get('pis_percentual', 9.25))

            for item in items:
                com = calcular_comissao_item(
                    item['valor_total'], item['categoria'], perfil_key,
                    prop['uf_destino'], prop['icms_isento'], pis_pct, config)
                com_pct = com['comissao_percentual']
                com_val = com['comissao_valor']

                # Extract custo from campos_especificos
                specs = json.loads(item['campos_especificos'] or '{}')
                custo_ref = specs.get('custo_referencia')
                custo = float(custo_ref) if custo_ref else None
                margem = None
                if custo and custo > 0 and item['valor_unitario'] and item['valor_unitario'] > 0:
                    margem = round((item['valor_unitario'] - custo) / custo * 100, 1)

                conn.execute('''INSERT INTO ov_items (ov_id, ordem, categoria, campos_especificos,
                    descricao_complementar, peso_unitario, peso_total, quantidade, unidade,
                    valor_unitario, desconto_tipo, desconto_valor, valor_total, comissao_percentual, comissao_valor,
                    custo, margem)
                    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''',
                    (ordem_id, item['ordem'], item['categoria'], item['campos_especificos'],
                     item['descricao_complementar'], item['peso_unitario'], item['peso_total'],
                     item['quantidade'], item['unidade'], item['valor_unitario'],
                     item['desconto_tipo'], item['desconto_valor'], item['valor_total'],
                     com_pct, com_val, custo, margem))

            # Create parcelas using centralized service (applies juros)
            valor_bruto_total = sum(float(i['valor_total'] or 0) for i in items)
            try:
                db_fat = prop['data_base_faturamento'] or prop['data_emissao']
                data_base_dt = datetime.strptime(db_fat[:10], '%Y-%m-%d')
            except Exception:
                data_base_dt = datetime.now()
            taxa_aplicada = taxa_juros_aplicada or float(config.get('taxa_juros_venda_prazo', 2.8))
            parcelas_geradas = gerar_parcelas_para_ov(
                prop['condicao_pagamento'], valor_bruto_total, data_base_dt, taxa_aplicada
            )
            for p in parcelas_geradas:
                conn.execute('''INSERT INTO ov_parcelas (ov_id, numero_parcela, total_parcelas, valor, data_vencimento)
                    VALUES (?,?,?,?,?)''',
                    (ordem_id, p['numero'], p['total'], p['valor'], p['data_vencimento']))

            # Recalcula juros da OV a partir das parcelas geradas (fonte de verdade)
            soma_parc = sum(p['valor'] for p in parcelas_geradas)
            juros_ov = round(soma_parc - valor_bruto_total, 2) if soma_parc > valor_bruto_total else 0
            liquido_ov = round(valor_bruto_total - juros_ov, 2)
            conn.execute(
                "UPDATE ordens_venda SET juros_total=?, valor_liquido_abmt=?, taxa_juros_aplicada=? WHERE id=?",
                (juros_ov, liquido_ov, taxa_aplicada, ordem_id)
            )

            # Update ordem_gerada reference (status already set to Convertida at transaction start)
            conn.execute(
                "UPDATE propostas SET ordem_gerada_id=?, ordem_gerada_tipo='OV' WHERE id=?",
                (ordem_id, id)
            )
            tipo_ordem = 'OV'

        else:  # COMPRA
            numero = get_next_number('OC', conn)
            conn.execute('''INSERT INTO ordens_compra (numero, proposta_id, cadastro_id, comprador_id,
                data_emissao, data_entrega_prevista, condicao_pagamento, forma_pagamento,
                dados_pagamento, frete, transportadora, valor_frete, obs_transporte,
                observacoes, obs_interna)
                VALUES (?,?,?,?,datetime('now','localtime'),?,?,?,?,?,?,?,?,?,?)''',
                (numero, id, prop['cadastro_id'], prop['vendedor_id'], None,
                 prop['condicao_pagamento'], prop['forma_pagamento'], prop['dados_pagamento'],
                 prop['frete'], prop['transportadora'], prop['valor_frete'], prop['obs_transporte'],
                 prop['obs_cliente'], prop['obs_interna']))
            ordem_id = conn.execute("SELECT last_insert_rowid() as id").fetchone()['id']

            for item in items:
                conn.execute('''INSERT INTO oc_items (oc_id, ordem, categoria, campos_especificos,
                    descricao_complementar, peso_unitario, peso_total, quantidade, unidade,
                    valor_unitario, desconto_tipo, desconto_valor, valor_total)
                    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)''',
                    (ordem_id, item['ordem'], item['categoria'], item['campos_especificos'],
                     item['descricao_complementar'], item['peso_unitario'], item['peso_total'],
                     item['quantidade'], item['unidade'], item['valor_unitario'],
                     item['desconto_tipo'], item['desconto_valor'], item['valor_total']))

            # Generate OC parcelas (contas a pagar) — same logic as OV
            cond_oc = json.loads(prop['condicao_pagamento'] or '{}')
            valor_bruto_oc = sum(float(i['valor_total'] or 0) for i in items)
            cond_tipo_oc = cond_oc.get('tipo', 'À vista') if isinstance(cond_oc, dict) else str(cond_oc)

            if cond_oc.get('parcelas'):
                for p in cond_oc['parcelas']:
                    conn.execute('''INSERT INTO oc_parcelas (oc_id, numero_parcela, total_parcelas, valor, data_vencimento)
                        VALUES (?,?,?,?,?)''', (ordem_id, p['numero'], p['total'], p['valor'], p['vencimento']))
            elif cond_tipo_oc and cond_tipo_oc != 'À vista' and valor_bruto_oc > 0:
                # Parse days dynamically from condition string
                dias_parts_oc = cond_tipo_oc.replace(' dias', '').split('/')
                dias_list_oc = [int(d.strip()) for d in dias_parts_oc if d.strip().isdigit()]
                if not dias_list_oc and cond_oc.get('dias_custom'):
                    try:
                        dias_list_oc = [int(d.strip()) for d in str(cond_oc['dias_custom']).split(',') if d.strip()]
                    except Exception:
                        dias_list_oc = None
                if not dias_list_oc or len(dias_list_oc) == 0:
                    dias_list_oc = [30]
                if dias_list_oc:
                    n_p = len(dias_list_oc)
                    val_p = round(valor_bruto_oc / n_p, 2)
                    # Use data_base_faturamento from proposta, fallback to data_emissao, then now()
                    try:
                        db_fat_oc = prop['data_base_faturamento'] or prop['data_emissao']
                        data_base_oc = datetime.strptime(db_fat_oc[:10], '%Y-%m-%d')
                    except:
                        data_base_oc = datetime.now()
                    for idx, dias in enumerate(dias_list_oc):
                        venc = (data_base_oc + timedelta(days=dias)).strftime('%Y-%m-%d')
                        val = val_p if idx < n_p - 1 else round(valor_bruto_oc - val_p * (n_p - 1), 2)
                        conn.execute('''INSERT INTO oc_parcelas (oc_id, numero_parcela, total_parcelas, valor, data_vencimento)
                            VALUES (?,?,?,?,?)''', (ordem_id, idx+1, n_p, val, venc))
            elif cond_tipo_oc == 'À vista' and valor_bruto_oc > 0:
                try:
                    db_fat_oc_av = prop['data_base_faturamento'] or prop['data_emissao']
                    data_av_oc = datetime.strptime(db_fat_oc_av[:10], '%Y-%m-%d').strftime('%Y-%m-%d')
                except:
                    data_av_oc = datetime.now().strftime('%Y-%m-%d')
                conn.execute('''INSERT INTO oc_parcelas (oc_id, numero_parcela, total_parcelas, valor, data_vencimento)
                    VALUES (?,?,?,?,?)''', (ordem_id, 1, 1, valor_bruto_oc, data_av_oc))

            # Update ordem_gerada reference (status already set to Convertida at transaction start)
            conn.execute(
                "UPDATE propostas SET ordem_gerada_id=?, ordem_gerada_tipo='OC' WHERE id=?",
                (ordem_id, id)
            )
            tipo_ordem = 'OC'

        conn.execute("INSERT INTO proposta_log (proposta_id, user_id, acao, detalhes) VALUES (?,?,?,?)",
                     (id, user['id'], 'Conversão', f"Gerou {numero}"))
        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({'error': 'Erro ao converter proposta'}), 500

    return jsonify({'ok': True, 'ordem_id': ordem_id, 'numero': numero, 'tipo': tipo_ordem, 'vendedor_id': prop['vendedor_id']})


# ============ SALES ORDERS (OV) ============

@app.route('/api/ovs', methods=['GET'])
@login_required
def list_ovs():
    user = get_current_user()
    conn = get_db()
    page = int(request.args.get('page', 1))
    per_page = min(int(request.args.get('per_page', 30)), 100)
    status = request.args.get('status', '')
    search = request.args.get('search', '')
    # Vendedor SEMPRE vê só as suas — sem bypass por query param
    only_mine = 'true' if user['perfil'] == 'vendedor' else request.args.get('only_mine', 'false')

    query = """SELECT ov.*, c.razao_social, c.nome_fantasia, u.nome as vendedor_nome,
               COALESCE((SELECT SUM(valor_total) FROM ov_items WHERE ov_id=ov.id),0) as valor_total
               FROM ordens_venda ov LEFT JOIN cadastros c ON ov.cadastro_id=c.id
               LEFT JOIN users u ON ov.vendedor_id=u.id WHERE 1=1"""
    params = []

    if status:
        query += " AND ov.status=?"
        params.append(status)
    if search:
        query += " AND (ov.numero LIKE ? OR c.razao_social LIKE ?)"
        s = f'%{search}%'
        params += [s, s]
    if only_mine == 'true':
        query += " AND ov.vendedor_id=?"
        params.append(user['id'])

    total = conn.execute(query.replace("""SELECT ov.*, c.razao_social, c.nome_fantasia, u.nome as vendedor_nome,
               COALESCE((SELECT SUM(valor_total) FROM ov_items WHERE ov_id=ov.id),0) as valor_total""", "SELECT COUNT(*) as c"), params).fetchone()['c']
    query += " ORDER BY ov.data_emissao DESC LIMIT ? OFFSET ?"
    params += [per_page, (page - 1) * per_page]
    rows = conn.execute(query, params).fetchall()

    results = [dict(r) for r in rows]

    conn.close()
    return jsonify({'items': results, 'total': total, 'page': page})


@app.route('/api/ovs', methods=['POST'])
@login_required
def create_ov():
    """Create OV directly (without proposal)"""
    data = request.json
    user = get_current_user()
    conn = get_db()

    try:
        conn.execute("BEGIN IMMEDIATE")
        numero = get_next_number('OV', conn)
        conn.execute('''INSERT INTO ordens_venda (numero, cadastro_id, vendedor_id, uf_destino,
            icms_isento, data_emissao, data_entrega_prevista, condicao_pagamento, forma_pagamento,
            dados_pagamento, frete, transportadora, valor_frete, obs_transporte, observacoes, obs_interna)
            VALUES (?,?,?,?,?,datetime('now','localtime'),?,?,?,?,?,?,?,?,?,?)''',
            (numero, data['cadastro_id'],
             data.get('vendedor_id', user['id']) if user['perfil'] != 'vendedor' else user['id'],
             data.get('uf_destino'), data.get('icms_isento', 0),
             data.get('data_entrega_prevista'), json.dumps(data.get('condicao_pagamento', {})),
             data.get('forma_pagamento', 'Faturado'), json.dumps(data.get('dados_pagamento', {})),
             data.get('frete', 'FOB'), data.get('transportadora'), data.get('valor_frete'),
             data.get('obs_transporte'), data.get('observacoes'), data.get('obs_interna')))

        ov_id = conn.execute("SELECT last_insert_rowid() as id").fetchone()['id']

        # Items with commission (usa calcular_comissao_item)
        config = _get_configs(conn)
        vendedor = conn.execute("SELECT perfil FROM users WHERE id=?", (data.get('vendedor_id', user['id']),)).fetchone()
        perfil_key = vendedor['perfil'] if vendedor else 'vendedor'
        pis_pct = float(config.get('pis_percentual', 9.25))

        for i, item in enumerate(data.get('items', [])):
            qtd = float(item.get('quantidade', 0))
            val_unit = float(item.get('valor_unitario', 0))
            unidade = item.get('unidade', 'UNIDADE')
            peso_unit = item.get('peso_unitario')
            peso_total = qtd if unidade == 'KG' else (float(peso_unit) * qtd if peso_unit else None)
            desconto = float(item.get('desconto_valor', 0))
            desc_tipo = item.get('desconto_tipo')
            # When unit is KVA, val_unit = price per kVA → multiply by potência
            campos_ov = item.get('campos_especificos', {})
            if unidade == 'KVA':
                pot = float(campos_ov.get('potencia', 0))
                valor_bruto = qtd * pot * val_unit if pot > 0 else qtd * val_unit
            else:
                valor_bruto = qtd * val_unit
            valor_total = valor_bruto * (1 - desconto/100) if desc_tipo == 'percentual' else (valor_bruto - desconto if desc_tipo == 'valor' else valor_bruto)

            # Add embalagem cost for Óleo Isolante
            emb_custo_ov = float(campos_ov.get('embalagem_custo_total', 0))
            if emb_custo_ov > 0:
                valor_total += emb_custo_ov

            com = calcular_comissao_item(
                valor_total, item['categoria'], perfil_key,
                data.get('uf_destino'), data.get('icms_isento', 0), pis_pct, config)

            conn.execute('''INSERT INTO ov_items (ov_id, ordem, categoria, campos_especificos,
                descricao_complementar, peso_unitario, peso_total, quantidade, unidade,
                valor_unitario, desconto_tipo, desconto_valor, valor_total, comissao_percentual, comissao_valor)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''',
                (ov_id, i, item['categoria'], json.dumps(item.get('campos_especificos', {})),
                 item.get('descricao_complementar'), peso_unit, peso_total, qtd, unidade,
                 val_unit, desc_tipo, desconto, valor_total, com['comissao_percentual'], com['comissao_valor']))

        # Parcelas — centralized service applies juros compostos
        cond_json = data.get('condicao_pagamento', {})
        # Recompute valor_bruto_total from items just inserted
        valor_bruto_total = conn.execute(
            "SELECT COALESCE(SUM(valor_total), 0) as t FROM ov_items WHERE ov_id=?", (ov_id,)
        ).fetchone()['t']
        try:
            db_fat = data.get('data_base_faturamento') or datetime.now().strftime('%Y-%m-%d')
            data_base_dt = datetime.strptime(db_fat[:10], '%Y-%m-%d')
        except Exception:
            data_base_dt = datetime.now()
        taxa_aplicada = float(data.get('taxa_juros_aplicada') or config.get('taxa_juros_venda_prazo', 2.8))
        parcelas_geradas = gerar_parcelas_para_ov(cond_json, valor_bruto_total, data_base_dt, taxa_aplicada)
        for p in parcelas_geradas:
            conn.execute('''INSERT INTO ov_parcelas (ov_id, numero_parcela, total_parcelas, valor, data_vencimento)
                VALUES (?,?,?,?,?)''',
                (ov_id, p['numero'], p['total'], p['valor'], p['data_vencimento']))

        # Juros da OV a partir das parcelas geradas (fonte de verdade)
        soma_parc = sum(p['valor'] for p in parcelas_geradas)
        juros_ov = round(soma_parc - valor_bruto_total, 2) if soma_parc > valor_bruto_total else 0
        liquido_ov = round(valor_bruto_total - juros_ov, 2)
        conn.execute(
            "UPDATE ordens_venda SET juros_total=?, valor_liquido_abmt=?, taxa_juros_aplicada=? WHERE id=?",
            (juros_ov, liquido_ov, taxa_aplicada, ov_id)
        )

        conn.commit()
    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({'error': 'Erro ao salvar: ' + str(e)}), 500

    conn.close()
    return jsonify({'ok': True, 'id': ov_id, 'numero': numero}), 201


@app.route('/api/ovs/<int:id>', methods=['GET'])
@login_required
def get_ov(id):
    user = get_current_user()
    conn = get_db()
    row = conn.execute("""SELECT ov.*, c.razao_social, c.nome_fantasia, c.cnpj_cpf,
        c.contato_whatsapp, u.nome as vendedor_nome, u.perfil as vendedor_perfil
        FROM ordens_venda ov LEFT JOIN cadastros c ON ov.cadastro_id=c.id
        LEFT JOIN users u ON ov.vendedor_id=u.id WHERE ov.id=?""", (id,)).fetchone()
    if not row:
        conn.close()
        return jsonify({'error': 'Não encontrada'}), 404

    ov = dict(row)
    ov['items'] = [dict(r) for r in conn.execute("SELECT * FROM ov_items WHERE ov_id=? ORDER BY ordem", (id,)).fetchall()]
    ov['parcelas'] = [dict(r) for r in conn.execute("SELECT * FROM ov_parcelas WHERE ov_id=? ORDER BY numero_parcela", (id,)).fetchall()]

    # Totals
    ov['valor_bruto'] = sum(i['valor_total'] or 0 for i in ov['items'])
    ov['peso_total'] = sum(i['peso_total'] or 0 for i in ov['items'])

    config = _get_configs(conn)
    pis_pct = float(config.get('pis_percentual', 9.25))
    icms_tabela = json.loads(config.get('icms_tabela', '{}'))
    uf = ov.get('uf_destino', 'SP')
    icms_pct = 0 if (uf == 'SP' and ov.get('icms_isento')) else icms_tabela.get(uf, 0)

    ov['pis_valor'] = ov['valor_bruto'] * pis_pct / 100
    ov['icms_valor'] = ov['valor_bruto'] * icms_pct / 100
    ov['valor_liquido'] = ov['valor_bruto'] - ov['pis_valor'] - ov['icms_valor']

    # Linked OCs — legacy (whole-OC links)
    linked_ocs = conn.execute("""SELECT l.*, oc.numero as oc_numero, c.razao_social as fornecedor,
        COALESCE((SELECT SUM(valor_total) FROM oc_items WHERE oc_id=oc.id),0) as oc_valor_total
        FROM oc_ov_links l JOIN ordens_compra oc ON l.oc_id=oc.id
        LEFT JOIN cadastros c ON oc.cadastro_id=c.id
        WHERE l.ov_id=?""", (id,)).fetchall()
    ov['linked_ocs'] = [dict(r) for r in linked_ocs]
    custo_legacy = sum(l['valor_alocado_compra'] if l['valor_alocado_compra'] is not None else l['oc_valor_total'] for l in ov['linked_ocs'])

    # Linked OC items — item-level links (new system)
    linked_oc_items = conn.execute("""SELECT li.*, oc.numero as oc_numero, oi.categoria, oi.unidade as item_unidade,
        oi.campos_especificos, c.razao_social as fornecedor
        FROM oc_ov_link_items li
        JOIN oc_items oi ON li.oc_item_id=oi.id
        JOIN ordens_compra oc ON li.oc_id=oc.id
        LEFT JOIN cadastros c ON oc.cadastro_id=c.id
        WHERE li.ov_id=?
        ORDER BY oc.numero, oi.ordem""", (id,)).fetchall()
    ov['linked_oc_items'] = [dict(r) for r in linked_oc_items]
    custo_items = sum(i['valor_total_alocado'] or 0 for i in ov['linked_oc_items'])

    ov['custo_total_vinculado'] = custo_legacy + custo_items
    has_links = bool(ov['linked_ocs']) or bool(ov['linked_oc_items'])
    ov['margem_valor'] = ov['valor_bruto'] - ov['custo_total_vinculado'] if has_links else None
    ov['margem_pct'] = (ov['margem_valor'] / ov['valor_bruto'] * 100) if ov['margem_valor'] is not None and ov['valor_bruto'] > 0 else None

    # Hide sensitive fields from vendedor
    if user['perfil'] == 'vendedor':
        for item in ov['items']:
            item.pop('custo', None)
            item.pop('margem', None)
            item.pop('comissao_percentual', None)
            item.pop('comissao_valor', None)
        ov.pop('comissao_estimada', None)
        ov.pop('linked_ocs', None)
        ov.pop('linked_oc_items', None)
        ov.pop('custo_total_vinculado', None)
        ov.pop('margem_valor', None)
        ov.pop('margem_pct', None)
    else:
        ov['comissao_total'] = sum(i.get('comissao_valor') or 0 for i in ov['items'])
        ov['valor_final'] = ov['valor_liquido'] - ov['comissao_total']

    conn.close()
    return jsonify(ov)


@app.route('/api/ovs/<int:id>', methods=['PUT'])
@login_required
def update_ov(id):
    """Edit OV fields (only allowed for non-cancelled OVs)"""
    data = request.json
    user = get_current_user()
    conn = get_db()

    ov = conn.execute("SELECT * FROM ordens_venda WHERE id=?", (id,)).fetchone()
    if not ov:
        conn.close()
        return jsonify({'error': 'OV não encontrada'}), 404
    if ov['status'] == 'Cancelada':
        conn.close()
        return jsonify({'error': 'OV cancelada não pode ser editada'}), 400
    if user['perfil'] == 'vendedor' and ov['vendedor_id'] != user['id']:
        conn.close()
        return jsonify({'error': 'Sem permissão'}), 403
    # Lock: mês fechado não pode ter OV editada
    if _mes_fechado(conn, ov['data_emissao']):
        conn.close()
        return jsonify({'error': 'OV pertence a mês fechado — abra o fechamento antes de editar'}), 400

    try:
        fields = []
        params = []
        updatable = ['nota_fiscal', 'numero_omie', 'data_entrega_prevista', 'frete',
                     'transportadora', 'valor_frete', 'obs_transporte', 'observacoes', 'obs_interna',
                     'uf_destino', 'icms_isento']
        for f in updatable:
            if f in data:
                fields.append(f"{f}=?")
                params.append(data[f])

        if fields:
            fields.append("updated_at=datetime('now','localtime')")
            params.append(id)
            conn.execute(f"UPDATE ordens_venda SET {', '.join(fields)} WHERE id=?", params)

            # Audit log
            conn.execute("INSERT INTO audit_log (user_id, acao, entidade_tipo, entidade_id, detalhes) VALUES (?,?,?,?,?)",
                         (user['id'], 'editar', 'OV', id, json.dumps({k: data[k] for k in data if k in updatable})))
            conn.commit()

        return jsonify({'ok': True})
    except Exception as e:
        conn.rollback()
        app.logger.exception('Erro interno'); return jsonify({'error': 'Erro interno do servidor'}), 500
    finally:
        conn.close()


@app.route('/api/ovs/<int:id>/status', methods=['PUT'])
@login_required
def update_ov_status(id):
    data = request.json
    user = get_current_user()
    conn = get_db()

    ov = conn.execute("SELECT * FROM ordens_venda WHERE id=?", (id,)).fetchone()
    if not ov:
        conn.close()
        return jsonify({'error': 'OV não encontrada'}), 404
    # Lock: mês fechado não pode ter status alterado
    if _mes_fechado(conn, ov['data_emissao']):
        conn.close()
        return jsonify({'error': 'OV pertence a mês fechado — abra o fechamento antes de alterar status'}), 400

    new_status = data.get('status')
    if not new_status:
        conn.close()
        return jsonify({'error': 'Campo status é obrigatório'}), 400
    valid_statuses = ('Aprovada', 'Em Produção', 'Faturada', 'Despachada', 'Entregue', 'Cancelada')
    if new_status not in valid_statuses:
        conn.close()
        return jsonify({'error': f'Status inválido. Válidos: {", ".join(valid_statuses)}'}), 400

    # Workflow transitions validation
    transitions = {
        'Aprovada': ['Em Produção', 'Faturada', 'Cancelada'],
        'Em Produção': ['Faturada', 'Cancelada'],
        'Faturada': ['Despachada', 'Entregue', 'Cancelada'],
        'Despachada': ['Entregue', 'Cancelada'],
        'Entregue': ['Cancelada'],
        'Cancelada': []
    }
    current = ov['status']
    if new_status not in transitions.get(current, []):
        conn.close()
        return jsonify({'error': f'Transição inválida: {current} → {new_status}'}), 400

    if new_status == 'Cancelada':
        if user['perfil'] == 'vendedor':
            if ov['vendedor_id'] != user['id']:
                conn.close()
                return jsonify({'error': 'Vendedor só pode cancelar suas próprias OVs'}), 403
            paid = conn.execute("SELECT COUNT(*) as c FROM ov_parcelas WHERE ov_id=? AND status IN ('Paga','Paga Parcial')", (id,)).fetchone()['c']
            if paid > 0:
                conn.close()
                return jsonify({'error': 'OV com parcelas pagas só pode ser cancelada pelo gestor'}), 403

        conn.execute("""UPDATE ordens_venda SET status='Cancelada', motivo_cancelamento=?,
            cancelado_por=?, cancelado_em=datetime('now','localtime'), updated_at=datetime('now','localtime')
            WHERE id=?""", (data.get('motivo', ''), user['id'], id))
    else:
        conn.execute("UPDATE ordens_venda SET status=?, updated_at=datetime('now','localtime') WHERE id=?",
                     (new_status, id))
        # If setting to Faturada, update nota_fiscal if provided
        if new_status == 'Faturada' and data.get('nota_fiscal'):
            conn.execute("UPDATE ordens_venda SET nota_fiscal=? WHERE id=?", (data['nota_fiscal'], id))

    # Audit log
    conn.execute("INSERT INTO audit_log (user_id, acao, entidade_tipo, entidade_id, detalhes) VALUES (?,?,?,?,?)",
                 (user['id'], 'status_change', 'OV', id, json.dumps({'de': current, 'para': new_status})))

    conn.commit()
    conn.close()
    return jsonify({'ok': True})


# ============ PURCHASE ORDERS (OC) ============

@app.route('/api/ocs', methods=['GET'])
@permission_required('ver_compras')
def list_ocs():
    user = get_current_user()
    conn = get_db()
    page = int(request.args.get('page', 1))
    per_page = min(int(request.args.get('per_page', 30)), 100)
    status = request.args.get('status', '')
    search = request.args.get('search', '')
    # Vendedor SEMPRE vê só as suas — sem bypass por query param
    only_mine = 'true' if user['perfil'] == 'vendedor' else request.args.get('only_mine', 'false')

    query = """SELECT oc.*, c.razao_social, c.nome_fantasia, u.nome as comprador_nome,
               COALESCE((SELECT SUM(valor_total) FROM oc_items WHERE oc_id=oc.id),0) as valor_total
               FROM ordens_compra oc LEFT JOIN cadastros c ON oc.cadastro_id=c.id
               LEFT JOIN users u ON oc.comprador_id=u.id WHERE 1=1"""
    params = []

    if status:
        query += " AND oc.status=?"
        params.append(status)
    if search:
        query += " AND (oc.numero LIKE ? OR c.razao_social LIKE ?)"
        s = f'%{search}%'
        params += [s, s]
    if only_mine == 'true':
        query += " AND oc.comprador_id=?"
        params.append(user['id'])

    total = conn.execute(query.replace("""SELECT oc.*, c.razao_social, c.nome_fantasia, u.nome as comprador_nome,
               COALESCE((SELECT SUM(valor_total) FROM oc_items WHERE oc_id=oc.id),0) as valor_total""", "SELECT COUNT(*) as c"), params).fetchone()['c']
    query += " ORDER BY oc.data_emissao DESC LIMIT ? OFFSET ?"
    params += [per_page, (page - 1) * per_page]
    rows = conn.execute(query, params).fetchall()

    results = [dict(r) for r in rows]

    conn.close()
    return jsonify({'items': results, 'total': total, 'page': page})


@app.route('/api/ocs', methods=['POST'])
@permission_required('ver_compras')
def create_oc():
    data = request.json
    user = get_current_user()
    conn = get_db()

    try:
        conn.execute("BEGIN IMMEDIATE")
        numero = get_next_number('OC', conn)
        conn.execute('''INSERT INTO ordens_compra (numero, cadastro_id, comprador_id,
            data_emissao, data_entrega_prevista, condicao_pagamento, forma_pagamento,
            dados_pagamento, frete, transportadora, valor_frete, obs_transporte,
            observacoes, obs_interna, intermediario_nome, intermediario_cpf_cnpj,
            intermediario_comissao_tipo, intermediario_comissao_valor, intermediario_obs)
            VALUES (?,?,?,datetime('now','localtime'),?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''',
            (numero, data['cadastro_id'], data.get('comprador_id', user['id']),
             data.get('data_entrega_prevista'), json.dumps(data.get('condicao_pagamento', {})),
             data.get('forma_pagamento', 'Faturado'), json.dumps(data.get('dados_pagamento', {})),
             data.get('frete', 'FOB'), data.get('transportadora'), data.get('valor_frete'),
             data.get('obs_transporte'), data.get('observacoes'), data.get('obs_interna'),
             data.get('intermediario_nome'), data.get('intermediario_cpf_cnpj'),
             data.get('intermediario_comissao_tipo'), data.get('intermediario_comissao_valor'),
             data.get('intermediario_obs')))

        oc_id = conn.execute("SELECT last_insert_rowid() as id").fetchone()['id']

        for i, item in enumerate(data.get('items', [])):
            qtd = float(item.get('quantidade', 0))
            val_unit = float(item.get('valor_unitario', 0))
            unidade = item.get('unidade', 'UNIDADE')
            peso_unit = item.get('peso_unitario')
            peso_total = qtd if unidade == 'KG' else (float(peso_unit) * qtd if peso_unit else None)
            desconto = float(item.get('desconto_valor', 0))
            desc_tipo = item.get('desconto_tipo')
            # When unit is KVA, val_unit = price per kVA → multiply by potência
            campos_oc = item.get('campos_especificos', {})
            if unidade == 'KVA':
                pot = float(campos_oc.get('potencia', 0))
                valor_bruto = qtd * pot * val_unit if pot > 0 else qtd * val_unit
            else:
                valor_bruto = qtd * val_unit
            valor_total = valor_bruto * (1 - desconto/100) if desc_tipo == 'percentual' else (valor_bruto - desconto if desc_tipo == 'valor' else valor_bruto)

            # Add embalagem cost for Óleo Isolante
            emb_custo_oc = float(campos_oc.get('embalagem_custo_total', 0))
            if emb_custo_oc > 0:
                valor_total += emb_custo_oc

            conn.execute('''INSERT INTO oc_items (oc_id, ordem, categoria, campos_especificos,
                descricao_complementar, peso_unitario, peso_total, quantidade, unidade,
                valor_unitario, desconto_tipo, desconto_valor, valor_total)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)''',
                (oc_id, i, item['categoria'], json.dumps(item.get('campos_especificos', {})),
                 item.get('descricao_complementar'), peso_unit, peso_total, qtd, unidade,
                 val_unit, desc_tipo, desconto, valor_total))

        conn.commit()
    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({'error': 'Erro ao salvar: ' + str(e)}), 500

    conn.close()
    return jsonify({'ok': True, 'id': oc_id, 'numero': numero}), 201


@app.route('/api/ocs/<int:id>', methods=['GET'])
@permission_required('ver_compras')
def get_oc(id):
    conn = get_db()
    row = conn.execute("""SELECT oc.*, c.razao_social, c.nome_fantasia, c.cnpj_cpf,
        u.nome as comprador_nome FROM ordens_compra oc
        LEFT JOIN cadastros c ON oc.cadastro_id=c.id
        LEFT JOIN users u ON oc.comprador_id=u.id WHERE oc.id=?""", (id,)).fetchone()
    if not row:
        conn.close()
        return jsonify({'error': 'Não encontrada'}), 404

    oc = dict(row)
    items_raw = conn.execute("SELECT * FROM oc_items WHERE oc_id=? ORDER BY ordem", (id,)).fetchall()
    oc['items'] = []
    for item in items_raw:
        d = dict(item)
        d['campos_especificos'] = json.loads(d.get('campos_especificos') or '{}')
        # Add allocation info per item
        allocs = conn.execute("""SELECT li.id, li.quantidade_alocada, li.ov_id, ov.numero as ov_numero,
            li.valor_total_alocado FROM oc_ov_link_items li
            JOIN ordens_venda ov ON li.ov_id=ov.id WHERE li.oc_item_id=?""", (item['id'],)).fetchall()
        d['alocacoes'] = [dict(a) for a in allocs]
        d['total_alocado'] = sum(a['quantidade_alocada'] for a in d['alocacoes'])
        d['saldo_disponivel'] = (d['quantidade'] or 0) - d['total_alocado']
        oc['items'].append(d)

    oc['valor_total'] = sum(i['valor_total'] or 0 for i in oc['items'])
    oc['peso_total'] = sum(i['peso_total'] or 0 for i in oc['items'])

    # Linked OVs — legacy (whole-OC links)
    linked_ovs = conn.execute("""SELECT l.*, ov.numero as ov_numero, c.razao_social as cliente,
        COALESCE((SELECT SUM(valor_total) FROM ov_items WHERE ov_id=ov.id),0) as ov_valor_total,
        u.nome as vendedor_nome
        FROM oc_ov_links l JOIN ordens_venda ov ON l.ov_id=ov.id
        LEFT JOIN cadastros c ON ov.cadastro_id=c.id
        LEFT JOIN users u ON ov.vendedor_id=u.id
        WHERE l.oc_id=?""", (id,)).fetchall()
    oc['linked_ovs'] = [dict(r) for r in linked_ovs]
    custo_legacy = sum(l['valor_alocado_venda'] if l['valor_alocado_venda'] is not None else l['ov_valor_total'] for l in oc['linked_ovs'])

    # Item-level links totals
    custo_items = sum(sum(a['valor_total_alocado'] or 0 for a in i['alocacoes']) for i in oc['items'])

    oc['receita_total_vinculada'] = custo_legacy + custo_items
    has_links = bool(oc['linked_ovs']) or any(i['alocacoes'] for i in oc['items'])
    oc['margem_valor'] = oc['receita_total_vinculada'] - oc['valor_total'] if has_links else None
    oc['margem_pct'] = (oc['margem_valor'] / oc['receita_total_vinculada'] * 100) if oc['margem_valor'] is not None and oc['receita_total_vinculada'] > 0 else None

    # Anexos
    oc['anexos'] = [dict(r) for r in conn.execute("SELECT * FROM anexos WHERE entidade_tipo='OC' AND entidade_id=? AND deletado=0", (id,)).fetchall()]

    conn.close()
    return jsonify(oc)


@app.route('/api/ocs/<int:id>', methods=['PUT'])
@permission_required('ver_compras')
def update_oc(id):
    """Edit OC fields"""
    data = request.json
    user = get_current_user()
    conn = get_db()

    oc = conn.execute("SELECT * FROM ordens_compra WHERE id=?", (id,)).fetchone()
    if not oc:
        conn.close()
        return jsonify({'error': 'OC não encontrada'}), 404
    if oc['status'] == 'Cancelada':
        conn.close()
        return jsonify({'error': 'OC cancelada não pode ser editada'}), 400

    try:
        fields = []
        params = []
        updatable = ['nota_fiscal', 'numero_omie', 'data_entrega_prevista', 'frete',
                     'transportadora', 'valor_frete', 'obs_transporte', 'observacoes', 'obs_interna']
        for f in updatable:
            if f in data:
                fields.append(f"{f}=?")
                params.append(data[f])

        if fields:
            fields.append("updated_at=datetime('now','localtime')")
            params.append(id)
            conn.execute(f"UPDATE ordens_compra SET {', '.join(fields)} WHERE id=?", params)
            conn.execute("INSERT INTO audit_log (user_id, acao, entidade_tipo, entidade_id, detalhes) VALUES (?,?,?,?,?)",
                         (user['id'], 'editar', 'OC', id, json.dumps({k: data[k] for k in data if k in updatable})))
            conn.commit()

        return jsonify({'ok': True})
    except Exception as e:
        conn.rollback()
        app.logger.exception('Erro interno'); return jsonify({'error': 'Erro interno do servidor'}), 500
    finally:
        conn.close()


@app.route('/api/ocs/<int:id>/receber', methods=['PUT'])
@permission_required('ver_compras')
def receber_oc_item(id):
    """Update received quantity for OC item"""
    data = request.json
    conn = get_db()
    if not data.get('item_id') or data.get('quantidade_recebida') is None:
        conn.close()
        return jsonify({'error': 'item_id e quantidade_recebida são obrigatórios'}), 400
    item_id = data['item_id']
    qtd_recebida = float(data['quantidade_recebida'])

    item = conn.execute("SELECT * FROM oc_items WHERE id=? AND oc_id=?", (item_id, id)).fetchone()
    if not item:
        conn.close()
        return jsonify({'error': 'Item não encontrado'}), 404

    new_status = 'Recebido Total' if qtd_recebida >= item['quantidade'] else 'Recebido Parcial'
    conn.execute("UPDATE oc_items SET quantidade_recebida=?, status=?, updated_at=datetime('now','localtime') WHERE id=?",
                 (qtd_recebida, new_status, item_id))

    # Update OC status
    all_items = conn.execute("SELECT status FROM oc_items WHERE oc_id=?", (id,)).fetchall()
    statuses = [i['status'] for i in all_items]
    if all(s == 'Recebido Total' for s in statuses):
        conn.execute("UPDATE ordens_compra SET status='Recebida Total', updated_at=datetime('now','localtime') WHERE id=?", (id,))
    elif any(s in ('Recebido Parcial', 'Recebido Total') for s in statuses):
        conn.execute("UPDATE ordens_compra SET status='Recebida Parcial', updated_at=datetime('now','localtime') WHERE id=?", (id,))

    conn.commit()
    conn.close()
    return jsonify({'ok': True})


@app.route('/api/ocs/<int:id>/status', methods=['PUT'])
@permission_required('ver_compras')
def update_oc_status(id):
    data = request.json
    user = get_current_user()
    conn = get_db()
    new_status = data.get('status')
    if not new_status:
        conn.close()
        return jsonify({'error': 'Campo status é obrigatório'}), 400
    valid_oc_statuses = ('Pendente', 'Aprovada', 'Em Trânsito', 'Recebida Parcial', 'Recebida', 'Cancelada')
    if new_status not in valid_oc_statuses:
        conn.close()
        return jsonify({'error': f'Status inválido. Válidos: {", ".join(valid_oc_statuses)}'}), 400

    if new_status == 'Cancelada':
        oc = conn.execute("SELECT * FROM ordens_compra WHERE id=?", (id,)).fetchone()
        if user['perfil'] == 'vendedor' and oc['comprador_id'] != user['id']:
            conn.close()
            return jsonify({'error': 'Vendedor só pode cancelar suas próprias OCs'}), 403

        conn.execute("""UPDATE ordens_compra SET status='Cancelada', motivo_cancelamento=?,
            cancelado_por=?, cancelado_em=datetime('now','localtime'), updated_at=datetime('now','localtime')
            WHERE id=?""", (data.get('motivo', ''), user['id'], id))
    else:
        conn.execute("UPDATE ordens_compra SET status=?, updated_at=datetime('now','localtime') WHERE id=?", (new_status, id))

    conn.commit()
    conn.close()
    return jsonify({'ok': True})


# ============ OC-OV ITEM-LEVEL LINKS ============

@app.route('/api/ocs/<int:oc_id>/items-saldo', methods=['GET'])
@login_required
def get_oc_items_saldo(oc_id):
    """Returns OC items with available balance (saldo) for linking"""
    conn = get_db()
    ov_id = request.args.get('ov_id', '')
    items = conn.execute("""SELECT oi.*,
        oi.quantidade - COALESCE((SELECT SUM(quantidade_alocada) FROM oc_ov_link_items WHERE oc_item_id=oi.id), 0) as saldo_disponivel,
        COALESCE((SELECT SUM(quantidade_alocada) FROM oc_ov_link_items WHERE oc_item_id=oi.id), 0) as total_alocado
        FROM oc_items oi WHERE oi.oc_id=? ORDER BY oi.ordem""", (oc_id,)).fetchall()
    result = []
    for item in items:
        d = dict(item)
        d['campos_especificos'] = json.loads(d.get('campos_especificos') or '{}')
        # Show allocations for this item
        allocs = conn.execute("""SELECT li.quantidade_alocada, li.ov_id, ov.numero as ov_numero
            FROM oc_ov_link_items li JOIN ordens_venda ov ON li.ov_id=ov.id
            WHERE li.oc_item_id=?""", (item['id'],)).fetchall()
        d['alocacoes'] = [dict(a) for a in allocs]
        result.append(d)
    conn.close()
    return jsonify(result)


@app.route('/api/oc-ov-link-items', methods=['POST'])
@login_required
def create_oc_ov_link_items():
    """Create item-level links between OC items and an OV"""
    data = request.json
    user = get_current_user()
    oc_id = data.get('oc_id')
    ov_id = data.get('ov_id')
    items = data.get('items', [])

    if not oc_id or not ov_id or not items:
        return jsonify({'error': 'oc_id, ov_id e items são obrigatórios'}), 400

    conn = get_db()
    try:
        conn.execute("BEGIN IMMEDIATE")

        # Validate OC and OV exist
        oc = conn.execute("SELECT id FROM ordens_compra WHERE id=?", (oc_id,)).fetchone()
        ov = conn.execute("SELECT id FROM ordens_venda WHERE id=?", (ov_id,)).fetchone()
        if not oc or not ov:
            return jsonify({'error': 'OC ou OV não encontrada'}), 404

        created_ids = []
        for item in items:
            oc_item_id = item.get('oc_item_id')
            qtd = float(item.get('quantidade_alocada', 0))
            if qtd <= 0:
                continue

            # Validate item belongs to OC
            oc_item = conn.execute("SELECT * FROM oc_items WHERE id=? AND oc_id=?", (oc_item_id, oc_id)).fetchone()
            if not oc_item:
                conn.rollback()
                return jsonify({'error': f'Item {oc_item_id} não pertence à OC {oc_id}'}), 400

            # Check saldo
            alocado = conn.execute("SELECT COALESCE(SUM(quantidade_alocada),0) as total FROM oc_ov_link_items WHERE oc_item_id=?",
                                   (oc_item_id,)).fetchone()['total']
            saldo = oc_item['quantidade'] - alocado
            if qtd > saldo + 0.001:  # small tolerance for float
                conn.rollback()
                return jsonify({'error': f'{oc_item["categoria"]}: saldo disponível é {saldo:.2f} {oc_item["unidade"]}, tentou alocar {qtd:.2f}'}), 400

            valor_unit = oc_item['valor_unitario']
            valor_total = qtd * valor_unit

            conn.execute("""INSERT INTO oc_ov_link_items
                (oc_id, ov_id, oc_item_id, quantidade_alocada, unidade, valor_unitario, valor_total_alocado, observacao, created_by)
                VALUES (?,?,?,?,?,?,?,?,?)""",
                (oc_id, ov_id, oc_item_id, qtd, oc_item['unidade'], valor_unit, valor_total,
                 item.get('observacao', ''), user['id']))
            created_ids.append(conn.execute("SELECT last_insert_rowid() as id").fetchone()['id'])

        if not created_ids:
            conn.rollback()
            return jsonify({'error': 'Nenhum item com quantidade válida'}), 400

        conn.commit()
        return jsonify({'ok': True, 'ids': created_ids, 'count': len(created_ids)}), 201
    except Exception as e:
        conn.rollback()
        app.logger.exception('Erro interno'); return jsonify({'error': 'Erro interno do servidor'}), 500
    finally:
        conn.close()


@app.route('/api/oc-ov-link-items/<int:link_id>', methods=['DELETE'])
@login_required
def delete_oc_ov_link_item(link_id):
    conn = get_db()
    try:
        link = conn.execute("SELECT * FROM oc_ov_link_items WHERE id=?", (link_id,)).fetchone()
        if not link:
            return jsonify({'error': 'Vínculo não encontrado'}), 404
        conn.execute("DELETE FROM oc_ov_link_items WHERE id=?", (link_id,))
        conn.commit()
        return jsonify({'ok': True})
    finally:
        conn.close()


# ============ OC-OV LINKS LEGACY (kept for backward compat) ============

@app.route('/api/oc-ov-links', methods=['POST'])
@login_required
def create_oc_ov_link():
    data = request.json
    user = get_current_user()
    conn = get_db()
    try:
        oc = conn.execute("SELECT id, status FROM ordens_compra WHERE id=?", (data['oc_id'],)).fetchone()
        ov = conn.execute("SELECT id, status FROM ordens_venda WHERE id=?", (data['ov_id'],)).fetchone()
        if not oc or not ov:
            return jsonify({'error': 'OC ou OV não encontrada'}), 404

        conn.execute("""INSERT INTO oc_ov_links (oc_id, ov_id, descricao, valor_alocado_compra, valor_alocado_venda, created_by)
            VALUES (?,?,?,?,?,?)""",
            (data['oc_id'], data['ov_id'], data.get('descricao', ''),
             data.get('valor_alocado_compra'), data.get('valor_alocado_venda'), user['id']))
        conn.commit()
        return jsonify({'ok': True, 'id': conn.execute("SELECT last_insert_rowid() as id").fetchone()['id']})
    except Exception as e:
        if 'UNIQUE' in str(e):
            return jsonify({'error': 'Este vínculo já existe'}), 409
        app.logger.exception('Erro interno'); return jsonify({'error': 'Erro interno do servidor'}), 500
    finally:
        conn.close()


@app.route('/api/oc-ov-links/<int:link_id>', methods=['DELETE'])
@login_required
def delete_oc_ov_link(link_id):
    conn = get_db()
    try:
        link = conn.execute("SELECT * FROM oc_ov_links WHERE id=?", (link_id,)).fetchone()
        if not link:
            return jsonify({'error': 'Vínculo não encontrado'}), 404
        conn.execute("DELETE FROM oc_ov_links WHERE id=?", (link_id,))
        conn.commit()
        return jsonify({'ok': True})
    finally:
        conn.close()


@app.route('/api/oc-ov-links/<int:link_id>', methods=['PUT'])
@login_required
def update_oc_ov_link(link_id):
    data = request.json
    conn = get_db()
    try:
        link = conn.execute("SELECT * FROM oc_ov_links WHERE id=?", (link_id,)).fetchone()
        if not link:
            return jsonify({'error': 'Vínculo não encontrado'}), 404
        conn.execute("""UPDATE oc_ov_links SET descricao=?, valor_alocado_compra=?, valor_alocado_venda=? WHERE id=?""",
            (data.get('descricao', link['descricao']),
             data.get('valor_alocado_compra', link['valor_alocado_compra']),
             data.get('valor_alocado_venda', link['valor_alocado_venda']),
             link_id))
        conn.commit()
        return jsonify({'ok': True})
    finally:
        conn.close()


@app.route('/api/ovs/<int:id>/links', methods=['GET'])
@login_required
def get_ov_links(id):
    conn = get_db()
    try:
        links = conn.execute("""SELECT l.*, oc.numero as oc_numero, c.razao_social as fornecedor,
            COALESCE((SELECT SUM(valor_total) FROM oc_items WHERE oc_id=oc.id),0) as oc_valor_total,
            u.nome as comprador_nome
            FROM oc_ov_links l
            JOIN ordens_compra oc ON l.oc_id=oc.id
            LEFT JOIN cadastros c ON oc.cadastro_id=c.id
            LEFT JOIN users u ON oc.comprador_id=u.id
            WHERE l.ov_id=?
            ORDER BY l.created_at DESC""", (id,)).fetchall()
        return jsonify([dict(r) for r in links])
    finally:
        conn.close()


@app.route('/api/ocs/<int:id>/links', methods=['GET'])
@login_required
def get_oc_links(id):
    conn = get_db()
    try:
        links = conn.execute("""SELECT l.*, ov.numero as ov_numero, c.razao_social as cliente,
            COALESCE((SELECT SUM(valor_total) FROM ov_items WHERE ov_id=ov.id),0) as ov_valor_total,
            u.nome as vendedor_nome
            FROM oc_ov_links l
            JOIN ordens_venda ov ON l.ov_id=ov.id
            LEFT JOIN cadastros c ON ov.cadastro_id=c.id
            LEFT JOIN users u ON ov.vendedor_id=u.id
            WHERE l.oc_id=?
            ORDER BY l.created_at DESC""", (id,)).fetchall()
        return jsonify([dict(r) for r in links])
    finally:
        conn.close()


@app.route('/api/oc-ov-search', methods=['GET'])
@login_required
def search_oc_ov():
    """Search OCs or OVs for linking"""
    tipo = request.args.get('tipo', 'oc')  # 'oc' or 'ov'
    q = request.args.get('q', '')
    conn = get_db()
    try:
        if tipo == 'oc':
            rows = conn.execute("""SELECT oc.id, oc.numero, c.razao_social, oc.data_emissao,
                COALESCE((SELECT SUM(valor_total) FROM oc_items WHERE oc_id=oc.id),0) as valor_total
                FROM ordens_compra oc LEFT JOIN cadastros c ON oc.cadastro_id=c.id
                WHERE oc.status != 'Cancelada' AND (oc.numero LIKE ? OR c.razao_social LIKE ?)
                ORDER BY oc.data_emissao DESC LIMIT 20""", (f'%{q}%', f'%{q}%')).fetchall()
        else:
            rows = conn.execute("""SELECT ov.id, ov.numero, c.razao_social, ov.data_emissao,
                COALESCE((SELECT SUM(valor_total) FROM ov_items WHERE ov_id=ov.id),0) as valor_total
                FROM ordens_venda ov LEFT JOIN cadastros c ON ov.cadastro_id=c.id
                WHERE ov.status != 'Cancelada' AND (ov.numero LIKE ? OR c.razao_social LIKE ?)
                ORDER BY ov.data_emissao DESC LIMIT 20""", (f'%{q}%', f'%{q}%')).fetchall()
        return jsonify([dict(r) for r in rows])
    finally:
        conn.close()


# ============ CONTAS A RECEBER ============

@app.route('/api/parcelas', methods=['GET'])
@gestor_required
def list_parcelas():
    conn = get_db()
    filtro = request.args.get('filtro', 'todas')  # vencidas, semana, mes, todas
    cliente = request.args.get('cliente', '')
    vendedor = request.args.get('vendedor', '')

    hoje = datetime.now().strftime('%Y-%m-%d')
    fim_semana = (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')
    _, last_day = calendar.monthrange(datetime.now().year, datetime.now().month)
    fim_mes = datetime.now().replace(day=last_day).strftime('%Y-%m-%d')

    # Auto-update vencidas
    conn.execute("UPDATE ov_parcelas SET status='Vencida' WHERE status='Pendente' AND date(data_vencimento)<?", (hoje,))
    conn.commit()

    query = """SELECT p.*, ov.numero as ov_numero, ov.vendedor_id,
               c.razao_social, c.nome_fantasia, u.nome as vendedor_nome
               FROM ov_parcelas p
               JOIN ordens_venda ov ON p.ov_id=ov.id
               JOIN cadastros c ON ov.cadastro_id=c.id
               LEFT JOIN users u ON ov.vendedor_id=u.id
               WHERE p.status IN ('Pendente','Vencida')"""
    params = []

    if filtro == 'vencidas':
        query += " AND p.status='Vencida'"
    elif filtro == 'semana':
        query += " AND date(p.data_vencimento) BETWEEN ? AND ?"
        params += [hoje, fim_semana]
    elif filtro == 'mes':
        query += " AND strftime('%Y-%m', p.data_vencimento) = strftime('%Y-%m', 'now','localtime')"

    if cliente:
        query += " AND c.razao_social LIKE ?"
        params.append(f'%{cliente}%')
    if vendedor:
        query += " AND u.nome LIKE ?"
        params.append(f'%{vendedor}%')

    query += " ORDER BY CASE WHEN p.status='Vencida' THEN 0 ELSE 1 END, p.data_vencimento"
    rows = conn.execute(query, params).fetchall()

    # Totals
    total_receber = conn.execute("SELECT COALESCE(SUM(valor),0) as t FROM ov_parcelas WHERE status IN ('Pendente','Vencida')").fetchone()['t']
    total_vencido = conn.execute("SELECT COALESCE(SUM(valor),0) as t FROM ov_parcelas WHERE status='Vencida'").fetchone()['t']
    total_semana = conn.execute("SELECT COALESCE(SUM(valor),0) as t FROM ov_parcelas WHERE status='Pendente' AND date(data_vencimento) BETWEEN ? AND ?", (hoje, fim_semana)).fetchone()['t']

    conn.close()
    return jsonify({
        'items': [dict(r) for r in rows],
        'total_receber': total_receber,
        'total_vencido': total_vencido,
        'total_semana': total_semana
    })


@app.route('/api/parcelas/marcar', methods=['POST'])
@gestor_required
def marcar_parcelas():
    """Batch mark parcelas as paid"""
    data = request.json
    user = get_current_user()
    conn = get_db()
    ids = data.get('ids', [])
    status = data.get('status', 'Paga')

    for pid in ids:
        conn.execute("""UPDATE ov_parcelas SET status=?, data_pagamento=date('now','localtime'),
            marcado_por=?, updated_at=datetime('now','localtime') WHERE id=?""",
            (status, user['id'], pid))

    conn.commit()
    conn.close()
    return jsonify({'ok': True, 'marcadas': len(ids)})


# ============ CONTAS A PAGAR (OC PARCELAS) ============

@app.route('/api/parcelas/<int:id>/baixa-parcial', methods=['POST'])
@gestor_required
def baixa_parcial(id):
    """Record partial payment on a parcela"""
    data = request.json
    user = get_current_user()
    conn = get_db()

    parcela = conn.execute("SELECT * FROM ov_parcelas WHERE id=?", (id,)).fetchone()
    if not parcela:
        conn.close()
        return jsonify({'error': 'Parcela não encontrada'}), 404

    valor_pago = float(data.get('valor_pago', 0))
    if valor_pago <= 0:
        conn.close()
        return jsonify({'error': 'Valor deve ser positivo'}), 400

    valor_ja_recebido = float(parcela['valor_recebido'] or 0)
    novo_total_recebido = valor_ja_recebido + valor_pago
    valor_parcela = float(parcela['valor'])

    if novo_total_recebido >= valor_parcela:
        # Fully paid
        conn.execute("""UPDATE ov_parcelas SET status='Paga', valor_recebido=?,
            data_pagamento=?, marcado_por=?, updated_at=datetime('now','localtime') WHERE id=?""",
            (valor_parcela, data.get('data_pagamento', datetime.now().strftime('%Y-%m-%d')), user['id'], id))
    else:
        # Partially paid
        conn.execute("""UPDATE ov_parcelas SET status='Paga Parcial', valor_recebido=?,
            data_pagamento=?, marcado_por=?, updated_at=datetime('now','localtime') WHERE id=?""",
            (novo_total_recebido, data.get('data_pagamento', datetime.now().strftime('%Y-%m-%d')), user['id'], id))

    conn.execute("INSERT INTO audit_log (user_id, acao, entidade_tipo, entidade_id, detalhes) VALUES (?,?,?,?,?)",
                 (user['id'], 'baixa_parcial', 'ov_parcela', id,
                  json.dumps({'valor_pago': valor_pago, 'total_recebido': novo_total_recebido, 'valor_parcela': valor_parcela})))
    conn.commit()
    conn.close()
    return jsonify({'ok': True, 'novo_status': 'Paga' if novo_total_recebido >= valor_parcela else 'Paga Parcial',
                    'valor_recebido': novo_total_recebido})


@app.route('/api/oc-parcelas/<int:id>/baixa-parcial', methods=['POST'])
@gestor_required
def baixa_parcial_oc(id):
    """Record partial payment on an OC parcela"""
    data = request.json
    user = get_current_user()
    conn = get_db()

    parcela = conn.execute("SELECT * FROM oc_parcelas WHERE id=?", (id,)).fetchone()
    if not parcela:
        conn.close()
        return jsonify({'error': 'Parcela não encontrada'}), 404

    valor_pago = float(data.get('valor_pago', 0))
    if valor_pago <= 0:
        conn.close()
        return jsonify({'error': 'Valor deve ser positivo'}), 400

    valor_ja_pago = float(parcela['valor_pago'] or 0)
    novo_total_pago = valor_ja_pago + valor_pago
    valor_parcela = float(parcela['valor'])

    if novo_total_pago >= valor_parcela:
        conn.execute("""UPDATE oc_parcelas SET status='Paga', valor_pago=?,
            data_pagamento=?, marcado_por=?, updated_at=datetime('now','localtime') WHERE id=?""",
            (valor_parcela, data.get('data_pagamento', datetime.now().strftime('%Y-%m-%d')), user['id'], id))
    else:
        conn.execute("""UPDATE oc_parcelas SET status='Paga Parcial', valor_pago=?,
            data_pagamento=?, marcado_por=?, updated_at=datetime('now','localtime') WHERE id=?""",
            (novo_total_pago, data.get('data_pagamento', datetime.now().strftime('%Y-%m-%d')), user['id'], id))

    conn.commit()
    conn.close()
    return jsonify({'ok': True, 'novo_status': 'Paga' if novo_total_pago >= valor_parcela else 'Paga Parcial',
                    'valor_recebido': novo_total_pago})


@app.route('/api/oc-parcelas', methods=['GET'])
@gestor_required
def list_oc_parcelas():
    conn = get_db()
    filtro = request.args.get('filtro', 'todas')
    fornecedor = request.args.get('fornecedor', '')

    hoje = datetime.now().strftime('%Y-%m-%d')
    fim_semana = (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')

    # Auto-update vencidas
    conn.execute("UPDATE oc_parcelas SET status='Vencida' WHERE status='Pendente' AND date(data_vencimento)<?", (hoje,))
    conn.commit()

    query = """SELECT p.*, oc.numero as oc_numero, oc.comprador_id,
               c.razao_social, u.nome as comprador_nome
               FROM oc_parcelas p
               JOIN ordens_compra oc ON p.oc_id=oc.id
               JOIN cadastros c ON oc.cadastro_id=c.id
               LEFT JOIN users u ON oc.comprador_id=u.id
               WHERE p.status IN ('Pendente','Vencida')"""
    params = []

    if filtro == 'vencidas':
        query += " AND p.status='Vencida'"
    elif filtro == 'semana':
        query += " AND date(p.data_vencimento) BETWEEN ? AND ?"
        params += [hoje, fim_semana]
    elif filtro == 'mes':
        query += " AND strftime('%Y-%m', p.data_vencimento) = strftime('%Y-%m', 'now','localtime')"

    if fornecedor:
        query += " AND c.razao_social LIKE ?"
        params.append(f'%{fornecedor}%')

    query += " ORDER BY CASE WHEN p.status='Vencida' THEN 0 ELSE 1 END, p.data_vencimento"
    rows = conn.execute(query, params).fetchall()

    total_pagar = conn.execute("SELECT COALESCE(SUM(valor),0) as t FROM oc_parcelas WHERE status IN ('Pendente','Vencida')").fetchone()['t']
    total_vencido = conn.execute("SELECT COALESCE(SUM(valor),0) as t FROM oc_parcelas WHERE status='Vencida'").fetchone()['t']
    total_semana = conn.execute("SELECT COALESCE(SUM(valor),0) as t FROM oc_parcelas WHERE status='Pendente' AND date(data_vencimento) BETWEEN ? AND ?", (hoje, fim_semana)).fetchone()['t']

    conn.close()
    return jsonify({
        'items': [dict(r) for r in rows],
        'total_pagar': total_pagar,
        'total_vencido': total_vencido,
        'total_semana': total_semana
    })


@app.route('/api/oc-parcelas/marcar', methods=['POST'])
@gestor_required
def marcar_oc_parcelas():
    data = request.json
    user = get_current_user()
    conn = get_db()
    ids = data.get('ids', [])
    status = data.get('status', 'Paga')

    for pid in ids:
        conn.execute("""UPDATE oc_parcelas SET status=?, data_pagamento=date('now','localtime'),
            marcado_por=?, updated_at=datetime('now','localtime') WHERE id=?""",
            (status, user['id'], pid))

    conn.commit()
    conn.close()
    return jsonify({'ok': True, 'marcadas': len(ids)})


# ============ CASHFLOW (FLUXO DE CAIXA) ============

@app.route('/api/cashflow')
@gestor_required
def cashflow():
    conn = get_db()
    hoje = datetime.now().strftime('%Y-%m-%d')
    fim_90d = (datetime.now() + timedelta(days=90)).strftime('%Y-%m-%d')

    # Entradas (ov_parcelas pendentes nos próximos 90 dias)
    entradas = conn.execute("""
        SELECT p.data_vencimento, p.valor, ov.numero, c.razao_social, u.nome as vendedor_nome, p.status
        FROM ov_parcelas p
        JOIN ordens_venda ov ON p.ov_id=ov.id
        LEFT JOIN cadastros c ON ov.cadastro_id=c.id
        LEFT JOIN users u ON ov.vendedor_id=u.id
        WHERE p.status IN ('Pendente','Vencida')
        AND date(p.data_vencimento) <= ?
        ORDER BY p.data_vencimento
    """, (fim_90d,)).fetchall()

    # Saidas (oc_parcelas pendentes nos próximos 90 dias)
    saidas = conn.execute("""
        SELECT p.data_vencimento, p.valor, oc.numero, c.razao_social, u.nome as comprador_nome, p.status
        FROM oc_parcelas p
        JOIN ordens_compra oc ON p.oc_id=oc.id
        LEFT JOIN cadastros c ON oc.cadastro_id=c.id
        LEFT JOIN users u ON oc.comprador_id=u.id
        WHERE p.status IN ('Pendente','Vencida')
        AND date(p.data_vencimento) <= ?
        ORDER BY p.data_vencimento
    """, (fim_90d,)).fetchall()

    # Agrupar por semana
    semanas_entradas = defaultdict(float)
    semanas_saidas = defaultdict(float)
    detalhe_entradas = []
    detalhe_saidas = []

    for e in entradas:
        dt = datetime.strptime(e['data_vencimento'][:10], '%Y-%m-%d')
        # Semana = segunda-feira da semana
        seg = dt - timedelta(days=dt.weekday())
        semanas_entradas[seg.strftime('%Y-%m-%d')] += e['valor']
        detalhe_entradas.append(dict(e))

    for s in saidas:
        dt = datetime.strptime(s['data_vencimento'][:10], '%Y-%m-%d')
        seg = dt - timedelta(days=dt.weekday())
        semanas_saidas[seg.strftime('%Y-%m-%d')] += s['valor']
        detalhe_saidas.append(dict(s))

    # Montar semanas (13 semanas = ~90 dias)
    semanas = []
    dt_inicio = datetime.now() - timedelta(days=datetime.now().weekday())  # segunda atual
    saldo_acumulado = 0

    for i in range(13):
        seg = dt_inicio + timedelta(weeks=i)
        dom = seg + timedelta(days=6)
        key = seg.strftime('%Y-%m-%d')
        entrada = round(semanas_entradas.get(key, 0), 2)
        saida = round(semanas_saidas.get(key, 0), 2)
        saldo_acumulado += entrada - saida
        semanas.append({
            'semana': i + 1,
            'inicio': key,
            'fim': dom.strftime('%Y-%m-%d'),
            'label': f"{seg.strftime('%d/%m')} - {dom.strftime('%d/%m')}",
            'entradas': entrada,
            'saidas': saida,
            'saldo_semana': round(entrada - saida, 2),
            'saldo_acumulado': round(saldo_acumulado, 2)
        })

    # Totais
    total_entradas = sum(e['valor'] for e in entradas)
    total_saidas = sum(s['valor'] for s in saidas)

    # Vencidos
    vencido_receber = conn.execute("SELECT COALESCE(SUM(valor),0) as t FROM ov_parcelas WHERE status='Vencida'").fetchone()['t']
    vencido_pagar = conn.execute("SELECT COALESCE(SUM(valor),0) as t FROM oc_parcelas WHERE status='Vencida'").fetchone()['t']

    conn.close()
    return jsonify({
        'semanas': semanas,
        'totais': {
            'total_entradas': round(total_entradas, 2),
            'total_saidas': round(total_saidas, 2),
            'saldo_projetado': round(total_entradas - total_saidas, 2),
            'vencido_receber': round(vencido_receber, 2),
            'vencido_pagar': round(vencido_pagar, 2)
        },
        'detalhe_entradas': detalhe_entradas[:50],
        'detalhe_saidas': detalhe_saidas[:50]
    })


# ============ PRICE HISTORY ============

@app.route('/api/historico-precos')
@login_required
def historico_precos():
    """Get last 3 prices for a category, for specific client and all clients"""
    categoria = request.args.get('categoria', '')
    cadastro_id = request.args.get('cadastro_id', '')
    tipo = request.args.get('tipo', 'VENDA')  # VENDA or COMPRA
    conn = get_db()

    results = {'cliente': [], 'geral': [], 'compra': []}

    if tipo == 'VENDA' or tipo == 'COMPRA':
        # Last 3 for this client (from OVs)
        if cadastro_id:
            rows = conn.execute("""
                SELECT oi.valor_unitario, oi.unidade, oi.quantidade, ov.data_emissao, ov.numero
                FROM ov_items oi JOIN ordens_venda ov ON oi.ov_id=ov.id
                WHERE oi.categoria=? AND ov.cadastro_id=? AND ov.status!='Cancelada'
                ORDER BY ov.data_emissao DESC LIMIT 3
            """, (categoria, cadastro_id)).fetchall()
            results['cliente'] = [dict(r) for r in rows]

        # Last 3 for any client (from OVs)
        rows = conn.execute("""
            SELECT oi.valor_unitario, oi.unidade, oi.quantidade, ov.data_emissao, ov.numero, c.razao_social
            FROM ov_items oi JOIN ordens_venda ov ON oi.ov_id=ov.id
            LEFT JOIN cadastros c ON ov.cadastro_id=c.id
            WHERE oi.categoria=? AND ov.status!='Cancelada'
            ORDER BY ov.data_emissao DESC LIMIT 3
        """, (categoria,)).fetchall()
        results['geral'] = [dict(r) for r in rows]

    # Last 3 purchases (from OCs)
    rows = conn.execute("""
        SELECT oi.valor_unitario, oi.unidade, oi.quantidade, oc.data_emissao, oc.numero
        FROM oc_items oi JOIN ordens_compra oc ON oi.oc_id=oc.id
        WHERE oi.categoria=? AND oc.status!='Cancelada'
        ORDER BY oc.data_emissao DESC LIMIT 3
    """, (categoria,)).fetchall()
    results['compra'] = [dict(r) for r in rows]

    conn.close()
    return jsonify(results)


# ============ NOTES ============

@app.route('/api/notas', methods=['GET'])
@login_required
def list_notas():
    user = get_current_user()
    conn = get_db()
    rows = conn.execute("SELECT * FROM notas WHERE user_id=? ORDER BY fixada DESC, updated_at DESC", (user['id'],)).fetchall()
    conn.close()
    return jsonify({'items': [dict(r) for r in rows]})

@app.route('/api/notas', methods=['POST'])
@login_required
def create_nota():
    data = request.json
    user = get_current_user()
    conn = get_db()
    conn.execute('''INSERT INTO notas (user_id, titulo, conteudo, tags, cor, fixada,
        vinculo_tipo, vinculo_id, checklist, lembrete_data)
        VALUES (?,?,?,?,?,?,?,?,?,?)''',
        (user['id'], data.get('titulo'), data.get('conteudo'),
         json.dumps(data.get('tags', [])), data.get('cor'),
         data.get('fixada', 0), data.get('vinculo_tipo'), data.get('vinculo_id'),
         json.dumps(data.get('checklist', [])), data.get('lembrete_data')))
    nid = conn.execute("SELECT last_insert_rowid() as id").fetchone()['id']
    conn.commit()
    conn.close()
    return jsonify({'ok': True, 'id': nid}), 201

@app.route('/api/notas/<int:id>', methods=['PUT'])
@login_required
def update_nota(id):
    data = request.json
    user = get_current_user()
    conn = get_db()
    conn.execute('''UPDATE notas SET titulo=?, conteudo=?, tags=?, cor=?, fixada=?,
        vinculo_tipo=?, vinculo_id=?, checklist=?, lembrete_data=?, updated_at=datetime('now','localtime')
        WHERE id=? AND user_id=?''',
        (data.get('titulo'), data.get('conteudo'), json.dumps(data.get('tags', [])),
         data.get('cor'), data.get('fixada', 0), data.get('vinculo_tipo'), data.get('vinculo_id'),
         json.dumps(data.get('checklist', [])), data.get('lembrete_data'), id, user['id']))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})


# ============ FOLLOW-UPS ============

@app.route('/api/followups', methods=['GET'])
@login_required
def list_followups():
    user = get_current_user()
    conn = get_db()
    hoje = datetime.now().strftime('%Y-%m-%d')

    if user['perfil'] == 'vendedor':
        # Vendedor: só os próprios
        rows = conn.execute("""SELECT f.*, c.razao_social, c.nome_fantasia, u.nome as responsavel_nome
            FROM followups f
            LEFT JOIN cadastros c ON f.cadastro_id=c.id
            LEFT JOIN users u ON f.user_id=u.id
            WHERE f.user_id=? AND f.concluido=0
            ORDER BY CASE WHEN date(f.data_hora)<? THEN 0 ELSE 1 END, f.data_hora""",
            (user['id'], hoje)).fetchall()
        equipe = []
    else:
        # Gestor/diretor: vê os de toda a equipe, com filtro opcional por vendedor
        filtro_vendedor = request.args.get('vendedor_id', type=int)
        vend_clause = ""
        params = []
        if filtro_vendedor:
            vend_clause = "AND f.user_id=?"
            params.append(filtro_vendedor)
        params.append(hoje)  # para o ORDER BY CASE WHEN date<?
        rows = conn.execute(f"""SELECT f.*, c.razao_social, c.nome_fantasia, u.nome as responsavel_nome
            FROM followups f
            LEFT JOIN cadastros c ON f.cadastro_id=c.id
            LEFT JOIN users u ON f.user_id=u.id
            WHERE f.concluido=0 {vend_clause}
            ORDER BY CASE WHEN date(f.data_hora)<? THEN 0 ELSE 1 END, f.data_hora""",
            params).fetchall()
        # Lista de vendedores com follow-ups pendentes (para o filtro no front)
        equipe = [dict(r) for r in conn.execute("""SELECT DISTINCT u.id, u.nome
            FROM followups f JOIN users u ON f.user_id=u.id
            WHERE f.concluido=0 ORDER BY u.nome""").fetchall()]
    conn.close()
    return jsonify({'items': [dict(r) for r in rows], 'equipe': equipe})

@app.route('/api/followups', methods=['POST'])
@login_required
def create_followup():
    data = request.json
    user = get_current_user()
    conn = get_db()
    conn.execute('''INSERT INTO followups (user_id, cadastro_id, vinculo_tipo, vinculo_id, acao, data_hora)
        VALUES (?,?,?,?,?,?)''',
        (user['id'], data.get('cadastro_id'), data.get('vinculo_tipo'),
         data.get('vinculo_id'), data['acao'], data['data_hora']))
    fid = conn.execute("SELECT last_insert_rowid() as id").fetchone()['id']
    conn.commit()
    conn.close()
    return jsonify({'ok': True, 'id': fid}), 201

@app.route('/api/followups/<int:id>/concluir', methods=['PUT'])
@login_required
def concluir_followup(id):
    user = get_current_user()
    conn = get_db()
    # Verificar ownership: usuário só conclui seus próprios followups (gestor pode concluir qualquer)
    if user['perfil'] == 'vendedor':
        f = conn.execute("SELECT user_id FROM followups WHERE id=?", (id,)).fetchone()
        if not f or f['user_id'] != user['id']:
            conn.close()
            return jsonify({'error': 'Sem permissão'}), 403
    conn.execute("UPDATE followups SET concluido=1, concluido_em=datetime('now','localtime') WHERE id=?", (id,))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})


# ============ INTERACTIONS ============

@app.route('/api/interacoes/<int:cadastro_id>', methods=['GET'])
@login_required
def list_interacoes(cadastro_id):
    conn = get_db()
    rows = conn.execute("""SELECT i.*, u.nome as user_nome FROM interacoes i
        LEFT JOIN users u ON i.user_id=u.id WHERE i.cadastro_id=?
        ORDER BY i.data DESC LIMIT 50""", (cadastro_id,)).fetchall()
    conn.close()
    return jsonify({'items': [dict(r) for r in rows]})

@app.route('/api/interacoes', methods=['POST'])
@login_required
def create_interacao():
    data = request.json
    user = get_current_user()
    conn = get_db()
    conn.execute("INSERT INTO interacoes (cadastro_id, user_id, tipo, descricao, data) VALUES (?,?,?,?,?)",
        (data['cadastro_id'], user['id'], data['tipo'], data['descricao'],
         data.get('data', datetime.now().strftime('%Y-%m-%d %H:%M'))))
    conn.commit()
    conn.close()
    return jsonify({'ok': True}), 201


# ============ GLOBAL SEARCH ============

@app.route('/api/busca')
@login_required
def busca_global():
    q = request.args.get('q', '').strip()
    if not q or len(q) < 2:
        return jsonify({'items': []})

    conn = get_db()
    results = []

    # Try FTS5 first (fast), fall back to LIKE if no FTS results
    fts_query = q.replace('"', '').replace("'", '')
    # FTS5 match with prefix search (e.g. "abm*" matches "abmt")
    fts_term = ' '.join(f'"{w}"*' for w in fts_query.split() if w)
    try:
        fts_rows = conn.execute(
            "SELECT tipo, entidade_id, texto FROM busca_global WHERE busca_global MATCH ? ORDER BY rank LIMIT 20",
            (fts_term,)).fetchall()
    except Exception:
        fts_rows = []

    if fts_rows:
        # Enrich FTS results with proper display info
        for r in fts_rows:
            tipo = r['tipo']
            eid = r['entidade_id']
            if tipo == 'cadastro':
                row = conn.execute("SELECT id, razao_social, cnpj_cpf FROM cadastros WHERE id=?", (eid,)).fetchone()
                if row:
                    results.append({'tipo': 'cadastro', 'id': row['id'], 'titulo': row['razao_social'], 'subtitulo': row['cnpj_cpf']})
            elif tipo == 'proposta':
                row = conn.execute("SELECT p.id, p.numero, p.tipo, c.razao_social FROM propostas p LEFT JOIN cadastros c ON p.cadastro_id=c.id WHERE p.id=?", (eid,)).fetchone()
                if row:
                    results.append({'tipo': 'proposta', 'id': row['id'], 'titulo': row['numero'], 'subtitulo': f"{row['tipo']} - {row['razao_social'] or ''}"})
            elif tipo == 'ov':
                row = conn.execute("SELECT ov.id, ov.numero, c.razao_social FROM ordens_venda ov LEFT JOIN cadastros c ON ov.cadastro_id=c.id WHERE ov.id=?", (eid,)).fetchone()
                if row:
                    results.append({'tipo': 'ov', 'id': row['id'], 'titulo': row['numero'], 'subtitulo': row['razao_social'] or ''})
            elif tipo == 'oc':
                row = conn.execute("SELECT oc.id, oc.numero, c.razao_social FROM ordens_compra oc LEFT JOIN cadastros c ON oc.cadastro_id=c.id WHERE oc.id=?", (eid,)).fetchone()
                if row:
                    results.append({'tipo': 'oc', 'id': row['id'], 'titulo': row['numero'], 'subtitulo': row['razao_social'] or ''})
    else:
        # Fallback: LIKE search (for data not yet indexed)
        like_q = f'%{q}%'
        rows = conn.execute("SELECT id, cnpj_cpf, razao_social, nome_fantasia FROM cadastros WHERE razao_social LIKE ? OR nome_fantasia LIKE ? OR cnpj_cpf LIKE ? LIMIT 5",
            (like_q, like_q, like_q)).fetchall()
        for r in rows:
            results.append({'tipo': 'cadastro', 'id': r['id'], 'titulo': r['razao_social'], 'subtitulo': r['cnpj_cpf']})

        rows = conn.execute("""SELECT p.id, p.numero, p.tipo, p.status, c.razao_social
            FROM propostas p LEFT JOIN cadastros c ON p.cadastro_id=c.id
            WHERE p.numero LIKE ? OR c.razao_social LIKE ? LIMIT 5""",
            (like_q, like_q)).fetchall()
        for r in rows:
            results.append({'tipo': 'proposta', 'id': r['id'], 'titulo': r['numero'], 'subtitulo': f"{r['tipo']} - {r['razao_social'] or ''}"})

        rows = conn.execute("""SELECT ov.id, ov.numero, c.razao_social
            FROM ordens_venda ov LEFT JOIN cadastros c ON ov.cadastro_id=c.id
            WHERE ov.numero LIKE ? OR c.razao_social LIKE ? LIMIT 5""",
            (like_q, like_q)).fetchall()
        for r in rows:
            results.append({'tipo': 'ov', 'id': r['id'], 'titulo': r['numero'], 'subtitulo': r['razao_social'] or ''})

        rows = conn.execute("""SELECT oc.id, oc.numero, c.razao_social
            FROM ordens_compra oc LEFT JOIN cadastros c ON oc.cadastro_id=c.id
            WHERE oc.numero LIKE ? OR c.razao_social LIKE ? LIMIT 5""",
            (like_q, like_q)).fetchall()
        for r in rows:
            results.append({'tipo': 'oc', 'id': r['id'], 'titulo': r['numero'], 'subtitulo': r['razao_social'] or ''})

    conn.close()
    return jsonify({'items': results})


# ============ COMMISSION / CLOSING ============

def _calc_qualitativo_ov_prefetched(parcelas, data_emissao, valor_total):
    """Calculate qualitative score using pre-fetched parcelas (no DB query)."""
    return _calc_qualitativo_logic(parcelas, data_emissao, valor_total)

def _calc_qualitativo_ov(conn, ov_id, data_emissao, valor_total):
    """Calculate qualitative score for an OV based on parcelas.
    Score formula: H = 10 * entrada% + base[faturamento] * (1 - entrada%)
    base = {avista: 7.0, 30d: 4.0, 45d: 2.5, 60d: 1.0, 75d: 0.0}
    Returns: {entrada_pct, faturamento, nota, score_pct}
    """
    if not valor_total or valor_total <= 0:
        return {'entrada_pct': 0, 'faturamento': '75d', 'nota': 0, 'score_pct': 0}

    parcelas = conn.execute("SELECT valor, data_vencimento FROM ov_parcelas WHERE ov_id=?", (ov_id,)).fetchall()
    return _calc_qualitativo_logic(parcelas, data_emissao, valor_total)

def _calc_qualitativo_logic(parcelas, data_emissao, valor_total):
    """Core qualitative score logic, shared by both prefetched and DB versions."""
    if not valor_total or valor_total <= 0:
        return {'entrada_pct': 0, 'faturamento': '75d', 'nota': 0, 'score_pct': 0}
    if not parcelas:
        return {'entrada_pct': 1.0, 'faturamento': 'A VISTA', 'nota': 10, 'score_pct': 100}

    try:
        emissao = datetime.strptime(data_emissao[:10], '%Y-%m-%d')
    except:
        emissao = datetime.now()

    # Classify each parcela by days from emission
    entrada_valor = 0
    max_days_remaining = 0
    for p in parcelas:
        try:
            venc = datetime.strptime(p['data_vencimento'][:10], '%Y-%m-%d')
            days = (venc - emissao).days
        except:
            days = 30
        if days <= 7:
            entrada_valor += p['valor']
        else:
            if days > max_days_remaining:
                max_days_remaining = days

    entrada_pct = min(entrada_valor / valor_total, 1.0)

    # Map max remaining days to faturamento category
    if max_days_remaining <= 7:
        faturamento = 'A VISTA'
        base = 7.0
    elif max_days_remaining <= 37:
        faturamento = '30d'
        base = 4.0
    elif max_days_remaining <= 52:
        faturamento = '45d'
        base = 2.5
    elif max_days_remaining <= 67:
        faturamento = '60d'
        base = 1.0
    else:
        faturamento = '75d'
        base = 0.0

    # If all parcelas are entrada, it's A VISTA full
    if entrada_pct >= 1.0:
        return {'entrada_pct': 1.0, 'faturamento': 'A VISTA', 'nota': 10, 'score_pct': 100}

    nota = 10 * entrada_pct + base * (1 - entrada_pct)
    score_pct = round(nota * 10, 1)

    # Round entrada to nearest standard value for display
    entrada_display = round(entrada_pct, 2)

    return {'entrada_pct': entrada_display, 'faturamento': faturamento, 'nota': round(nota, 2), 'score_pct': score_pct}


@app.route('/api/fechamento/<int:ano>/<int:mes>')
@permission_required('ver_fechamento')
def fechamento(ano, mes):
    conn = get_db()
    users = conn.execute("SELECT id, nome, perfil FROM users WHERE ativo=1").fetchall()
    config = _get_configs(conn)
    comissao_compras_raw = json.loads(config.get('comissao_compras', '{}'))
    comissao_vendas_cfg = json.loads(config.get('comissao_vendas', '{}'))
    pis_pct = float(config.get('pis_percentual', 9.25))
    icms_tabela = json.loads(config.get('icms_tabela', '{}'))
    mes_str = f'{mes:02d}'
    ano_str = str(ano)

    # Normalizar comissao_compras: aceita chave por nome OU por user_id (str)
    _user_name_to_id = {u['nome']: u['id'] for u in users}
    comissao_compras_by_id = {}
    diferenca_gerente = comissao_compras_raw.get('diferenca_gerente', 0.5)
    for k, v in comissao_compras_raw.items():
        if k in ('diferenca_gerente', 'gerente_extra_vendedores'):
            continue
        if isinstance(v, (int, float)):
            if str(k).isdigit():
                comissao_compras_by_id[int(k)] = v
            elif k in _user_name_to_id:
                comissao_compras_by_id[_user_name_to_id[k]] = v

    # Vendedores sobre quem o gerente recebe extra (configurável, fallback: vendedores)
    _extra_ids_str = comissao_compras_raw.get('gerente_extra_vendedores', '')
    if _extra_ids_str:
        gerente_extra_ids = [int(x.strip()) for x in str(_extra_ids_str).split(',') if x.strip().isdigit()]
    else:
        # Fallback: todos os vendedores
        gerente_extra_ids = [u['id'] for u in users if u['perfil'] == 'vendedor']

    # ---- BULK PREFETCH: all OVs, OCs, items, parcelas for the month ----
    all_ovs = conn.execute("""SELECT ov.id, ov.numero, ov.vendedor_id, ov.data_emissao, ov.uf_destino, ov.icms_isento,
        c.razao_social FROM ordens_venda ov LEFT JOIN cadastros c ON ov.cadastro_id=c.id
        WHERE strftime('%m',ov.data_emissao)=? AND strftime('%Y',ov.data_emissao)=? AND ov.status!='Cancelada'""",
        (mes_str, ano_str)).fetchall()

    all_ocs = conn.execute("""SELECT oc.id, oc.numero, oc.comprador_id, c.razao_social FROM ordens_compra oc
        LEFT JOIN cadastros c ON oc.cadastro_id=c.id
        WHERE strftime('%m',oc.data_emissao)=? AND strftime('%Y',oc.data_emissao)=? AND oc.status!='Cancelada'""",
        (mes_str, ano_str)).fetchall()

    ov_ids = [ov['id'] for ov in all_ovs]
    oc_ids = [oc['id'] for oc in all_ocs]

    # Bulk fetch items (indexed by ov_id / oc_id)
    ov_items_map = {}  # ov_id -> list of items
    if ov_ids:
        placeholders = ','.join('?' * len(ov_ids))
        for item in conn.execute(f"SELECT * FROM ov_items WHERE ov_id IN ({placeholders})", ov_ids).fetchall():
            ov_items_map.setdefault(item['ov_id'], []).append(dict(item))

    oc_totals_map = {}  # oc_id -> total value
    if oc_ids:
        placeholders = ','.join('?' * len(oc_ids))
        for row in conn.execute(f"SELECT oc_id, COALESCE(SUM(valor_total),0) as total FROM oc_items WHERE oc_id IN ({placeholders}) GROUP BY oc_id", oc_ids).fetchall():
            oc_totals_map[row['oc_id']] = row['total']

    # Bulk fetch parcelas for qualitativo
    parcelas_map = {}  # ov_id -> list of parcelas
    if ov_ids:
        placeholders = ','.join('?' * len(ov_ids))
        for p in conn.execute(f"SELECT ov_id, valor, data_vencimento FROM ov_parcelas WHERE ov_id IN ({placeholders})", ov_ids).fetchall():
            parcelas_map.setdefault(p['ov_id'], []).append(dict(p))

    # Index OVs and OCs by user
    ovs_by_user = {}
    for ov in all_ovs:
        ovs_by_user.setdefault(ov['vendedor_id'], []).append(dict(ov))
    ocs_by_user = {}
    for oc in all_ocs:
        ocs_by_user.setdefault(oc['comprador_id'], []).append(dict(oc))

    resultado = []

    for u in users:
        user_data = {'id': u['id'], 'nome': u['nome'], 'perfil': u['perfil']}

        # Vendas do mês (from prefetched data)
        vendas = []
        total_comissao_vendas = 0
        qualitativo_soma = 0
        qualitativo_peso = 0
        for ov in ovs_by_user.get(u['id'], []):
            items = ov_items_map.get(ov['id'], [])
            valor_bruto = sum(i['valor_total'] or 0 for i in items)
            comissao_ov = sum(i['comissao_valor'] or 0 for i in items)
            total_comissao_vendas += comissao_ov
            qual = _calc_qualitativo_ov_prefetched(parcelas_map.get(ov['id'], []), ov['data_emissao'] or '', valor_bruto)
            qualitativo_soma += qual['score_pct'] * valor_bruto
            qualitativo_peso += valor_bruto
            vendas.append({
                'ov_id': ov['id'], 'numero': ov['numero'], 'cliente': ov['razao_social'],
                'valor_bruto': valor_bruto, 'comissao': comissao_ov,
                'qualitativo': qual
            })
        user_data['vendas'] = vendas
        user_data['total_comissao_vendas'] = total_comissao_vendas
        user_data['qualitativo_score'] = round(qualitativo_soma / qualitativo_peso, 1) if qualitativo_peso > 0 else 0
        qs = user_data['qualitativo_score']
        if qs >= 65:
            user_data['qualitativo_tier'] = 'bonus_total'
        elif qs >= 40:
            user_data['qualitativo_tier'] = 'bonus_metade'
        else:
            user_data['qualitativo_tier'] = 'sem_bonus'

        # Compras do mês — lookup por user_id (não nome)
        compras = []
        total_comissao_compras = 0
        pct_compra = comissao_compras_by_id.get(u['id'], 3.0)
        for oc in ocs_by_user.get(u['id'], []):
            valor = oc_totals_map.get(oc['id'], 0)
            comissao = valor * pct_compra / 100
            total_comissao_compras += comissao
            compras.append({
                'oc_id': oc['id'], 'numero': oc['numero'], 'fornecedor': oc['razao_social'],
                'valor': valor, 'percentual': pct_compra, 'comissao': comissao
            })
        user_data['compras'] = compras
        user_data['total_comissao_compras'] = total_comissao_compras

        # Comissão extra gerente sobre vendedores configurados (sem hardcode)
        extra_gerente = 0
        if u['perfil'] == 'gerente' and gerente_extra_ids:
            for vid in gerente_extra_ids:
                # Compras do vendedor
                for oc in ocs_by_user.get(vid, []):
                    val = oc_totals_map.get(oc['id'], 0)
                    extra_gerente += val * diferenca_gerente / 100

                # Vendas do vendedor - diferença de percentual
                for ov in ovs_by_user.get(vid, []):
                    items = ov_items_map.get(ov['id'], [])
                    for item in items:
                        pct_gerente = comissao_vendas_cfg.get('gerente', {}).get(item.get('categoria', ''), 0)
                        pct_vend = item.get('comissao_percentual') or 0
                        diff = pct_gerente - pct_vend
                        if diff > 0 and item.get('valor_total'):
                            uf = ov.get('uf_destino') or 'SP'
                            icms_pct = 0 if (uf == 'SP' and ov.get('icms_isento')) else icms_tabela.get(uf, 0)
                            item_liq = item['valor_total'] * (1 - pis_pct/100 - icms_pct/100)
                            extra_gerente += item_liq * diff / 100

        user_data['extra_gerente'] = extra_gerente

        # Total
        user_data['total'] = total_comissao_vendas + total_comissao_compras + extra_gerente
        resultado.append(user_data)

    # Intermediários
    intermediarios = conn.execute("""SELECT oc.numero, oc.intermediario_nome, oc.intermediario_comissao_tipo,
        oc.intermediario_comissao_valor, (SELECT COALESCE(SUM(valor_total),0) FROM oc_items WHERE oc_id=oc.id) as valor_oc
        FROM ordens_compra oc
        WHERE oc.intermediario_nome IS NOT NULL AND oc.intermediario_nome != ''
        AND strftime('%m',oc.data_emissao)=? AND strftime('%Y',oc.data_emissao)=?
        AND oc.status!='Cancelada'""", (f'{mes:02d}', str(ano))).fetchall()

    intermediarios_list = []
    for inter in intermediarios:
        if inter['intermediario_comissao_tipo'] == 'percentual':
            valor_com = inter['valor_oc'] * inter['intermediario_comissao_valor'] / 100
        else:
            valor_com = inter['intermediario_comissao_valor'] or 0
        intermediarios_list.append({
            'oc': inter['numero'], 'nome': inter['intermediario_nome'],
            'valor': valor_com
        })

    # Fechamento status - separate for vendas and compras
    fech_vendas = conn.execute("SELECT * FROM fechamentos WHERE mes=? AND ano=? AND tipo='vendas'", (mes, ano)).fetchone()
    fech_compras = conn.execute("SELECT * FROM fechamentos WHERE mes=? AND ano=? AND tipo='compras'", (mes, ano)).fetchone()
    # Backward compat: also check legacy 'geral'
    fech_geral = conn.execute("SELECT * FROM fechamentos WHERE mes=? AND ano=? AND tipo='geral'", (mes, ano)).fetchone()

    conn.close()
    return jsonify({
        'resultado': resultado,
        'intermediarios': intermediarios_list,
        'fechamento_vendas': dict(fech_vendas) if fech_vendas else (dict(fech_geral) if fech_geral else None),
        'fechamento_compras': dict(fech_compras) if fech_compras else (dict(fech_geral) if fech_geral else None),
        'fechamento': dict(fech_geral) if fech_geral else None
    })


def _gerar_snapshot_fechamento(conn, ano, mes):
    """Gera snapshot JSON com todos os dados de comissão do mês — usado ao fechar."""
    # Reutiliza a mesma lógica do GET /api/fechamento, serializado pra JSON
    users = conn.execute("SELECT id, nome, perfil FROM users WHERE ativo=1").fetchall()
    config = _get_configs(conn)
    comissao_compras_raw = json.loads(config.get('comissao_compras', '{}'))
    comissao_vendas_cfg = json.loads(config.get('comissao_vendas', '{}'))
    # Normalizar por user_id (mesma lógica do fechamento)
    _user_name_to_id = {u['nome']: u['id'] for u in users}
    comissao_compras_by_id = {}
    for k, v in comissao_compras_raw.items():
        if k in ('diferenca_gerente', 'gerente_extra_vendedores'):
            continue
        if isinstance(v, (int, float)):
            if str(k).isdigit():
                comissao_compras_by_id[int(k)] = v
            elif k in _user_name_to_id:
                comissao_compras_by_id[_user_name_to_id[k]] = v
    pis_pct = float(config.get('pis_percentual', 9.25))
    icms_tabela = json.loads(config.get('icms_tabela', '{}'))
    mes_str = f'{mes:02d}'
    ano_str = str(ano)

    all_ovs = conn.execute("""SELECT ov.id, ov.numero, ov.vendedor_id, ov.data_emissao, ov.uf_destino, ov.icms_isento,
        c.razao_social FROM ordens_venda ov LEFT JOIN cadastros c ON ov.cadastro_id=c.id
        WHERE strftime('%m',ov.data_emissao)=? AND strftime('%Y',ov.data_emissao)=? AND ov.status!='Cancelada'""",
        (mes_str, ano_str)).fetchall()
    all_ocs = conn.execute("""SELECT oc.id, oc.numero, oc.comprador_id, c.razao_social FROM ordens_compra oc
        LEFT JOIN cadastros c ON oc.cadastro_id=c.id
        WHERE strftime('%m',oc.data_emissao)=? AND strftime('%Y',oc.data_emissao)=? AND oc.status!='Cancelada'""",
        (mes_str, ano_str)).fetchall()

    ov_ids = [ov['id'] for ov in all_ovs]
    oc_ids = [oc['id'] for oc in all_ocs]

    ov_items_map = {}
    if ov_ids:
        ph = ','.join('?' * len(ov_ids))
        for item in conn.execute(f"SELECT * FROM ov_items WHERE ov_id IN ({ph})", ov_ids).fetchall():
            ov_items_map.setdefault(item['ov_id'], []).append(dict(item))

    oc_totals_map = {}
    if oc_ids:
        ph = ','.join('?' * len(oc_ids))
        for row in conn.execute(f"SELECT oc_id, COALESCE(SUM(valor_total),0) as total FROM oc_items WHERE oc_id IN ({ph}) GROUP BY oc_id", oc_ids).fetchall():
            oc_totals_map[row['oc_id']] = row['total']

    ovs_by_user = {}
    for ov in all_ovs:
        ovs_by_user.setdefault(ov['vendedor_id'], []).append(dict(ov))
    ocs_by_user = {}
    for oc in all_ocs:
        ocs_by_user.setdefault(oc['comprador_id'], []).append(dict(oc))

    resultado = []
    for u in users:
        ud = {'id': u['id'], 'nome': u['nome'], 'perfil': u['perfil']}
        total_com_v = 0
        vendas = []
        for ov in ovs_by_user.get(u['id'], []):
            items = ov_items_map.get(ov['id'], [])
            vb = sum(i['valor_total'] or 0 for i in items)
            cv = sum(i['comissao_valor'] or 0 for i in items)
            total_com_v += cv
            vendas.append({'ov_id': ov['id'], 'numero': ov['numero'], 'cliente': ov['razao_social'],
                           'valor_bruto': vb, 'comissao': cv})
        ud['vendas'] = vendas
        ud['total_comissao_vendas'] = total_com_v

        total_com_c = 0
        compras = []
        pct_c = comissao_compras_by_id.get(u['id'], 3.0)
        for oc in ocs_by_user.get(u['id'], []):
            val = oc_totals_map.get(oc['id'], 0)
            com = val * pct_c / 100
            total_com_c += com
            compras.append({'oc_id': oc['id'], 'numero': oc['numero'], 'fornecedor': oc['razao_social'],
                            'valor': val, 'percentual': pct_c, 'comissao': com})
        ud['compras'] = compras
        ud['total_comissao_compras'] = total_com_c
        ud['total'] = total_com_v + total_com_c
        resultado.append(ud)

    return json.dumps({'resultado': resultado, 'mes': mes, 'ano': ano,
                       'gerado_em': datetime.now().strftime('%Y-%m-%d %H:%M:%S')}, ensure_ascii=False)


@app.route('/api/fechamento/<int:ano>/<int:mes>/fechar', methods=['POST'])
@gestor_required
def fechar_mes(ano, mes):
    user = get_current_user()
    tipo = request.json.get('tipo', 'geral') if request.is_json else 'geral'
    if tipo not in ('vendas', 'compras', 'geral'):
        tipo = 'geral'
    conn = get_db()

    # Gerar snapshot com todos os dados de comissão no momento do fechamento
    snapshot = _gerar_snapshot_fechamento(conn, ano, mes)

    # Verificar se já existe fechamento anterior
    existing = conn.execute("SELECT id, dados FROM fechamentos WHERE mes=? AND ano=? AND tipo=?",
                            (mes, ano, tipo)).fetchone()

    if existing:
        conn.execute("""UPDATE fechamentos SET status='Fechado', fechado_por=?, fechado_em=datetime('now','localtime'),
            dados=?, reaberto_por=NULL, reaberto_em=NULL WHERE id=?""",
            (user['id'], snapshot, existing['id']))
        fech_id = existing['id']
    else:
        conn.execute("""INSERT INTO fechamentos (mes, ano, tipo, status, fechado_por, fechado_em, dados)
            VALUES (?,?,?,'Fechado',?,datetime('now','localtime'),?)""",
            (mes, ano, tipo, user['id'], snapshot))
        fech_id = conn.execute("SELECT last_insert_rowid() as id").fetchone()['id']

    # Registrar no histórico de auditoria
    conn.execute("""INSERT INTO fechamento_historico (fechamento_id, acao, user_id, snapshot_novo)
        VALUES (?,?,?,?)""", (fech_id, 'fechou', user['id'], snapshot))

    conn.commit()
    conn.close()
    return jsonify({'ok': True})


@app.route('/api/fechamento/<int:ano>/<int:mes>/reabrir', methods=['POST'])
@gestor_required
def reabrir_mes(ano, mes):
    """Reabre um fechamento. Preserva snapshot anterior no histórico de auditoria."""
    user = get_current_user()
    data = request.json or {}
    tipo = data.get('tipo', 'geral')
    motivo = data.get('motivo', '').strip()
    if not motivo:
        return jsonify({'error': 'Motivo é obrigatório para reabrir'}), 400

    conn = get_db()
    fech = conn.execute("SELECT id, status, dados FROM fechamentos WHERE mes=? AND ano=? AND tipo=?",
                        (mes, ano, tipo)).fetchone()
    if not fech:
        conn.close()
        return jsonify({'error': 'Fechamento não encontrado'}), 404
    if fech['status'] != 'Fechado':
        conn.close()
        return jsonify({'error': 'Fechamento já está aberto'}), 400

    snapshot_anterior = fech['dados']

    # Reabrir
    conn.execute("""UPDATE fechamentos SET status='Aberto', reaberto_por=?, reaberto_em=datetime('now','localtime')
        WHERE id=?""", (user['id'], fech['id']))

    # Registrar no histórico: quem reabriu, quando, motivo, snapshot anterior
    conn.execute("""INSERT INTO fechamento_historico (fechamento_id, acao, user_id, motivo, snapshot_anterior)
        VALUES (?,?,?,?,?)""", (fech['id'], 'reabriu', user['id'], motivo, snapshot_anterior))

    conn.commit()
    conn.close()
    return jsonify({'ok': True})


@app.route('/api/fechamento/<int:ano>/<int:mes>/historico')
@permission_required('ver_fechamento')
def historico_fechamento(ano, mes):
    """Retorna histórico de auditoria do fechamento (quem fechou/reabriu, quando, motivo)."""
    tipo = request.args.get('tipo', 'geral')
    conn = get_db()
    fech = conn.execute("SELECT id FROM fechamentos WHERE mes=? AND ano=? AND tipo=?", (mes, ano, tipo)).fetchone()
    if not fech:
        conn.close()
        return jsonify({'historico': []})

    rows = conn.execute("""SELECT h.acao, h.motivo, h.created_at, u.nome
        FROM fechamento_historico h
        JOIN users u ON h.user_id = u.id
        WHERE h.fechamento_id = ?
        ORDER BY h.created_at DESC""", (fech['id'],)).fetchall()

    historico = [{'acao': r['acao'], 'motivo': r['motivo'], 'data': r['created_at'], 'usuario': r['nome']} for r in rows]
    conn.close()
    return jsonify({'historico': historico})


@app.route('/api/fechamento/<int:ano>/<int:mes>/export')
@permission_required('exportar_dados')
def export_fechamento(ano, mes):
    """Export fechamento as CSV"""
    import csv
    import io
    tipo = request.args.get('tipo', 'vendas')
    conn = get_db()

    # Reuse the same logic from fechamento view
    meses_nomes = ['','Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([f'Fechamento {tipo.upper()} - {meses_nomes[mes]}/{ano}'])
    writer.writerow([])

    if tipo == 'vendas':
        writer.writerow(['Vendedor', 'Perfil', 'OVs', 'Total Bruto', 'Comissão Vendas', 'Extra Gerente', 'Total', 'Qualitativo %'])
        users = conn.execute("SELECT * FROM users WHERE ativo=1").fetchall()
        for u in users:
            ovs = conn.execute("""
                SELECT ov.id, ov.numero, COALESCE(SUM(i.valor_total),0) as total,
                COALESCE(SUM(i.comissao_valor),0) as comissao
                FROM ordens_venda ov LEFT JOIN ov_items i ON i.ov_id=ov.id
                WHERE ov.vendedor_id=? AND strftime('%Y',ov.data_emissao)=? AND strftime('%m',ov.data_emissao)=?
                AND ov.status NOT IN ('Cancelada','Rascunho')
                GROUP BY ov.id
            """, (u['id'], str(ano), f'{mes:02d}')).fetchall()
            if not ovs:
                continue
            total_bruto = sum(ov['total'] for ov in ovs)
            total_comissao = sum(ov['comissao'] for ov in ovs)
            writer.writerow([u['nome'], u['perfil'], len(ovs), f'{total_bruto:.2f}', f'{total_comissao:.2f}', '', f'{total_comissao:.2f}', ''])
    else:
        writer.writerow(['Comprador', 'Perfil', 'OCs', 'Total Bruto', 'Comissão Compras', 'Total'])
        users = conn.execute("SELECT * FROM users WHERE ativo=1").fetchall()
        for u in users:
            ocs = conn.execute("""
                SELECT oc.id, COALESCE(SUM(i.valor_total),0) as total,
                COALESCE(SUM(COALESCE(i.comissao_valor, i.valor_total * COALESCE(i.comissao_percentual,0) / 100.0)),0) as comissao
                FROM ordens_compra oc LEFT JOIN oc_items i ON i.oc_id=oc.id
                WHERE oc.comprador_id=? AND strftime('%Y',oc.data_emissao)=? AND strftime('%m',oc.data_emissao)=?
                AND oc.status NOT IN ('Cancelada','Rascunho')
                GROUP BY oc.id
            """, (u['id'], str(ano), f'{mes:02d}')).fetchall()
            if not ocs:
                continue
            total_bruto = sum(oc['total'] for oc in ocs)
            total_comissao = sum(oc['comissao'] for oc in ocs)
            writer.writerow([u['nome'], u['perfil'], len(ocs), f'{total_bruto:.2f}', f'{total_comissao:.2f}', f'{total_comissao:.2f}'])

    conn.close()
    output.seek(0)
    return Response(
        output.getvalue(),
        mimetype='text/csv',
        headers={'Content-Disposition': f'attachment; filename=fechamento_{tipo}_{mes:02d}_{ano}.csv'}
    )


# ============ CONFIGURATIONS ============

@app.route('/api/config', methods=['GET'])
@login_required
def get_config():
    user = get_current_user()
    conn = get_db()
    config = _get_configs(conn)
    conn.close()
    # Vendedor não vê tabelas de comissão e configs sensíveis
    if user['perfil'] == 'vendedor':
        sensitive_keys = ['comissao_vendas', 'comissao_compras', 'empresa_dados_bancarios']
        config = {k: v for k, v in config.items() if k not in sensitive_keys}
    return jsonify(config)

@app.route('/api/config', methods=['PUT'])
@gestor_required
def update_config():
    data = request.json
    conn = get_db()
    for chave, valor in data.items():
        if isinstance(valor, (dict, list)):
            valor = json.dumps(valor)
        conn.execute("INSERT OR REPLACE INTO configuracoes (chave, valor, updated_at) VALUES (?,?,datetime('now','localtime'))",
                     (chave, str(valor)))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})


# ============ NOTIFICATIONS ============

@app.route('/api/notificacoes', methods=['GET'])
@login_required
def list_notificacoes():
    user = get_current_user()
    conn = get_db()
    rows = conn.execute("SELECT * FROM notificacoes WHERE user_id=? ORDER BY created_at DESC LIMIT 30",
                        (user['id'],)).fetchall()
    conn.close()
    return jsonify({'items': [dict(r) for r in rows]})

@app.route('/api/notificacoes/ler', methods=['POST'])
@login_required
def marcar_notificacoes_lidas():
    user = get_current_user()
    conn = get_db()
    conn.execute("UPDATE notificacoes SET lida=1 WHERE user_id=?", (user['id'],))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})


# ============ BACKUP ============

@app.route('/api/backup/exportar')
@permission_required('exportar_dados')
def exportar_backup():
    if os.path.exists(DB_PATH):
        return send_file(DB_PATH, as_attachment=True, download_name='comercial_backup.db')
    return jsonify({'error': 'Banco não encontrado'}), 404

@app.route('/api/backup/manual', methods=['POST'])
@gestor_required
def backup_manual():
    path = do_backup()
    return jsonify({'ok': True, 'path': path})


# ============ ADMIN: REBUILD FTS ============

@app.route('/api/admin/rebuild-fts', methods=['POST'])
@gestor_required
def rebuild_fts():
    """Rebuild completo do índice de busca global (FTS5)"""
    conn = get_db()
    count = {'cadastros': 0, 'propostas': 0, 'ovs': 0, 'ocs': 0}

    # Limpar FTS existente
    try:
        conn.execute("DELETE FROM busca_global")
    except Exception:
        pass  # contentless FTS5 may need special handling

    # Indexar cadastros
    rows = conn.execute("SELECT id, razao_social, nome_fantasia, cnpj_cpf, contato_nome, contato_email, segmento FROM cadastros").fetchall()
    for r in rows:
        texto = ' '.join(filter(None, [r['razao_social'], r['nome_fantasia'], r['cnpj_cpf'], r['contato_nome'], r['contato_email'], r['segmento']]))
        if texto.strip():
            conn.execute("INSERT INTO busca_global (tipo, entidade_id, texto) VALUES (?, ?, ?)",
                         ('cadastro', str(r['id']), texto))
            count['cadastros'] += 1

    # Indexar propostas
    rows = conn.execute("""SELECT p.id, p.numero, c.razao_social, c.nome_fantasia
        FROM propostas p LEFT JOIN cadastros c ON p.cadastro_id=c.id""").fetchall()
    for r in rows:
        texto = ' '.join(filter(None, [r['numero'], r['razao_social'], r['nome_fantasia']]))
        if texto.strip():
            conn.execute("INSERT INTO busca_global (tipo, entidade_id, texto) VALUES (?, ?, ?)",
                         ('proposta', str(r['id']), texto))
            count['propostas'] += 1

    # Indexar OVs
    rows = conn.execute("""SELECT ov.id, ov.numero, c.razao_social, c.nome_fantasia
        FROM ordens_venda ov LEFT JOIN cadastros c ON ov.cadastro_id=c.id""").fetchall()
    for r in rows:
        texto = ' '.join(filter(None, [r['numero'], r['razao_social'], r['nome_fantasia']]))
        if texto.strip():
            conn.execute("INSERT INTO busca_global (tipo, entidade_id, texto) VALUES (?, ?, ?)",
                         ('ov', str(r['id']), texto))
            count['ovs'] += 1

    # Indexar OCs
    rows = conn.execute("""SELECT oc.id, oc.numero, c.razao_social, c.nome_fantasia
        FROM ordens_compra oc LEFT JOIN cadastros c ON oc.cadastro_id=c.id""").fetchall()
    for r in rows:
        texto = ' '.join(filter(None, [r['numero'], r['razao_social'], r['nome_fantasia']]))
        if texto.strip():
            conn.execute("INSERT INTO busca_global (tipo, entidade_id, texto) VALUES (?, ?, ?)",
                         ('oc', str(r['id']), texto))
            count['ocs'] += 1

    conn.commit()
    conn.close()
    return jsonify({'ok': True, 'indexados': count, 'total': sum(count.values())})


# ============ ADMIN: RECALCULAR COMISSÕES ============

@app.route('/api/admin/recalcular-comissoes', methods=['POST'])
@gestor_required
def recalcular_comissoes():
    """Recalcula comissão de todos os itens de OV baseado na config atual"""
    conn = get_db()
    configs = _get_configs(conn)
    pis_pct = float(configs.get('pis_percentual', '9.25'))

    # Buscar todos os itens de OV com dados do vendedor e OV
    items = conn.execute("""
        SELECT i.id, i.valor_total, i.categoria,
               ov.vendedor_id, ov.uf_destino, ov.icms_isento,
               u.perfil
        FROM ov_items i
        JOIN ordens_venda ov ON i.ov_id = ov.id
        JOIN users u ON ov.vendedor_id = u.id
        WHERE ov.status != 'Cancelada'
    """).fetchall()

    updated = 0
    for item in items:
        if not item['valor_total'] or item['valor_total'] <= 0:
            continue
        result = calcular_comissao_item(
            item['valor_total'],
            item['categoria'] or '',
            item['perfil'] or 'vendedor',
            item['uf_destino'] or 'SP',
            bool(item['icms_isento']),
            pis_pct,
            configs
        )
        conn.execute("""UPDATE ov_items SET
            comissao_percentual=?, comissao_valor=?, icms_percentual=?, pis_percentual=?
            WHERE id=?""",
            (result['comissao_percentual'], result['comissao_valor'],
             result['icms_pct'], result['pis_pct'], item['id']))
        updated += 1

    conn.commit()
    conn.close()
    return jsonify({'ok': True, 'itens_atualizados': updated, 'total_itens': len(items)})


# ============ ATTACHMENTS ============

@app.route('/api/anexos/upload', methods=['POST'])
@login_required
def upload_anexo():
    user = get_current_user()
    if 'file' not in request.files:
        return jsonify({'error': 'Nenhum arquivo'}), 400

    file = request.files['file']
    entidade_tipo = request.form.get('entidade_tipo')
    entidade_id = request.form.get('entidade_id')

    if not file.filename:
        return jsonify({'error': 'Arquivo sem nome'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'Tipo de arquivo não permitido'}), 400

    # Validate MIME type matches extension to prevent disguised uploads
    import mimetypes
    ext = file.filename.rsplit('.', 1)[1].lower()
    safe_mimes = {
        'png': ['image/png'], 'jpg': ['image/jpeg'], 'jpeg': ['image/jpeg'], 'gif': ['image/gif'],
        'pdf': ['application/pdf'], 'doc': ['application/msword'],
        'docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        'xls': ['application/vnd.ms-excel'],
        'xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    }
    content_type = file.content_type or ''
    allowed_mimes = safe_mimes.get(ext, [])
    # Also accept generic octet-stream (some browsers send this)
    if content_type and content_type != 'application/octet-stream' and allowed_mimes and content_type not in allowed_mimes:
        return jsonify({'error': f'Tipo de conteúdo ({content_type}) não corresponde à extensão .{ext}'}), 400

    # Check limit (5 per entity)
    conn = get_db()
    count = conn.execute("SELECT COUNT(*) as c FROM anexos WHERE entidade_tipo=? AND entidade_id=? AND deletado=0",
                         (entidade_tipo, entidade_id)).fetchone()['c']
    if count >= 5:
        conn.close()
        return jsonify({'error': 'Limite de 5 anexos atingido'}), 400

    filename = secure_filename(file.filename)
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    save_name = f"{entidade_tipo}_{entidade_id}_{timestamp}_{filename}"
    filepath = os.path.join(UPLOAD_DIR, save_name)
    file.save(filepath)

    conn.execute("""INSERT INTO anexos (entidade_tipo, entidade_id, nome_arquivo, caminho, tamanho, uploaded_by)
        VALUES (?,?,?,?,?,?)""",
        (entidade_tipo, entidade_id, filename, save_name, os.path.getsize(filepath), user['id']))
    conn.commit()
    conn.close()
    return jsonify({'ok': True, 'filename': filename}), 201

@app.route('/api/anexos/<int:id>/delete', methods=['DELETE'])
@login_required
def delete_anexo(id):
    user = get_current_user()
    conn = get_db()
    anexo = conn.execute("SELECT * FROM anexos WHERE id=? AND deletado=0", (id,)).fetchone()
    if not anexo:
        conn.close()
        return jsonify({'error': 'Não encontrado'}), 404

    # Permission: uploader or gestor
    if anexo['uploaded_by'] != user['id'] and user['perfil'] not in ('gerente', 'diretor'):
        conn.close()
        return jsonify({'error': 'Sem permissão'}), 403

    # Move to deleted folder
    src = os.path.join(UPLOAD_DIR, anexo['caminho'])
    if os.path.exists(src):
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        dest = os.path.join(UPLOAD_DELETED_DIR, f"{timestamp}_{anexo['caminho']}")
        os.rename(src, dest)

    conn.execute("UPDATE anexos SET deletado=1, deletado_por=?, deletado_em=datetime('now','localtime') WHERE id=?",
                 (user['id'], id))
    conn.execute("INSERT INTO audit_log (user_id, acao, entidade_tipo, entidade_id, detalhes) VALUES (?,?,?,?,?)",
                 (user['id'], 'Anexo deletado', anexo['entidade_tipo'], anexo['entidade_id'], anexo['nome_arquivo']))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})

@app.route('/uploads/<filename>')
@login_required
def serve_upload(filename):
    # Block path traversal — only serve files from the uploads root, not subdirs like /deleted/
    if '/' in filename or '\\' in filename or '..' in filename:
        return jsonify({'error': 'Acesso negado'}), 403

    # Ownership check: vendedor só vê anexos de entidades em que ele está envolvido
    user = get_current_user()
    if user['perfil'] == 'vendedor':
        conn = get_db()
        anexo = conn.execute(
            "SELECT entidade_tipo, entidade_id, uploaded_by FROM anexos WHERE caminho=? AND deletado=0",
            (filename,)
        ).fetchone()
        if not anexo:
            return jsonify({'error': 'Arquivo não encontrado'}), 404

        # Vendedor sempre vê anexos que ele mesmo subiu
        if anexo['uploaded_by'] != user['id']:
            allowed = False
            tipo = anexo['entidade_tipo']
            eid = anexo['entidade_id']
            if tipo == 'proposta':
                row = conn.execute("SELECT vendedor_id FROM propostas WHERE id=?", (eid,)).fetchone()
                allowed = row and row['vendedor_id'] == user['id']
            elif tipo == 'OV':
                row = conn.execute("SELECT vendedor_id FROM ordens_venda WHERE id=?", (eid,)).fetchone()
                allowed = row and row['vendedor_id'] == user['id']
            elif tipo == 'OC':
                row = conn.execute("SELECT comprador_id FROM ordens_compra WHERE id=?", (eid,)).fetchone()
                allowed = row and row['comprador_id'] == user['id']
            if not allowed:
                return jsonify({'error': 'Sem permissão para acessar este anexo'}), 403

    return send_from_directory(UPLOAD_DIR, filename)


# ============ RECEITA FEDERAL API ============

@app.route('/api/consulta-cnpj/<cnpj>')
@login_required
def consulta_cnpj(cnpj):
    """Proxy to BrasilAPI for CNPJ lookup"""
    import urllib.request
    cnpj_limpo = ''.join(c for c in cnpj if c.isdigit())
    if len(cnpj_limpo) != 14:
        return jsonify({'error': 'CNPJ inválido'}), 400

    try:
        url = f'https://brasilapi.com.br/api/cnpj/v1/{cnpj_limpo}'
        req = urllib.request.Request(url, headers={'User-Agent': 'ABMT-Comercial/1.0'})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())

            # Auto-detect regime tributário
            regime = None
            if data.get('opcao_pelo_simples'):
                regime = 'Simples Nacional'
            elif data.get('opcao_pelo_mei'):
                regime = 'MEI'

            return jsonify({
                'razao_social': data.get('razao_social', ''),
                'nome_fantasia': data.get('nome_fantasia', ''),
                'endereco_cep': data.get('cep', ''),
                'endereco_rua': f"{data.get('descricao_tipo_de_logradouro','')} {data.get('logradouro','')}".strip(),
                'endereco_numero': data.get('numero', ''),
                'endereco_complemento': data.get('complemento', ''),
                'endereco_bairro': data.get('bairro', ''),
                'endereco_cidade': data.get('municipio', ''),
                'endereco_uf': data.get('uf', ''),
                'situacao_cadastral': data.get('descricao_situacao_cadastral', ''),
                'regime_tributario': regime
            })
    except Exception as e:
        return jsonify({'error': f'Erro ao consultar: {str(e)}'}), 502


# ============ USERS MANAGEMENT ============

@app.route('/api/users', methods=['GET'])
@login_required
def list_users():
    user = get_current_user()
    conn = get_db()
    # Vendedor recebe apenas id+nome (para dropdowns), sem perfil/permissões/login
    if user['perfil'] == 'vendedor':
        rows = conn.execute("SELECT id, nome FROM users WHERE ativo=1").fetchall()
        conn.close()
        return jsonify({'items': [dict(r) for r in rows]})
    rows = conn.execute("SELECT id, username, nome, perfil, ativo, permissoes FROM users").fetchall()
    conn.close()
    items = []
    for r in rows:
        d = dict(r)
        # Parse permissoes JSON for frontend convenience
        try:
            d['permissoes'] = json.loads(d.get('permissoes') or '{}')
        except Exception:
            d['permissoes'] = {}
        items.append(d)
    return jsonify({'items': items})


@app.route('/api/users/<int:id>/permissoes', methods=['PUT'])
@gestor_required
def update_user_permissoes(id):
    """Update per-user permissions (gestor/diretor only).
    Body: { permissoes: { ver_relatorios: bool, ver_intelligence: bool, ... } }
    """
    data = request.json or {}
    perms = data.get('permissoes', {})
    if not isinstance(perms, dict):
        return jsonify({'error': 'permissoes deve ser um objeto'}), 400
    conn = get_db()
    try:
        row = conn.execute("SELECT id FROM users WHERE id=?", (id,)).fetchone()
        if not row:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        conn.execute("UPDATE users SET permissoes=? WHERE id=?", (json.dumps(perms), id))
        conn.commit()
        return jsonify({'ok': True})
    finally:
        conn.close()


@app.route('/api/users', methods=['POST'])
@gestor_required
def create_user():
    data = request.json
    username = (data.get('username') or '').strip()
    password = (data.get('password') or '').strip()
    nome = (data.get('nome') or '').strip()
    perfil = (data.get('perfil') or 'vendedor').strip()

    if not username or not password or not nome:
        return jsonify({'error': 'username, password e nome são obrigatórios'}), 400
    if perfil not in ('vendedor', 'gerente', 'diretor'):
        return jsonify({'error': 'Perfil inválido'}), 400

    conn = get_db()
    try:
        cur = conn.execute(
            """INSERT INTO users (username, password_hash, nome, perfil, cpf, dados_bancarios, ativo)
               VALUES (?, ?, ?, ?, ?, ?, 1)""",
            (username, generate_password_hash(password), nome, perfil,
             data.get('cpf', ''), data.get('dados_bancarios', ''))
        )
        conn.commit()
        new_id = cur.lastrowid
    except Exception as e:
        conn.close()
        if 'UNIQUE' in str(e).upper():
            return jsonify({'error': 'Username já existe'}), 409
        app.logger.exception('Erro interno'); return jsonify({'error': 'Erro interno do servidor'}), 500
    conn.close()
    return jsonify({'ok': True, 'id': new_id}), 201


@app.route('/api/users/<int:id>', methods=['PUT'])
@gestor_required
def update_user(id):
    data = request.json
    conn = get_db()

    current = get_current_user()
    user = conn.execute("SELECT id, perfil, ativo FROM users WHERE id=?", (id,)).fetchone()
    if not user:
        conn.close()
        return jsonify({'error': 'Usuário não encontrado'}), 404

    # Proteção: desativar a si mesmo
    if 'ativo' in data and int(data['ativo']) == 0 and id == current['id']:
        conn.close()
        return jsonify({'error': 'Você não pode desativar o próprio usuário'}), 400

    # Proteção: desativar ou rebaixar o último diretor ativo
    if user['perfil'] == 'diretor':
        vai_desativar = 'ativo' in data and int(data['ativo']) == 0
        vai_rebaixar = 'perfil' in data and data['perfil'] != 'diretor'
        if vai_desativar or vai_rebaixar:
            outros = conn.execute(
                "SELECT COUNT(*) as c FROM users WHERE perfil='diretor' AND ativo=1 AND id != ?", (id,)
            ).fetchone()['c']
            if outros == 0:
                conn.close()
                return jsonify({'error': 'Não é possível desativar/rebaixar o último diretor ativo'}), 400

    fields = []
    values = []
    for col in ('nome', 'perfil', 'ativo', 'cpf', 'dados_bancarios'):
        if col in data:
            fields.append(f"{col}=?")
            values.append(data[col])

    if data.get('password'):
        fields.append("password_hash=?")
        values.append(generate_password_hash(data['password']))

    if not fields:
        conn.close()
        return jsonify({'error': 'Nenhum campo para atualizar'}), 400

    values.append(id)
    conn.execute(f"UPDATE users SET {', '.join(fields)} WHERE id=?", values)
    conn.commit()
    conn.close()
    return jsonify({'ok': True})


@app.route('/api/users/<int:id>', methods=['DELETE'])
@gestor_required
def delete_user(id):
    """Exclui um usuário DE VERDADE — apenas se não tiver histórico.
    Se tiver propostas/OVs/OCs vinculadas, retorna erro orientando a desativar.
    Proteções: não permite excluir a si mesmo nem o último diretor ativo.
    """
    current = get_current_user()
    conn = get_db()
    try:
        user = conn.execute("SELECT id, nome, perfil, ativo FROM users WHERE id=?", (id,)).fetchone()
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404

        # Proteção 1: não pode excluir a si mesmo
        if id == current['id']:
            return jsonify({'error': 'Você não pode excluir o próprio usuário'}), 400

        # Proteção 2: não pode excluir o último diretor ativo
        if user['perfil'] == 'diretor':
            outros_diretores = conn.execute(
                "SELECT COUNT(*) as c FROM users WHERE perfil='diretor' AND ativo=1 AND id != ?", (id,)
            ).fetchone()['c']
            if outros_diretores == 0:
                return jsonify({'error': 'Não é possível excluir o último diretor ativo'}), 400

        # Proteção 3: verifica histórico — se tiver, não exclui (orienta desativar)
        n_propostas = conn.execute("SELECT COUNT(*) as c FROM propostas WHERE vendedor_id=?", (id,)).fetchone()['c']
        n_ovs = conn.execute("SELECT COUNT(*) as c FROM ordens_venda WHERE vendedor_id=?", (id,)).fetchone()['c']
        n_ocs = conn.execute("SELECT COUNT(*) as c FROM ordens_compra WHERE comprador_id=?", (id,)).fetchone()['c']
        n_cadastros = conn.execute("SELECT COUNT(*) as c FROM cadastros WHERE vendedor_responsavel_id=?", (id,)).fetchone()['c']
        total_hist = n_propostas + n_ovs + n_ocs + n_cadastros
        if total_hist > 0:
            detalhes = []
            if n_propostas: detalhes.append(f"{n_propostas} proposta(s)")
            if n_ovs: detalhes.append(f"{n_ovs} OV(s)")
            if n_ocs: detalhes.append(f"{n_ocs} OC(s)")
            if n_cadastros: detalhes.append(f"{n_cadastros} cliente(s)")
            return jsonify({
                'error': f'Usuário tem histórico ({", ".join(detalhes)}). Não pode ser excluído — use "Desativar" para preservar os registros.',
                'has_history': True
            }), 409

        # Sem histórico — exclui de verdade e limpa dados auxiliares
        conn.execute("DELETE FROM metas WHERE user_id=?", (id,))
        conn.execute("DELETE FROM notas WHERE user_id=?", (id,))
        conn.execute("DELETE FROM followups WHERE user_id=?", (id,))
        conn.execute("DELETE FROM users WHERE id=?", (id,))
        conn.execute("INSERT INTO audit_log (user_id, acao, entidade_tipo, entidade_id, detalhes) VALUES (?,?,?,?,?)",
                     (current['id'], 'excluir', 'usuario', id, f"Excluiu usuário {user['nome']}"))
        conn.commit()
        return jsonify({'ok': True, 'deleted': True})
    except Exception as e:
        conn.rollback()
        app.logger.exception('Erro ao excluir usuário')
        return jsonify({'error': 'Erro interno ao excluir usuário'}), 500
    finally:
        conn.close()


# ============ METAS ============

@app.route('/api/metas/<int:user_id>/<mes>', methods=['GET'])
@login_required
def get_meta(user_id, mes):
    user = get_current_user()
    # Vendedor só vê a própria meta
    if user['perfil'] == 'vendedor' and user_id != user['id']:
        return jsonify({'error': 'Sem permissão'}), 403
    conn = get_db()
    meta = conn.execute("SELECT * FROM metas WHERE user_id=? AND mes=?", (user_id, mes)).fetchone()
    meta_data = dict(meta) if meta else {'meta_mensal': 0, 'meta_semanal': 0}

    # Calculate realized this month (OVs)
    ano, m = mes.split('-')
    realizado_mes = conn.execute(
        """SELECT COALESCE(SUM(
            (SELECT COALESCE(SUM(valor_total),0) FROM ov_items WHERE ov_id=ordens_venda.id)
        ), 0) as total FROM ordens_venda
        WHERE vendedor_id=? AND strftime('%m', data_emissao)=? AND strftime('%Y', data_emissao)=?
        AND status != 'Cancelada'""",
        (user_id, m, ano)).fetchone()['total']

    # Calculate realized this week (Mon-Sun)
    today = datetime.now().date()
    start_of_week = today - timedelta(days=today.weekday())
    end_of_week = start_of_week + timedelta(days=6)
    realizado_semana = conn.execute(
        """SELECT COALESCE(SUM(
            (SELECT COALESCE(SUM(valor_total),0) FROM ov_items WHERE ov_id=ordens_venda.id)
        ), 0) as total FROM ordens_venda
        WHERE vendedor_id=? AND date(data_emissao) >= ? AND date(data_emissao) <= ?
        AND status != 'Cancelada'""",
        (user_id, start_of_week.isoformat(), end_of_week.isoformat())).fetchone()['total']

    # Get vendedor name
    user_row = conn.execute("SELECT nome FROM users WHERE id=?", (user_id,)).fetchone()
    conn.close()

    return jsonify({
        'meta_mensal': meta_data.get('meta_mensal', 0),
        'meta_semanal': meta_data.get('meta_semanal', 0),
        'realizado_mes': realizado_mes,
        'realizado_semana': realizado_semana,
        'vendedor_nome': user_row['nome'] if user_row else '',
        'percentual_mes': round(realizado_mes / meta_data['meta_mensal'] * 100, 1) if meta_data.get('meta_mensal') else 0,
        'percentual_semana': round(realizado_semana / meta_data['meta_semanal'] * 100, 1) if meta_data.get('meta_semanal') else 0
    })


@app.route('/api/metas', methods=['POST'])
@gestor_required
def set_meta():
    data = request.json
    conn = get_db()
    conn.execute("""INSERT INTO metas (user_id, mes, meta_mensal, meta_semanal)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(user_id, mes) DO UPDATE SET
            meta_mensal=excluded.meta_mensal,
            meta_semanal=excluded.meta_semanal,
            updated_at=datetime('now','localtime')""",
        (data['user_id'], data['mes'], data.get('meta_mensal', 0), data.get('meta_semanal', 0)))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})


@app.route('/api/metas', methods=['GET'])
@gestor_required
def list_metas():
    mes = request.args.get('mes', datetime.now().strftime('%Y-%m'))
    conn = get_db()
    rows = conn.execute("""SELECT m.*, u.nome as vendedor_nome FROM metas m
        JOIN users u ON m.user_id=u.id WHERE m.mes=?""", (mes,)).fetchall()
    conn.close()
    return jsonify({'items': [dict(r) for r in rows]})


# ============ SUGESTOES ============

@app.route('/api/sugestoes', methods=['POST'])
@login_required
def create_sugestao():
    data = request.json
    user = get_current_user()
    conn = get_db()
    conn.execute("INSERT INTO sugestoes (user_id, categoria, texto) VALUES (?,?,?)",
                 (user['id'], data.get('categoria', 'Outro'), data.get('texto', '')))
    conn.commit()
    conn.close()
    return jsonify({'ok': True}), 201


@app.route('/api/sugestoes', methods=['GET'])
@gestor_required
def list_sugestoes():
    conn = get_db()
    rows = conn.execute("""SELECT s.*, u.nome as user_nome FROM sugestoes s
        LEFT JOIN users u ON s.user_id=u.id
        ORDER BY CASE s.status WHEN 'Nova' THEN 0 WHEN 'Em Análise' THEN 1 WHEN 'Implementada' THEN 2 WHEN 'Descartada' THEN 3 ELSE 4 END, s.created_at DESC""").fetchall()
    conn.close()
    return jsonify({'items': [dict(r) for r in rows]})


@app.route('/api/sugestoes/<int:id>', methods=['PUT'])
@gestor_required
def update_sugestao(id):
    data = request.json
    conn = get_db()
    fields = []
    params = []
    if 'status' in data:
        fields.append("status=?")
        params.append(data['status'])
    if 'resposta' in data:
        fields.append("resposta=?")
        params.append(data['resposta'])
    params.append(id)
    conn.execute(f"UPDATE sugestoes SET {', '.join(fields)} WHERE id=?", params)
    conn.commit()
    conn.close()
    return jsonify({'ok': True})


# ============ ASSISTENTE IA ============

@app.route('/api/assistente', methods=['POST'])
@login_required
def assistente():
    data = request.json
    pergunta = (data.get('pergunta', '') or '').lower().strip()

    knowledge_base = [
        (['proposta', 'criar proposta', 'nova proposta', 'como criar'], 'Para criar uma proposta, clique em "+ Proposta" na tela de Vendas ou Compras. Preencha o CNPJ do cliente (será consultado automaticamente), adicione itens com categoria/quantidade/valor, e defina condições de pagamento.'),
        (['ov', 'ordem de venda', 'converter'], 'Para gerar uma OV, abra uma proposta aprovada e clique em "Converter em Venda". A OV será criada automaticamente com todos os dados da proposta, incluindo parcelas e comissões.'),
        (['oc', 'ordem de compra', 'compra'], 'Para compras, vá em Compras > + Proposta. O fluxo é similar ao de vendas. Após aprovação, converta em OC.'),
        (['pdf', 'gerar pdf', 'imprimir'], 'Na visualização de uma proposta, clique no botão "PDF" para gerar e baixar o documento. Você pode configurar se quer incluir dados bancários e política comercial.'),
        (['whatsapp', 'enviar whatsapp', 'mensagem'], 'Na tela da proposta, clique em "WhatsApp" para enviar automaticamente uma mensagem com resumo e PDF para o contato do cliente.'),
        (['icms', 'imposto', 'pis', 'tributo'], 'O ICMS é calculado automaticamente com base na UF de destino. SP=18%, S/SE=12%, N/NE/CO/ES=7%. PIS/COFINS é fixo em 9,25%. Se o cliente for isento de ICMS em SP, marque "Isento".'),
        (['comissão', 'comissao', 'quanto ganho'], 'A comissão é calculada sobre o valor líquido (após impostos). Percentuais variam por categoria e perfil. Gerentes têm tabela diferente de vendedores.'),
        (['follow-up', 'followup', 'lembrete'], 'Crie follow-ups em qualquer proposta ou cadastro. Eles aparecem no dashboard quando vencem. Acesse todos em Follow-ups no menu.'),
        (['cadastro', 'cliente', 'fornecedor', 'cnpj'], 'Cadastros são unificados (cliente e fornecedor). Ao digitar um CNPJ em uma proposta, o sistema consulta a Receita Federal e cria o cadastro automaticamente.'),
        (['parcela', 'pagamento', 'condição', 'condicao'], 'Defina condições de pagamento na proposta. As parcelas são geradas automaticamente ao converter em OV.'),
        (['dashboard', 'inicio', 'tela inicial'], 'O Dashboard mostra KPIs do mês: vendas, compras, propostas abertas, follow-ups. Gestores veem também o pipeline comercial e oportunidades de recompra.'),
        (['fechamento', 'fechar mês'], 'O Fechamento consolida comissões do mês. Disponível apenas para gestores em Gestão > Fechamento.'),
        (['backup', 'exportar', 'banco'], 'Backups automáticos a cada 6h. Exporte manualmente em Configurações > Backup.'),
        (['meta', 'metas', 'objetivo'], 'Metas de venda são configuradas por gestores em Configurações > Metas. Após converter uma venda, o sistema mostra o progresso em relação à meta.'),
        (['sugestão', 'sugestao', 'bug', 'melhoria', 'problema'], 'Use o botão de Assistente (canto inferior direito) > aba Sugestões para reportar bugs, pedir melhorias ou tirar dúvidas.'),
        (['nota', 'notas', 'anotação'], 'Notas pessoais ficam em Notas no menu. Podem ter checklists, cores, lembretes e vínculos com cadastros/propostas.'),
        (['embalagem', 'tambor', 'ibc', 'óleo'], 'Para Óleo Isolante, você pode adicionar custo de embalagem (Tambor 200L = R$165 ou IBC 1000L = R$510). O sistema calcula a quantidade necessária automaticamente.'),
    ]

    best_match = None
    best_score = 0
    for keywords, answer in knowledge_base:
        score = sum(1 for kw in keywords if kw in pergunta)
        if score > best_score:
            best_score = score
            best_match = answer

    if best_match:
        return jsonify({'resposta': best_match})
    else:
        return jsonify({'resposta': 'Não encontrei uma resposta específica para sua pergunta. Tente reformular ou envie uma sugestão para a equipe de desenvolvimento na aba "Sugestões".'})


# ============ HELPERS ============

def _get_configs(conn):
    rows = conn.execute("SELECT chave, valor FROM configuracoes").fetchall()
    return {r['chave']: r['valor'] for r in rows}


def _mes_fechado(conn, data_emissao_str):
    """Verifica se o mês/ano de uma OV/OC está fechado.
    Retorna True se fechado, False caso contrário.
    Aceita data_emissao como string ISO ('YYYY-MM-DD ...').
    """
    if not data_emissao_str:
        return False
    try:
        dt = datetime.strptime(data_emissao_str[:10], '%Y-%m-%d')
        row = conn.execute(
            "SELECT status FROM fechamentos WHERE mes=? AND ano=? AND status='Fechado' LIMIT 1",
            (dt.month, dt.year)
        ).fetchone()
        return bool(row)
    except Exception:
        return False


def _mes_range(mes, ano):
    """Retorna (data_inicio, data_fim_exclusive) em ISO format para queries que usam índice.
    Trocar strftime('%m',data)=? AND strftime('%Y',data)=? por data >= ? AND data < ?
    permite SQLite usar o índice em data_emissao (B-tree).
    """
    mes = int(mes)
    ano = int(ano)
    inicio = f"{ano:04d}-{mes:02d}-01"
    if mes == 12:
        fim = f"{ano + 1:04d}-01-01"
    else:
        fim = f"{ano:04d}-{mes + 1:02d}-01"
    return inicio, fim


def gerar_parcelas_para_ov(condicao_pagamento_json, valor_bruto_total, data_base, taxa_juros_mensal=2.8):
    """Gera lista de parcelas com juros compostos.

    Centraliza o cálculo que estava duplicado entre frontend (forms.js),
    backend (converter_proposta/create_ov) e PDF (pdf_generator).

    Args:
        condicao_pagamento_json: JSON string ou dict com {tipo, parcelas[], dias_custom}
        valor_bruto_total: soma dos valores dos itens (float)
        data_base: datetime (data base do faturamento ou data_emissao)
        taxa_juros_mensal: % ao mês (default 2.8)

    Returns:
        list of dicts: [{numero, total, valor, data_vencimento, dias}]
        Lista vazia se à vista, sem condição ou valor zero.
    """
    if not condicao_pagamento_json or valor_bruto_total <= 0:
        return []

    try:
        cond = json.loads(condicao_pagamento_json) if isinstance(condicao_pagamento_json, str) else condicao_pagamento_json
    except Exception:
        return []

    cond_tipo = cond.get('tipo', '') if isinstance(cond, dict) else str(cond)

    # If parcelas already computed in cond (frontend sent them), use as-is
    if isinstance(cond, dict) and cond.get('parcelas'):
        return [
            {
                'numero': p['numero'],
                'total': p['total'],
                'valor': float(p['valor']),
                'data_vencimento': p['vencimento'],
                'dias': p.get('dias', 0),
            }
            for p in cond['parcelas']
        ]

    if not data_base:
        data_base = datetime.now()

    # À vista: uma parcela na data base, sem juros
    if cond_tipo == 'À vista':
        return [{
            'numero': 1,
            'total': 1,
            'valor': round(valor_bruto_total, 2),
            'data_vencimento': data_base.strftime('%Y-%m-%d'),
            'dias': 0,
        }]

    # Parse dias from condition string (e.g. "30/60/90 dias" → [30,60,90])
    dias_list = []
    if cond_tipo:
        dias_parts = cond_tipo.replace(' dias', '').split('/')
        dias_list = [int(d.strip()) for d in dias_parts if d.strip().isdigit()]

    if not dias_list and isinstance(cond, dict) and cond.get('dias_custom'):
        try:
            dias_list = [int(d.strip()) for d in str(cond['dias_custom']).split(',') if d.strip()]
        except Exception:
            pass

    if not dias_list:
        # Fallback: single parcela at 30 days
        dias_list = [30]

    n = len(dias_list)
    taxa = float(taxa_juros_mensal) / 100.0
    parcelas = []

    # Calcula valor da parcela COM juros compostos: parcela × (1+taxa)^(dias/30) = valor presente proporcional
    # Para distribuir o valor bruto entre n parcelas iguais com juros:
    # parcela_base = valor_bruto * (1 + taxa)^(dias_medio/30) / n  (aproximação)
    # Mais correto: a soma dos valores futuros descontados deve igualar o valor bruto.
    # Aqui usamos o mesmo cálculo do frontend: parcela_base = total / n, depois aplica juros em cada parcela
    valor_parcela_base = round(valor_bruto_total / n, 2)

    for i, dias in enumerate(dias_list):
        venc = (data_base + timedelta(days=dias)).strftime('%Y-%m-%d')
        # Aplica juros compostos sobre o valor base de cada parcela
        valor_com_juros = valor_parcela_base * ((1 + taxa) ** (dias / 30.0))
        # Last parcela ajusta para somar exatamente
        if i < n - 1:
            valor_final = round(valor_com_juros, 2)
        else:
            # Calcula o total dos anteriores e ajusta a última
            soma_anteriores = sum(p['valor'] for p in parcelas)
            # Soma esperada com juros
            total_esperado = sum(
                valor_parcela_base * ((1 + taxa) ** (d / 30.0))
                for d in dias_list
            )
            valor_final = round(total_esperado - soma_anteriores, 2)

        parcelas.append({
            'numero': i + 1,
            'total': n,
            'valor': valor_final,
            'data_vencimento': venc,
            'dias': dias,
        })

    return parcelas


def _atualizar_juros_proposta(conn, prop_id, condicao_pagamento, data_base_faturamento, taxa_juros_aplicada):
    """Calcula juros_total/valor_liquido_abmt da proposta a partir das parcelas geradas
    pelo serviço centralizado e atualiza no banco. Fonte de verdade do backend.
    """
    vb = conn.execute(
        "SELECT COALESCE(SUM(valor_total),0) as t FROM proposta_items WHERE proposta_id=?",
        (prop_id,)
    ).fetchone()['t']
    try:
        db_fat = data_base_faturamento or datetime.now().strftime('%Y-%m-%d')
        data_base_dt = datetime.strptime(db_fat[:10], '%Y-%m-%d')
    except Exception:
        data_base_dt = datetime.now()
    taxa = float(taxa_juros_aplicada or _get_configs(conn).get('taxa_juros_venda_prazo', 2.8))
    parcelas = gerar_parcelas_para_ov(condicao_pagamento, vb, data_base_dt, taxa)
    soma = sum(p['valor'] for p in parcelas)
    juros = round(soma - vb, 2) if soma > vb else 0
    liquido = round(vb - juros, 2)
    conn.execute(
        "UPDATE propostas SET juros_total=?, valor_liquido_abmt=?, taxa_juros_aplicada=? WHERE id=?",
        (juros, liquido, taxa, prop_id)
    )
    return juros, liquido, taxa


def calcular_comissao_item(valor_total, categoria, perfil, uf_destino, icms_isento, pis_percentual, configs):
    """Calcula comissão de um item. Função pura — usada pelo sistema e pelos testes.

    Args:
        valor_total: valor bruto do item (float)
        categoria: categoria do item (ex: 'Transformador Usado')
        perfil: perfil do vendedor ('vendedor', 'gerente', 'diretor')
        uf_destino: UF de destino (ex: 'SP', 'MG')
        icms_isento: se o cliente é isento de ICMS (bool/int)
        pis_percentual: alíquota PIS/COFINS (float, ex: 9.25)
        configs: dict com chaves 'comissao_vendas' (JSON str) e 'icms_tabela' (JSON str)

    Returns:
        dict com: comissao_percentual, comissao_valor, base_liquida, icms_pct, pis_pct
    """
    comissao_vendas = json.loads(configs.get('comissao_vendas', '{}'))
    icms_tabela = json.loads(configs.get('icms_tabela', '{}'))

    # Selecionar tabela de comissão pelo perfil
    if perfil == 'gerente':
        tabela = comissao_vendas.get('gerente', {})
    elif perfil == 'diretor':
        tabela = comissao_vendas.get('diretor', {})
    else:
        tabela = comissao_vendas.get('vendedor', {})

    # Resolver ICMS
    uf = uf_destino or 'SP'
    icms_pct = 0 if (uf == 'SP' and icms_isento) else float(icms_tabela.get(uf, 0))
    pis_pct = float(pis_percentual)

    # Calcular
    com_pct = float(tabela.get(categoria, 0))
    base_liquida = (valor_total or 0) * (1 - pis_pct / 100 - icms_pct / 100)
    com_val = base_liquida * com_pct / 100

    return {
        'comissao_percentual': com_pct,
        'comissao_valor': round(com_val, 2),
        'base_liquida': round(base_liquida, 2),
        'icms_pct': icms_pct,
        'pis_pct': pis_pct
    }


# ============ PDF DOWNLOAD ============

@app.route('/api/propostas/<int:id>/pdf')
@login_required
def download_proposta_pdf(id):
    from pdf_generator import generate_proposta_pdf
    filepath, error = generate_proposta_pdf(id)
    if error:
        return jsonify({'error': error}), 400
    return send_file(filepath, as_attachment=True, download_name=os.path.basename(filepath))


# ============ DASHBOARD ADVANCED (SEPARATED VENDAS/COMPRAS) ============

@app.route('/api/dashboard/advanced')
@login_required
def dashboard_advanced():
    """Returns comprehensive dashboard data with VENDAS and COMPRAS completely separated"""
    user = get_current_user()
    conn = get_db()
    now = datetime.now()
    # Month/year filter — defaults to current
    mes = int(request.args.get('mes', now.month))
    ano = int(request.args.get('ano', now.year))
    mes_str = f'{mes:02d}'
    ano_str = str(ano)
    hoje = now.strftime('%Y-%m-%d')
    is_gestor = user['perfil'] in ('gerente', 'diretor')

    vendedor_filter_ov = ""
    vendedor_filter_oc = ""
    vendedor_filter_prop = ""
    cat_filter_ov = ""
    cat_filter_oc = ""
    params_v = []
    params_c = []
    params_p_v = []
    params_p_c = []
    cat_params_v = []
    cat_params_c = []

    # Vendedor filter: auto for vendedor role, or explicit param for gestor
    filter_vendedor_id = request.args.get('vendedor_id', type=int)
    filter_categoria = request.args.get('categoria', '')

    if user['perfil'] == 'vendedor':
        vendedor_filter_ov = "AND ov.vendedor_id = ?"
        vendedor_filter_oc = "AND oc.comprador_id = ?"
        vendedor_filter_prop = "AND p.vendedor_id = ?"
        params_v = [user['id']]
        params_c = [user['id']]
        params_p_v = [user['id']]
        params_p_c = [user['id']]
    elif filter_vendedor_id and is_gestor:
        vendedor_filter_ov = "AND ov.vendedor_id = ?"
        vendedor_filter_oc = "AND oc.comprador_id = ?"
        vendedor_filter_prop = "AND p.vendedor_id = ?"
        params_v = [filter_vendedor_id]
        params_c = [filter_vendedor_id]
        params_p_v = [filter_vendedor_id]
        params_p_c = [filter_vendedor_id]

    if filter_categoria:
        cat_filter_ov = "AND i.categoria = ?"
        cat_filter_oc = "AND i.categoria = ?"
        cat_params_v = [filter_categoria]
        cat_params_c = [filter_categoria]

    # Segmento filter (client type)
    filter_segmento = request.args.get('segmento', '')
    seg_filter_ov = ""
    seg_filter_oc = ""
    seg_params_v = []
    seg_params_c = []
    if filter_segmento:
        seg_filter_ov = "AND ov.cadastro_id IN (SELECT id FROM cadastros WHERE segmento = ?)"
        seg_filter_oc = "AND oc.cadastro_id IN (SELECT id FROM cadastros WHERE segmento = ?)"
        seg_params_v = [filter_segmento]
        seg_params_c = [filter_segmento]

    # ===== VENDAS KPIs =====
    # Vendas no mês (OVs)
    vendas_mes = conn.execute(f"""
        SELECT COALESCE(SUM(i.valor_total), 0) as total, COUNT(DISTINCT ov.id) as count
        FROM ov_items i JOIN ordens_venda ov ON i.ov_id = ov.id
        WHERE strftime('%m', ov.data_emissao) = ? AND strftime('%Y', ov.data_emissao) = ?
        AND ov.status != 'Cancelada' {vendedor_filter_ov} {cat_filter_ov} {seg_filter_ov}
    """, [mes_str, ano_str] + params_v + cat_params_v + seg_params_v).fetchone()

    # Vendas mês anterior (para comparação)
    mes_ant = mes - 1 if mes > 1 else 12
    ano_ant = ano if mes > 1 else ano - 1
    vendas_mes_anterior = conn.execute(f"""
        SELECT COALESCE(SUM(i.valor_total), 0) as total
        FROM ov_items i JOIN ordens_venda ov ON i.ov_id = ov.id
        WHERE strftime('%m', ov.data_emissao) = ? AND strftime('%Y', ov.data_emissao) = ?
        AND ov.status != 'Cancelada' {vendedor_filter_ov} {cat_filter_ov} {seg_filter_ov}
    """, [f'{mes_ant:02d}', str(ano_ant)] + params_v + cat_params_v + seg_params_v).fetchone()['total']

    # Ticket médio vendas
    ticket_vendas = conn.execute(f"""
        SELECT COALESCE(AVG(ov_total), 0) as ticket FROM (
            SELECT COALESCE(SUM(i.valor_total), 0) as ov_total
            FROM ordens_venda ov LEFT JOIN ov_items i ON i.ov_id = ov.id
            WHERE strftime('%m', ov.data_emissao) = ? AND strftime('%Y', ov.data_emissao) = ?
            AND ov.status != 'Cancelada' {vendedor_filter_ov} {cat_filter_ov} {seg_filter_ov}
            GROUP BY ov.id
        )
    """, [mes_str, ano_str] + params_v + cat_params_v + seg_params_v).fetchone()['ticket']

    # Propostas de venda abertas
    props_venda_abertas = conn.execute(f"""
        SELECT COUNT(*) as c FROM propostas p
        WHERE p.tipo = 'VENDA' AND p.status NOT IN ('Convertida','Perdida','Expirada') {vendedor_filter_prop}
    """, params_p_v).fetchone()['c']

    # Propostas de venda no mês
    props_venda_mes = conn.execute(f"""
        SELECT COUNT(*) as total,
            SUM(CASE WHEN p.status = 'Convertida' THEN 1 ELSE 0 END) as convertidas,
            SUM(CASE WHEN p.status = 'Perdida' THEN 1 ELSE 0 END) as perdidas
        FROM propostas p
        WHERE p.tipo = 'VENDA' AND strftime('%m', p.data_emissao) = ? AND strftime('%Y', p.data_emissao) = ? {vendedor_filter_prop}
    """, [mes_str, ano_str] + params_p_v).fetchone()

    taxa_conversao_venda = 0
    if props_venda_mes['total'] and props_venda_mes['total'] > 0:
        taxa_conversao_venda = round((props_venda_mes['convertidas'] or 0) / props_venda_mes['total'] * 100, 1)

    # Comissão de vendas no mês
    comissao_vendas = conn.execute(f"""
        SELECT COALESCE(SUM(i.comissao_valor), 0) as total
        FROM ov_items i JOIN ordens_venda ov ON i.ov_id = ov.id
        WHERE strftime('%m', ov.data_emissao) = ? AND strftime('%Y', ov.data_emissao) = ?
        AND ov.status != 'Cancelada' {vendedor_filter_ov} {cat_filter_ov} {seg_filter_ov}
    """, [mes_str, ano_str] + params_v + cat_params_v + seg_params_v).fetchone()['total']

    # Vendas por categoria no mês
    vendas_por_cat = conn.execute(f"""
        SELECT i.categoria, COALESCE(SUM(i.valor_total), 0) as valor, COALESCE(SUM(i.peso_total), 0) as peso, COUNT(*) as qtd
        FROM ov_items i JOIN ordens_venda ov ON i.ov_id = ov.id
        WHERE strftime('%m', ov.data_emissao) = ? AND strftime('%Y', ov.data_emissao) = ?
        AND ov.status != 'Cancelada' {vendedor_filter_ov} {cat_filter_ov} {seg_filter_ov}
        GROUP BY i.categoria ORDER BY valor DESC
    """, [mes_str, ano_str] + params_v + cat_params_v + seg_params_v).fetchall()

    # Clientes recorrentes vendas
    if filter_categoria or filter_segmento:
        clientes_unicos_v = conn.execute(f"""
            SELECT COUNT(DISTINCT ov.cadastro_id) as c
            FROM ordens_venda ov JOIN ov_items i ON i.ov_id = ov.id
            WHERE strftime('%m', ov.data_emissao) = ? AND strftime('%Y', ov.data_emissao) = ?
            AND ov.status != 'Cancelada' {vendedor_filter_ov} {cat_filter_ov} {seg_filter_ov}
        """, [mes_str, ano_str] + params_v + cat_params_v + seg_params_v).fetchone()['c']
    else:
        clientes_unicos_v = conn.execute(f"""
            SELECT COUNT(DISTINCT ov.cadastro_id) as c
            FROM ordens_venda ov
            WHERE strftime('%m', ov.data_emissao) = ? AND strftime('%Y', ov.data_emissao) = ?
            AND ov.status != 'Cancelada' {vendedor_filter_ov}
        """, [mes_str, ano_str] + params_v).fetchone()['c']

    # Pipeline mes (propostas abertas)
    pipeline_mes = 0
    if is_gestor:
        pipeline_mes = conn.execute(
            """SELECT COALESCE(SUM((SELECT SUM(valor_total) FROM proposta_items WHERE proposta_id=p.id)), 0) as t
               FROM propostas p WHERE p.tipo='VENDA' AND p.status IN ('Rascunho','Enviada','Em Negociação','Aprovada')"""
        ).fetchone()['t']

    # ===== COMPRAS KPIs =====
    # Compras no mês (OCs)
    compras_mes = conn.execute(f"""
        SELECT COALESCE(SUM(i.valor_total), 0) as total, COUNT(DISTINCT oc.id) as count
        FROM oc_items i JOIN ordens_compra oc ON i.oc_id = oc.id
        WHERE strftime('%m', oc.data_emissao) = ? AND strftime('%Y', oc.data_emissao) = ?
        AND oc.status != 'Cancelada' {vendedor_filter_oc} {cat_filter_oc} {seg_filter_oc}
    """, [mes_str, ano_str] + params_c + cat_params_c + seg_params_c).fetchone()

    # Compras mês anterior
    compras_mes_anterior = conn.execute(f"""
        SELECT COALESCE(SUM(i.valor_total), 0) as total
        FROM oc_items i JOIN ordens_compra oc ON i.oc_id = oc.id
        WHERE strftime('%m', oc.data_emissao) = ? AND strftime('%Y', oc.data_emissao) = ?
        AND oc.status != 'Cancelada' {vendedor_filter_oc} {cat_filter_oc} {seg_filter_oc}
    """, [f'{mes_ant:02d}', str(ano_ant)] + params_c + cat_params_c + seg_params_c).fetchone()['total']

    # Ticket médio compras
    ticket_compras = conn.execute(f"""
        SELECT COALESCE(AVG(oc_total), 0) as ticket FROM (
            SELECT COALESCE(SUM(i.valor_total), 0) as oc_total
            FROM ordens_compra oc LEFT JOIN oc_items i ON i.oc_id = oc.id
            WHERE strftime('%m', oc.data_emissao) = ? AND strftime('%Y', oc.data_emissao) = ?
            AND oc.status != 'Cancelada' {vendedor_filter_oc} {cat_filter_oc} {seg_filter_oc}
            GROUP BY oc.id
        )
    """, [mes_str, ano_str] + params_c + cat_params_c + seg_params_c).fetchone()['ticket']

    # Propostas de compra abertas
    props_compra_abertas = conn.execute(f"""
        SELECT COUNT(*) as c FROM propostas p
        WHERE p.tipo = 'COMPRA' AND p.status NOT IN ('Convertida','Perdida','Expirada') {vendedor_filter_prop}
    """, params_p_c).fetchone()['c']

    # Propostas de compra no mês
    props_compra_mes = conn.execute(f"""
        SELECT COUNT(*) as total,
            SUM(CASE WHEN p.status = 'Convertida' THEN 1 ELSE 0 END) as convertidas
        FROM propostas p
        WHERE p.tipo = 'COMPRA' AND strftime('%m', p.data_emissao) = ? AND strftime('%Y', p.data_emissao) = ? {vendedor_filter_prop}
    """, [mes_str, ano_str] + params_p_c).fetchone()

    taxa_conversao_compra = 0
    if props_compra_mes['total'] and props_compra_mes['total'] > 0:
        taxa_conversao_compra = round((props_compra_mes['convertidas'] or 0) / props_compra_mes['total'] * 100, 1)

    # Compras por categoria no mês
    compras_por_cat = conn.execute(f"""
        SELECT i.categoria, COALESCE(SUM(i.valor_total), 0) as valor, COALESCE(SUM(i.peso_total), 0) as peso, COUNT(*) as qtd
        FROM oc_items i JOIN ordens_compra oc ON i.oc_id = oc.id
        WHERE strftime('%m', oc.data_emissao) = ? AND strftime('%Y', oc.data_emissao) = ?
        AND oc.status != 'Cancelada' {vendedor_filter_oc} {cat_filter_oc} {seg_filter_oc}
        GROUP BY i.categoria ORDER BY valor DESC
    """, [mes_str, ano_str] + params_c + cat_params_c + seg_params_c).fetchall()

    # Fornecedores únicos compras
    if filter_categoria or filter_segmento:
        fornecedores_unicos = conn.execute(f"""
            SELECT COUNT(DISTINCT oc.cadastro_id) as c
            FROM ordens_compra oc JOIN oc_items i ON i.oc_id = oc.id
            WHERE strftime('%m', oc.data_emissao) = ? AND strftime('%Y', oc.data_emissao) = ?
            AND oc.status != 'Cancelada' {vendedor_filter_oc} {cat_filter_oc} {seg_filter_oc}
        """, [mes_str, ano_str] + params_c + cat_params_c + seg_params_c).fetchone()['c']
    else:
        fornecedores_unicos = conn.execute(f"""
            SELECT COUNT(DISTINCT oc.cadastro_id) as c
            FROM ordens_compra oc
            WHERE strftime('%m', oc.data_emissao) = ? AND strftime('%Y', oc.data_emissao) = ?
            AND oc.status != 'Cancelada' {vendedor_filter_oc}
        """, [mes_str, ano_str] + params_c).fetchone()['c']

    # ===== COMPRAS ANALYTICS EXTRAS =====
    # Preço médio por categoria (R$/unidade) — mês atual vs anterior
    preco_medio_cat = conn.execute(f"""
        SELECT i.categoria, i.unidade,
            COALESCE(SUM(i.valor_total), 0) as valor_total,
            COALESCE(SUM(i.quantidade), 0) as qtd_total,
            COALESCE(SUM(i.peso_total), 0) as peso_total,
            CASE WHEN SUM(i.quantidade) > 0 THEN SUM(i.valor_total) / SUM(i.quantidade) ELSE 0 END as preco_medio
        FROM oc_items i JOIN ordens_compra oc ON i.oc_id = oc.id
        WHERE strftime('%m', oc.data_emissao) = ? AND strftime('%Y', oc.data_emissao) = ?
        AND oc.status != 'Cancelada' {vendedor_filter_oc} {cat_filter_oc} {seg_filter_oc}
        GROUP BY i.categoria, i.unidade ORDER BY valor_total DESC
    """, [mes_str, ano_str] + params_c + cat_params_c + seg_params_c).fetchall()

    preco_medio_cat_ant = conn.execute(f"""
        SELECT i.categoria, i.unidade,
            CASE WHEN SUM(i.quantidade) > 0 THEN SUM(i.valor_total) / SUM(i.quantidade) ELSE 0 END as preco_medio
        FROM oc_items i JOIN ordens_compra oc ON i.oc_id = oc.id
        WHERE strftime('%m', oc.data_emissao) = ? AND strftime('%Y', oc.data_emissao) = ?
        AND oc.status != 'Cancelada' {vendedor_filter_oc}
        GROUP BY i.categoria, i.unidade
    """, [f'{mes_ant:02d}', str(ano_ant)] + params_c).fetchall()
    preco_ant_map = {(r['categoria'], r['unidade']): r['preco_medio'] for r in preco_medio_cat_ant}

    analytics_categorias = []
    for r in preco_medio_cat:
        key = (r['categoria'], r['unidade'])
        preco_ant = preco_ant_map.get(key, 0)
        variacao = round((r['preco_medio'] - preco_ant) / preco_ant * 100, 1) if preco_ant > 0 else 0
        analytics_categorias.append({
            'categoria': r['categoria'],
            'unidade': r['unidade'],
            'qtd_total': r['qtd_total'],
            'peso_total': r['peso_total'],
            'valor_total': r['valor_total'],
            'preco_medio': round(r['preco_medio'], 2),
            'preco_medio_anterior': round(preco_ant, 2),
            'variacao_preco': variacao
        })

    # Subcategorias detalhadas — agrupa por categoria + specs (potência, tipo, etc.)
    detalhe_itens = conn.execute(f"""
        SELECT i.categoria, i.unidade, i.campos_especificos, i.quantidade, i.peso_total,
            i.valor_total, i.valor_unitario, oc.numero as oc_numero, oc.id as oc_id,
            c.razao_social as fornecedor, oc.data_emissao
        FROM oc_items i JOIN ordens_compra oc ON i.oc_id = oc.id
        LEFT JOIN cadastros c ON oc.cadastro_id = c.id
        WHERE strftime('%m', oc.data_emissao) = ? AND strftime('%Y', oc.data_emissao) = ?
        AND oc.status != 'Cancelada' {vendedor_filter_oc} {cat_filter_oc} {seg_filter_oc}
        ORDER BY i.categoria, i.valor_total DESC
    """, [mes_str, ano_str] + params_c + cat_params_c + seg_params_c).fetchall()

    # Build subcategories per category
    cat_subcats = {}
    for item in detalhe_itens:
        specs = json.loads(item['campos_especificos'] or '{}')
        cat = item['categoria']
        # Build sub-label — agrupa por specs técnicos principais (potência, tipo aço, espessura)
        # Marca e condição vão nos detalhes individuais, não no agrupamento
        sub_parts = []
        if specs.get('potencia'):
            sub_parts.append(f"{specs['potencia']} kVA")
        if specs.get('tipo'):
            sub_parts.append(specs['tipo'])
        if specs.get('nucleo'):
            sub_parts.append(specs['nucleo'])
        if specs.get('tipo_aco'):
            sub_parts.append(specs['tipo_aco'])
        if specs.get('espessura'):
            sub_parts.append(f"Esp. {specs['espessura']}")
        if specs.get('largura'):
            sub_parts.append(f"Larg. {specs['largura']}")
        sub_label = ' · '.join(sub_parts) if sub_parts else 'Sem detalhe'

        if cat not in cat_subcats:
            cat_subcats[cat] = {}
        if sub_label not in cat_subcats[cat]:
            cat_subcats[cat][sub_label] = {'qtd': 0, 'peso': 0, 'valor': 0, 'compras': []}
        cat_subcats[cat][sub_label]['qtd'] += (item['quantidade'] or 0)
        cat_subcats[cat][sub_label]['peso'] += (item['peso_total'] or 0)
        cat_subcats[cat][sub_label]['valor'] += (item['valor_total'] or 0)
        # Detalhes extras pra exibir nas compras individuais
        detalhe_parts = []
        if specs.get('marca'):
            detalhe_parts.append(specs['marca'])
        if specs.get('condicao'):
            detalhe_parts.append(specs['condicao'])
        if specs.get('tensao_alta') or specs.get('tensao_baixa'):
            detalhe_parts.append(f"{specs.get('tensao_alta','')}/{specs.get('tensao_baixa','')}")
        cat_subcats[cat][sub_label]['compras'].append({
            'oc_id': item['oc_id'], 'oc_numero': item['oc_numero'],
            'fornecedor': item['fornecedor'] or '', 'data': item['data_emissao'],
            'qtd': item['quantidade'], 'peso': item['peso_total'] or 0,
            'valor': item['valor_total'] or 0, 'preco_unit': item['valor_unitario'] or 0,
            'detalhe': ' · '.join(detalhe_parts) if detalhe_parts else ''
        })

    # Attach subcats to analytics_categorias
    for ac in analytics_categorias:
        subs = cat_subcats.get(ac['categoria'], {})
        ac['subcategorias'] = [
            {'label': k, 'qtd': round(v['qtd'], 2), 'peso': round(v['peso'], 2),
             'valor': round(v['valor'], 2),
             'preco_medio': round(v['valor'] / v['qtd'], 2) if v['qtd'] > 0 else 0,
             'preco_medio_kg': round(v['valor'] / v['peso'], 2) if v['peso'] > 0 else 0,
             'compras': v['compras']}
            for k, v in sorted(subs.items(), key=lambda x: -x[1]['valor'])
        ]

    # OCs pendentes de recebimento
    ocs_pendentes = conn.execute(f"""
        SELECT oc.id, oc.numero, c.razao_social as fornecedor,
            COALESCE(SUM(i.quantidade), 0) as qtd_total,
            COALESCE(SUM(i.quantidade_recebida), 0) as qtd_recebida,
            COALESCE(SUM(i.valor_total), 0) as valor_total,
            oc.data_emissao,
            CAST(julianday(?) - julianday(oc.data_emissao) AS INTEGER) as dias_aberta
        FROM ordens_compra oc
        JOIN oc_items i ON i.oc_id = oc.id
        LEFT JOIN cadastros c ON oc.cadastro_id = c.id
        WHERE oc.status NOT IN ('Cancelada', 'Recebida Total', 'Concluída')
        AND i.status != 'Recebido Total'
        {vendedor_filter_oc} {cat_filter_oc} {seg_filter_oc}
        GROUP BY oc.id ORDER BY dias_aberta DESC LIMIT 10
    """, [hoje] + params_c + cat_params_c + seg_params_c).fetchall()

    # Peso total comprado no mês
    peso_total_mes = sum(r['peso_total'] for r in analytics_categorias)

    # ===== INSIGHTS AUTOMÁTICOS =====
    insights = []

    # Top categoria vendas
    if vendas_por_cat:
        top_cat = vendas_por_cat[0]
        pct = round(top_cat['valor'] / vendas_mes['total'] * 100, 1) if vendas_mes['total'] > 0 else 0
        insights.append({'tipo': 'vendas', 'icon': '🏆', 'cor': 'green', 'texto': f"{top_cat['categoria']} lidera vendas com R$ {top_cat['valor']:,.2f} ({pct}% do total)"})

    # Top vendedor
    if is_gestor:
        top_vend = conn.execute("""
            SELECT u.nome, COALESCE(SUM(i.valor_total), 0) as total, COUNT(DISTINCT ov.id) as count
            FROM ov_items i JOIN ordens_venda ov ON i.ov_id = ov.id JOIN users u ON ov.vendedor_id = u.id
            WHERE strftime('%m', ov.data_emissao) = ? AND strftime('%Y', ov.data_emissao) = ? AND ov.status != 'Cancelada'
            GROUP BY u.id ORDER BY total DESC LIMIT 1
        """, [mes_str, ano_str]).fetchone()
        if top_vend and top_vend['total'] > 0:
            insights.append({'tipo': 'vendas', 'icon': '👤', 'cor': 'blue', 'texto': f"Top vendedor: {top_vend['nome']} com {top_vend['count']} vendas (R$ {top_vend['total']:,.2f})"})

    # Taxa de conversão
    if props_venda_mes['total'] and props_venda_mes['total'] > 0:
        insights.append({'tipo': 'vendas', 'icon': '📊', 'cor': 'yellow' if taxa_conversao_venda < 30 else 'green',
            'texto': f"Taxa de conversão vendas: {taxa_conversao_venda}% — {props_venda_mes['convertidas'] or 0} de {props_venda_mes['total']} propostas"})

    # Top categoria compras
    if compras_por_cat:
        top_cat_c = compras_por_cat[0]
        pct_c = round(top_cat_c['valor'] / compras_mes['total'] * 100, 1) if compras_mes['total'] > 0 else 0
        insights.append({'tipo': 'compras', 'icon': '📥', 'cor': 'blue', 'texto': f"{top_cat_c['categoria']} lidera compras com R$ {top_cat_c['valor']:,.2f} ({pct_c}% do total)"})

    # Variação mês anterior
    if vendas_mes_anterior > 0:
        var_v = round((vendas_mes['total'] - vendas_mes_anterior) / vendas_mes_anterior * 100, 1)
        insights.append({'tipo': 'vendas', 'icon': '📈' if var_v >= 0 else '📉', 'cor': 'green' if var_v >= 0 else 'red',
            'texto': f"Vendas {'subiram' if var_v >= 0 else 'caíram'} {abs(var_v)}% vs mês anterior"})

    if compras_mes_anterior > 0:
        var_c = round((compras_mes['total'] - compras_mes_anterior) / compras_mes_anterior * 100, 1)
        insights.append({'tipo': 'compras', 'icon': '📈' if var_c >= 0 else '📉', 'cor': 'green' if var_c >= 0 else 'red',
            'texto': f"Compras {'subiram' if var_c >= 0 else 'caíram'} {abs(var_c)}% vs mês anterior"})

    # Pipeline alert
    if pipeline_mes > 0:
        insights.append({'tipo': 'vendas', 'icon': '🎯', 'cor': 'blue', 'texto': f"R$ {pipeline_mes:,.2f} em propostas abertas no pipeline"})

    # ===== TOP RANKINGS =====
    top_clientes = []
    top_fornecedores = []
    vendas_por_vendedor = {}

    if is_gestor:
        top_cli = conn.execute(f"""
            SELECT c.razao_social as nome, COALESCE(SUM(i.valor_total), 0) as total, COUNT(DISTINCT ov.id) as count
            FROM ov_items i JOIN ordens_venda ov ON i.ov_id = ov.id JOIN cadastros c ON ov.cadastro_id = c.id
            WHERE strftime('%m', ov.data_emissao) = ? AND strftime('%Y', ov.data_emissao) = ? AND ov.status != 'Cancelada'
            {vendedor_filter_ov} {cat_filter_ov} {seg_filter_ov}
            GROUP BY c.id ORDER BY total DESC LIMIT 5
        """, [mes_str, ano_str] + params_v + cat_params_v + seg_params_v).fetchall()
        top_clientes = [{'nome': r['nome'], 'total': r['total'], 'count': r['count']} for r in top_cli]

        top_forn = conn.execute(f"""
            SELECT c.razao_social as nome, COALESCE(SUM(i.valor_total), 0) as total, COUNT(DISTINCT oc.id) as count
            FROM oc_items i JOIN ordens_compra oc ON i.oc_id = oc.id JOIN cadastros c ON oc.cadastro_id = c.id
            WHERE strftime('%m', oc.data_emissao) = ? AND strftime('%Y', oc.data_emissao) = ? AND oc.status != 'Cancelada'
            {vendedor_filter_oc} {cat_filter_oc} {seg_filter_oc}
            GROUP BY c.id ORDER BY total DESC LIMIT 5
        """, [mes_str, ano_str] + params_c + cat_params_c + seg_params_c).fetchall()
        top_fornecedores = [{'nome': r['nome'], 'total': r['total'], 'count': r['count']} for r in top_forn]

        vend_rows = conn.execute(f"""
            SELECT u.nome, COALESCE(SUM(i.valor_total), 0) as total
            FROM ov_items i JOIN ordens_venda ov ON i.ov_id = ov.id JOIN users u ON ov.vendedor_id = u.id
            WHERE strftime('%m', ov.data_emissao) = ? AND strftime('%Y', ov.data_emissao) = ? AND ov.status != 'Cancelada'
            {cat_filter_ov} {seg_filter_ov}
            GROUP BY u.id ORDER BY total DESC
        """, [mes_str, ano_str] + cat_params_v + seg_params_v).fetchall()
        vendas_por_vendedor = {r['nome']: r['total'] for r in vend_rows}

    # ===== RANKING VENDEDORES COM META (gestor only) =====
    ranking_vendedores = []
    if is_gestor:
        mes_meta = f'{ano}-{mes:02d}'
        vend_ranking = conn.execute("""
            SELECT u.id, u.nome, u.perfil,
                COALESCE((SELECT SUM(i.valor_total) FROM ov_items i JOIN ordens_venda ov ON i.ov_id=ov.id
                    WHERE ov.vendedor_id=u.id AND strftime('%m',ov.data_emissao)=? AND strftime('%Y',ov.data_emissao)=?
                    AND ov.status!='Cancelada'), 0) as realizado,
                COALESCE((SELECT meta_mensal FROM metas WHERE user_id=u.id AND mes=?), 0) as meta
            FROM users u WHERE u.ativo=1
            ORDER BY realizado DESC
        """, (mes_str, ano_str, mes_meta)).fetchall()
        for v in vend_ranking:
            pct = round(v['realizado'] / v['meta'] * 100, 1) if v['meta'] > 0 else 0
            ranking_vendedores.append({
                'id': v['id'], 'nome': v['nome'], 'perfil': v['perfil'],
                'realizado': v['realizado'], 'meta': v['meta'], 'pct': pct
            })

    # ===== INADIMPLÊNCIA (gestor only) =====
    inadimplencia = []
    inadimplencia_total = 0
    if is_gestor:
        rows_inad = conn.execute("""
            SELECT c.id as cadastro_id, c.razao_social, p.data_vencimento, p.valor,
                CAST(julianday(?) - julianday(p.data_vencimento) AS INTEGER) as dias_atraso
            FROM ov_parcelas p
            JOIN ordens_venda ov ON p.ov_id=ov.id
            JOIN cadastros c ON ov.cadastro_id=c.id
            WHERE (p.status='Pendente' OR p.status='Vencida') AND date(p.data_vencimento) < ?
            ORDER BY dias_atraso DESC LIMIT 20
        """, (hoje, hoje)).fetchall()
        for r in rows_inad:
            inadimplencia.append({
                'cadastro_id': r['cadastro_id'], 'cliente': r['razao_social'],
                'vencimento': r['data_vencimento'], 'valor': r['valor'], 'dias_atraso': r['dias_atraso']
            })
            inadimplencia_total += r['valor']

    # Follow-ups
    followups_hoje = conn.execute(
        "SELECT COUNT(*) as c FROM followups WHERE user_id=? AND concluido=0 AND date(data_hora)=?",
        (user['id'], hoje)).fetchone()['c']
    followups_atrasados = conn.execute(
        "SELECT COUNT(*) as c FROM followups WHERE user_id=? AND concluido=0 AND date(data_hora)<?",
        (user['id'], hoje)).fetchone()['c']

    # Notificações
    notif_count = conn.execute(
        "SELECT COUNT(*) as c FROM notificacoes WHERE user_id=? AND lida=0",
        (user['id'],)).fetchone()['c']

    # Custo financeiro do prazo — juros das ORDENS DE VENDA do mês (gestor/diretor only)
    # Baseado em OVs (vendas confirmadas) para casar com "Faturamento do mês"
    custo_financeiro = {}
    if is_gestor:
        juros_row = conn.execute("""
            SELECT COALESCE(SUM(ov.juros_total), 0) as juros_total,
                   COALESCE(SUM(ov.valor_liquido_abmt), 0) as liquido_total,
                   COUNT(*) as count_ovs
            FROM ordens_venda ov
            WHERE ov.juros_total > 0 AND ov.status != 'Cancelada'
            AND strftime('%m', ov.data_emissao) = ? AND strftime('%Y', ov.data_emissao) = ?
        """, [mes_str, ano_str]).fetchone()
        custo_financeiro = {
            'juros_total_mes': juros_row['juros_total'],
            'liquido_total_mes': juros_row['liquido_total'],
            'count_propostas': juros_row['count_ovs'],
            'percentual_sobre_vendas': round(juros_row['juros_total'] / vendas_mes['total'] * 100, 2) if vendas_mes['total'] > 0 else 0,
        }

    conn.close()

    return jsonify({
        'vendas': {
            'total_mes': vendas_mes['total'],
            'total_mes_anterior': vendas_mes_anterior,
            'count_mes': vendas_mes['count'],
            'ticket_medio': ticket_vendas,
            'propostas_abertas': props_venda_abertas,
            'propostas_mes': props_venda_mes['total'] or 0,
            'convertidas_mes': props_venda_mes['convertidas'] or 0,
            'perdidas_mes': props_venda_mes['perdidas'] or 0,
            'taxa_conversao': taxa_conversao_venda,
            'comissao_mes': comissao_vendas,
            'clientes_unicos': clientes_unicos_v,
            'por_categoria': [{'categoria': r['categoria'], 'valor': r['valor'], 'peso': r['peso'], 'qtd': r['qtd']} for r in vendas_por_cat],
            'pipeline_mes': pipeline_mes,
            'top_clientes': top_clientes,
            'por_vendedor': vendas_por_vendedor,
        },
        'compras': {
            'total_mes': compras_mes['total'],
            'total_mes_anterior': compras_mes_anterior,
            'count_mes': compras_mes['count'],
            'ticket_medio': ticket_compras,
            'propostas_abertas': props_compra_abertas,
            'propostas_mes': props_compra_mes['total'] or 0,
            'convertidas_mes': props_compra_mes['convertidas'] or 0,
            'taxa_conversao': taxa_conversao_compra,
            'fornecedores_unicos': fornecedores_unicos,
            'por_categoria': [{'categoria': r['categoria'], 'valor': r['valor'], 'peso': r['peso'], 'qtd': r['qtd']} for r in compras_por_cat],
            'top_fornecedores': top_fornecedores,
            'analytics_categorias': analytics_categorias,
            'ocs_pendentes': [dict(r) for r in ocs_pendentes],
            'peso_total_mes': peso_total_mes,
        },
        'insights': insights,
        'followups_hoje': followups_hoje,
        'followups_atrasados': followups_atrasados,
        'notificacoes': notif_count,
        'mes': mes,
        'ano': ano,
        'is_gestor': is_gestor,
        'filtro_vendedor_id': filter_vendedor_id,
        'filtro_categoria': filter_categoria or None,
        'filtro_segmento': filter_segmento or None,
        'ranking_vendedores': ranking_vendedores,
        'inadimplencia': inadimplencia,
        'inadimplencia_total': inadimplencia_total,
        'margem_bruta': vendas_mes['total'] - compras_mes['total'],
        'margem_pct': round((vendas_mes['total'] - compras_mes['total']) / vendas_mes['total'] * 100, 1) if vendas_mes['total'] > 0 else 0,
        'custo_financeiro': custo_financeiro,
    })


@app.route('/api/dashboard/comparativo')
@login_required
def dashboard_comparativo():
    """Rich comparatives: vendedor performance, category margins, period comparison"""
    user = get_current_user()
    conn = get_db()
    now = datetime.now()
    mes = now.month
    ano = now.year
    is_gestor = user['perfil'] in ('gerente', 'diretor')

    mes_str = f'{mes:02d}'
    ano_str = str(ano)
    mes_ant = mes - 1 if mes > 1 else 12
    ano_ant = ano if mes > 1 else ano - 1
    mes_ant_str = f'{mes_ant:02d}'
    ano_ant_str = str(ano_ant)

    # Same month last year
    mes_aa_str = mes_str
    ano_aa_str = str(ano - 1)

    # === 1. COMPARATIVO POR VENDEDOR ===
    vendedores = []
    if is_gestor:
        vend_rows = conn.execute("""
            SELECT u.id, u.nome,
                COALESCE(SUM(i.valor_total), 0) as total_vendas,
                COUNT(DISTINCT ov.id) as qtd_ovs,
                COUNT(DISTINCT ov.cadastro_id) as clientes_unicos,
                COALESCE(SUM(i.comissao_valor), 0) as comissao
            FROM users u
            LEFT JOIN ordens_venda ov ON ov.vendedor_id = u.id
                AND strftime('%m', ov.data_emissao) = ? AND strftime('%Y', ov.data_emissao) = ?
                AND ov.status != 'Cancelada'
            LEFT JOIN ov_items i ON i.ov_id = ov.id
            WHERE u.ativo = 1 AND u.perfil IN ('vendedor','gerente','diretor')
            GROUP BY u.id ORDER BY total_vendas DESC
        """, (mes_str, ano_str)).fetchall()

        for v in vend_rows:
            # Mes anterior para este vendedor
            ant = conn.execute("""
                SELECT COALESCE(SUM(i.valor_total), 0) as total
                FROM ov_items i JOIN ordens_venda ov ON i.ov_id = ov.id
                WHERE ov.vendedor_id = ? AND strftime('%m', ov.data_emissao) = ? AND strftime('%Y', ov.data_emissao) = ?
                AND ov.status != 'Cancelada'
            """, (v['id'], mes_ant_str, ano_ant_str)).fetchone()['total']

            ticket = v['total_vendas'] / v['qtd_ovs'] if v['qtd_ovs'] > 0 else 0
            var_pct = round((v['total_vendas'] - ant) / ant * 100, 1) if ant > 0 else (100.0 if v['total_vendas'] > 0 else 0)

            vendedores.append({
                'id': v['id'], 'nome': v['nome'],
                'vendas': v['total_vendas'], 'vendas_anterior': ant,
                'variacao': var_pct, 'qtd_ovs': v['qtd_ovs'],
                'clientes_unicos': v['clientes_unicos'],
                'ticket_medio': ticket, 'comissao': v['comissao']
            })

    # === 2. COMPARATIVO POR CATEGORIA (Vendido vs Comprado) ===
    cat_vendas = conn.execute("""
        SELECT i.categoria, COALESCE(SUM(i.valor_total), 0) as vendido,
            COALESCE(SUM(i.peso_total), 0) as peso_vendido, COUNT(*) as qtd_vendida
        FROM ov_items i JOIN ordens_venda ov ON i.ov_id = ov.id
        WHERE strftime('%m', ov.data_emissao) = ? AND strftime('%Y', ov.data_emissao) = ?
        AND ov.status != 'Cancelada'
        GROUP BY i.categoria
    """, (mes_str, ano_str)).fetchall()

    cat_compras = conn.execute("""
        SELECT i.categoria, COALESCE(SUM(i.valor_total), 0) as comprado,
            COALESCE(SUM(i.peso_total), 0) as peso_comprado, COUNT(*) as qtd_comprada
        FROM oc_items i JOIN ordens_compra oc ON i.oc_id = oc.id
        WHERE strftime('%m', oc.data_emissao) = ? AND strftime('%Y', oc.data_emissao) = ?
        AND oc.status != 'Cancelada'
        GROUP BY i.categoria
    """, (mes_str, ano_str)).fetchall()

    # Merge vendas e compras por categoria
    cat_dict = {}
    for r in cat_vendas:
        cat_dict[r['categoria']] = {
            'categoria': r['categoria'], 'vendido': r['vendido'],
            'peso_vendido': r['peso_vendido'], 'qtd_vendida': r['qtd_vendida'],
            'comprado': 0, 'peso_comprado': 0, 'qtd_comprada': 0
        }
    for r in cat_compras:
        if r['categoria'] in cat_dict:
            cat_dict[r['categoria']]['comprado'] = r['comprado']
            cat_dict[r['categoria']]['peso_comprado'] = r['peso_comprado']
            cat_dict[r['categoria']]['qtd_comprada'] = r['qtd_comprada']
        else:
            cat_dict[r['categoria']] = {
                'categoria': r['categoria'], 'vendido': 0, 'peso_vendido': 0, 'qtd_vendida': 0,
                'comprado': r['comprado'], 'peso_comprado': r['peso_comprado'], 'qtd_comprada': r['qtd_comprada']
            }

    # Add saldo (vendido - comprado) and sort by total movement
    categorias = []
    for cat, d in cat_dict.items():
        d['saldo'] = d['vendido'] - d['comprado']
        d['total_mov'] = d['vendido'] + d['comprado']
        # Preco medio por kg
        d['preco_kg_venda'] = d['vendido'] / d['peso_vendido'] if d['peso_vendido'] > 0 else 0
        d['preco_kg_compra'] = d['comprado'] / d['peso_comprado'] if d['peso_comprado'] > 0 else 0
        categorias.append(d)
    categorias.sort(key=lambda x: x['total_mov'], reverse=True)

    # === 3. COMPARATIVO PERIODOS ===
    def get_period_kpis(m_str, a_str):
        r = conn.execute("""
            SELECT COALESCE(SUM(i.valor_total), 0) as vendas, COUNT(DISTINCT ov.id) as ovs,
                COUNT(DISTINCT ov.cadastro_id) as clientes
            FROM ov_items i JOIN ordens_venda ov ON i.ov_id = ov.id
            WHERE strftime('%m', ov.data_emissao) = ? AND strftime('%Y', ov.data_emissao) = ?
            AND ov.status != 'Cancelada'
        """, (m_str, a_str)).fetchone()
        c = conn.execute("""
            SELECT COALESCE(SUM(i.valor_total), 0) as compras, COUNT(DISTINCT oc.id) as ocs
            FROM oc_items i JOIN ordens_compra oc ON i.oc_id = oc.id
            WHERE strftime('%m', oc.data_emissao) = ? AND strftime('%Y', oc.data_emissao) = ?
            AND oc.status != 'Cancelada'
        """, (m_str, a_str)).fetchone()
        ticket = r['vendas'] / r['ovs'] if r['ovs'] > 0 else 0
        return {
            'vendas': r['vendas'], 'compras': c['compras'],
            'saldo': r['vendas'] - c['compras'],
            'ovs': r['ovs'], 'ocs': c['ocs'],
            'clientes': r['clientes'], 'ticket_medio': ticket
        }

    meses_nome = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    periodos = {
        'atual': {**get_period_kpis(mes_str, ano_str), 'label': f'{meses_nome[mes]}/{ano}'},
        'anterior': {**get_period_kpis(mes_ant_str, ano_ant_str), 'label': f'{meses_nome[mes_ant]}/{ano_ant}'},
        'mesmo_aa': {**get_period_kpis(mes_aa_str, ano_aa_str), 'label': f'{meses_nome[mes]}/{ano-1}'},
    }

    conn.close()
    return jsonify({
        'vendedores': vendedores,
        'categorias': categorias,
        'periodos': periodos,
        'mes': mes, 'ano': ano, 'is_gestor': is_gestor
    })


@app.route('/api/dashboard/filtros')
@login_required
def dashboard_filtros():
    """Return available filter options for dashboard"""
    user = get_current_user()
    conn = get_db()
    ano = str(datetime.now().year)

    # Available categories (from this year's data)
    cats_v = conn.execute("""
        SELECT DISTINCT i.categoria FROM ov_items i JOIN ordens_venda ov ON i.ov_id=ov.id
        WHERE strftime('%Y', ov.data_emissao)=? AND ov.status!='Cancelada' AND i.categoria IS NOT NULL
        ORDER BY i.categoria
    """, [ano]).fetchall()
    cats_c = conn.execute("""
        SELECT DISTINCT i.categoria FROM oc_items i JOIN ordens_compra oc ON i.oc_id=oc.id
        WHERE strftime('%Y', oc.data_emissao)=? AND oc.status!='Cancelada' AND i.categoria IS NOT NULL
        ORDER BY i.categoria
    """, [ano]).fetchall()
    categorias = sorted(set(r['categoria'] for r in cats_v + cats_c))

    # Available vendedores (gestor only)
    vendedores = []
    if user['perfil'] in ('gerente', 'diretor'):
        vends = conn.execute("""
            SELECT DISTINCT u.id, u.nome FROM users u
            WHERE u.ativo=1 AND u.perfil IN ('vendedor','gerente','diretor')
            ORDER BY u.nome
        """).fetchall()
        vendedores = [{'id': r['id'], 'nome': r['nome']} for r in vends]

    # Available client segments
    segs = conn.execute("""
        SELECT DISTINCT segmento FROM cadastros WHERE segmento IS NOT NULL AND segmento != '' ORDER BY segmento
    """).fetchall()
    segmentos = [r['segmento'] for r in segs]

    conn.close()
    return jsonify({'categorias': categorias, 'vendedores': vendedores, 'segmentos': segmentos})


# ============ PIPELINE COMERCIAL ============

@app.route('/api/pipeline')
@permission_required('ver_pipeline')
def pipeline_comercial():
    conn = get_db()
    hoje = datetime.now().strftime('%Y-%m-%d')
    inicio_semana = (datetime.now() - timedelta(days=datetime.now().weekday())).strftime('%Y-%m-%d')
    fim_semana = (datetime.now() + timedelta(days=6-datetime.now().weekday())).strftime('%Y-%m-%d')
    mes_atual = datetime.now().strftime('%Y-%m')

    # ===== PROPOSTAS CRIADAS (potencial) =====
    def get_propostas_periodo(where_date, params):
        rows = conn.execute(f"""
            SELECT p.id, p.numero, p.status, p.tipo, p.vendedor_id,
                   c.razao_social, u.nome as vendedor_nome,
                   date(p.created_at) as data_criacao,
                   COALESCE((SELECT SUM(valor_total) FROM proposta_items WHERE proposta_id=p.id), 0) as valor
            FROM propostas p
            LEFT JOIN cadastros c ON c.id = p.cadastro_id
            LEFT JOIN users u ON u.id = p.vendedor_id
            WHERE p.tipo='VENDA' AND {where_date}
            ORDER BY p.created_at DESC
        """, params).fetchall()
        items = [dict(r) for r in rows]
        total = sum(r['valor'] for r in items)
        abertas = [r for r in items if r['status'] not in ('Convertida','Perdida','Expirada','Cancelada')]
        convertidas = [r for r in items if r['status'] == 'Convertida']
        return {
            'items': items,
            'total': total,
            'count': len(items),
            'total_abertas': sum(r['valor'] for r in abertas),
            'count_abertas': len(abertas),
            'total_convertidas': sum(r['valor'] for r in convertidas),
            'count_convertidas': len(convertidas),
            'total_perdidas': sum(r['valor'] for r in items if r['status'] in ('Perdida','Expirada')),
            'count_perdidas': len([r for r in items if r['status'] in ('Perdida','Expirada')])
        }

    hoje_data = get_propostas_periodo("date(p.created_at) = ?", (hoje,))
    semana_data = get_propostas_periodo("date(p.created_at) BETWEEN ? AND ?", (inicio_semana, fim_semana))
    mes_data = get_propostas_periodo("strftime('%Y-%m', p.created_at) = ?", (mes_atual,))

    # ===== FATURAMENTO REAL (OVs convertidas) =====
    def get_faturamento(where_date, params):
        r = conn.execute(f"""
            SELECT COALESCE(SUM(i.valor_total),0) as total, COUNT(DISTINCT ov.id) as count
            FROM ordens_venda ov
            JOIN ov_items i ON i.ov_id=ov.id
            WHERE ov.status != 'Cancelada' AND {where_date}
        """, params).fetchone()
        return {'total': r['total'], 'count': r['count']}

    fat_hoje = get_faturamento("date(ov.data_emissao) = ?", (hoje,))
    fat_semana = get_faturamento("date(ov.data_emissao) BETWEEN ? AND ?", (inicio_semana, fim_semana))
    fat_mes = get_faturamento("strftime('%Y-%m', ov.data_emissao) = ?", (mes_atual,))

    # ===== POR VENDEDOR (mês) =====
    vendedores = conn.execute("""
        SELECT u.id, u.nome,
               COUNT(DISTINCT p.id) as propostas_criadas,
               COALESCE(SUM(CASE WHEN p.status='Convertida' THEN (SELECT SUM(valor_total) FROM proposta_items WHERE proposta_id=p.id) END), 0) as valor_convertido,
               COALESCE(SUM((SELECT SUM(valor_total) FROM proposta_items WHERE proposta_id=p.id)), 0) as valor_total_propostas,
               COUNT(DISTINCT CASE WHEN p.status='Convertida' THEN p.id END) as propostas_convertidas
        FROM users u
        LEFT JOIN propostas p ON p.vendedor_id=u.id AND p.tipo='VENDA' AND strftime('%Y-%m', p.created_at) = ?
        WHERE u.perfil IN ('vendedor','gestor','gerente','diretor') AND u.ativo=1
        GROUP BY u.id
        ORDER BY valor_convertido DESC
    """, (mes_atual,)).fetchall()

    # ===== PROPOSTAS ABERTAS (pipeline ativo) =====
    abertas = conn.execute("""
        SELECT p.id, p.numero, p.status, c.razao_social, u.nome as vendedor_nome,
               date(p.created_at) as data_criacao,
               COALESCE((SELECT SUM(valor_total) FROM proposta_items WHERE proposta_id=p.id), 0) as valor
        FROM propostas p
        LEFT JOIN cadastros c ON c.id = p.cadastro_id
        LEFT JOIN users u ON u.id = p.vendedor_id
        WHERE p.tipo='VENDA' AND p.status IN ('Rascunho','Enviada','Em Negociação','Aprovada')
        ORDER BY valor DESC
    """).fetchall()

    # ===== VISÃO COMERCIAL DE CRÉDITO (clientes) =====
    clientes_credito = conn.execute("""
        SELECT c.id, c.razao_social, c.limite_faturamento,
               COALESCE(SUM(CASE WHEN date(p.data_vencimento) >= ? THEN p.valor ELSE 0 END), 0) as credito_tomado,
               COALESCE(SUM(CASE WHEN date(p.data_vencimento) < ? THEN p.valor ELSE 0 END), 0) as credito_liberado,
               MAX(ov.data_emissao) as ultima_venda,
               MIN(CASE WHEN date(p.data_vencimento) >= ? THEN p.data_vencimento END) as proxima_liberacao,
               (SELECT COALESCE(SUM(valor_total),0) FROM ov_items WHERE ov_id IN (
                   SELECT id FROM ordens_venda WHERE cadastro_id=c.id AND status!='Cancelada'
                   AND strftime('%Y', data_emissao) = strftime('%Y', 'now')
               )) as total_ano
        FROM cadastros c
        JOIN ordens_venda ov ON ov.cadastro_id=c.id AND ov.status!='Cancelada'
        JOIN ov_parcelas p ON p.ov_id=ov.id
        GROUP BY c.id
        HAVING credito_tomado > 0 OR credito_liberado > 0
        ORDER BY credito_tomado DESC
    """, (hoje, hoje, hoje)).fetchall()

    clientes_list = []
    for cl in clientes_credito:
        cl = dict(cl)
        limite = cl['limite_faturamento'] or 0
        disponivel = (limite - cl['credito_tomado']) if limite > 0 else None
        cl['credito_disponivel'] = disponivel
        # Sugestão comercial
        if disponivel is not None and disponivel > 0:
            cl['status_comercial'] = 'disponivel'
        elif cl['proxima_liberacao']:
            cl['status_comercial'] = 'aguardar'
        else:
            cl['status_comercial'] = 'sem_limite'
        clientes_list.append(cl)

    # ===== FUNNEL DATA - propostas por status no mês =====
    mes_num = datetime.now().month
    ano_num = datetime.now().year
    funnel = conn.execute("""
        SELECT p.status,
            COUNT(*) as count,
            COALESCE(SUM((SELECT COALESCE(SUM(valor_total),0) FROM proposta_items WHERE proposta_id=p.id)), 0) as valor
        FROM propostas p
        WHERE p.tipo='VENDA'
            AND strftime('%m', p.data_emissao) = ?
            AND strftime('%Y', p.data_emissao) = ?
        GROUP BY p.status
        ORDER BY CASE p.status
            WHEN 'Rascunho' THEN 1
            WHEN 'Enviada' THEN 2
            WHEN 'Em Negociação' THEN 3
            WHEN 'Aprovada' THEN 4
            WHEN 'Convertida' THEN 5
            WHEN 'Perdida' THEN 6
            WHEN 'Expirada' THEN 7
        END
    """, (f'{mes_num:02d}', str(ano_num))).fetchall()

    conn.close()
    return jsonify({
        'hoje': hoje_data,
        'semana': semana_data,
        'mes': mes_data,
        'faturamento': {'hoje': fat_hoje, 'semana': fat_semana, 'mes': fat_mes},
        'vendedores': [dict(v) for v in vendedores],
        'abertas': [dict(a) for a in abertas],
        'total_pipeline': sum(a['valor'] for a in abertas),
        'clientes_credito': clientes_list,
        'funnel': [dict(r) for r in funnel]
    })


# ============ PREVISAO DE FATURAMENTO ============

@app.route('/api/dashboard/previsao')
@login_required
def dashboard_previsao():
    conn = get_db()
    hoje = datetime.now().strftime('%Y-%m-%d')
    # Monday of current week
    inicio_semana = (datetime.now() - timedelta(days=datetime.now().weekday())).strftime('%Y-%m-%d')
    fim_semana = (datetime.now() + timedelta(days=6-datetime.now().weekday())).strftime('%Y-%m-%d')

    # Propostas que podem virar faturamento HOJE (criadas hoje, status aberto)
    props_hoje = conn.execute("""
        SELECT p.id, p.numero, p.status, c.razao_social as cliente,
               COALESCE((SELECT SUM(valor_total) FROM proposta_items WHERE proposta_id=p.id), 0) as valor
        FROM propostas p
        LEFT JOIN cadastros c ON c.id = p.cadastro_id
        WHERE p.tipo='VENDA' AND p.status IN ('Rascunho','Enviada','Em Negociação')
          AND date(p.created_at) = ?
        ORDER BY valor DESC
    """, (hoje,)).fetchall()

    # Propostas da semana
    props_semana = conn.execute("""
        SELECT p.id, p.numero, p.status, c.razao_social as cliente,
               COALESCE((SELECT SUM(valor_total) FROM proposta_items WHERE proposta_id=p.id), 0) as valor
        FROM propostas p
        LEFT JOIN cadastros c ON c.id = p.cadastro_id
        WHERE p.tipo='VENDA' AND p.status IN ('Rascunho','Enviada','Em Negociação')
          AND date(p.created_at) BETWEEN ? AND ?
        ORDER BY valor DESC
    """, (inicio_semana, fim_semana)).fetchall()

    # Pipeline total (todas propostas abertas)
    pipeline = conn.execute("""
        SELECT p.status, COUNT(*) as count,
               COALESCE(SUM((SELECT SUM(valor_total) FROM proposta_items WHERE proposta_id=p.id)), 0) as valor
        FROM propostas p
        WHERE p.tipo='VENDA' AND p.status IN ('Rascunho','Enviada','Em Negociação')
        GROUP BY p.status
    """).fetchall()

    conn.close()
    return jsonify({
        'hoje': [dict(r) for r in props_hoje],
        'semana': [dict(r) for r in props_semana],
        'pipeline': [dict(r) for r in pipeline],
        'total_hoje': sum(r['valor'] for r in props_hoje),
        'total_semana': sum(r['valor'] for r in props_semana),
        'total_pipeline': sum(r['valor'] for r in pipeline)
    })


# ============ IA INSIGHTS (SMART DATA QUERIES) ============

@app.route('/api/ia/insights', methods=['POST'])
@login_required
def ia_insights():
    data = request.json
    pergunta = (data.get('pergunta', '') or '').lower().strip()
    conn = get_db()
    user = get_current_user()
    now = datetime.now()
    mes_atual = now.strftime('%Y-%m')
    ano_atual = now.strftime('%Y')

    resposta = None

    # Vendedor só vê dados dele; gerente/diretor vê tudo
    is_vendedor = user['perfil'] == 'vendedor'
    vf_ov = "AND ov.vendedor_id=?" if is_vendedor else ""
    vf_p = "AND p.vendedor_id=?" if is_vendedor else ""
    vp = (user['id'],) if is_vendedor else ()

    # Pattern matching with real data queries
    if any(w in pergunta for w in ['faturei', 'faturamento', 'vendas', 'vendi']):
        if 'hoje' in pergunta:
            r = conn.execute(f"SELECT COALESCE(SUM(i.valor_total),0) as total, COUNT(DISTINCT ov.id) as qtd FROM ordens_venda ov JOIN ov_items i ON i.ov_id=ov.id WHERE date(ov.data_emissao)=date('now','localtime') AND ov.status!='Cancelada' {vf_ov}", vp).fetchone()
            resposta = f"Hoje você faturou R$ {r['total']:,.2f} em {r['qtd']} vendas."
        elif any(w in pergunta for w in ['mês', 'mes', 'mensal']):
            r = conn.execute(f"SELECT COALESCE(SUM(i.valor_total),0) as total, COUNT(DISTINCT ov.id) as qtd FROM ordens_venda ov JOIN ov_items i ON i.ov_id=ov.id WHERE strftime('%Y-%m', ov.data_emissao)=? AND ov.status!='Cancelada' {vf_ov}", (mes_atual,) + vp).fetchone()
            resposta = f"Este mês o faturamento é R$ {r['total']:,.2f} em {r['qtd']} vendas."
        elif any(w in pergunta for w in ['ano', 'anual']):
            r = conn.execute(f"SELECT COALESCE(SUM(i.valor_total),0) as total, COUNT(DISTINCT ov.id) as qtd FROM ordens_venda ov JOIN ov_items i ON i.ov_id=ov.id WHERE strftime('%Y', ov.data_emissao)=? AND ov.status!='Cancelada' {vf_ov}", (ano_atual,) + vp).fetchone()
            resposta = f"No ano de {ano_atual}, faturamento total de R$ {r['total']:,.2f} em {r['qtd']} vendas."
        else:
            r = conn.execute(f"SELECT COALESCE(SUM(i.valor_total),0) as total, COUNT(DISTINCT ov.id) as qtd FROM ordens_venda ov JOIN ov_items i ON i.ov_id=ov.id WHERE strftime('%Y-%m', ov.data_emissao)=? AND ov.status!='Cancelada' {vf_ov}", (mes_atual,) + vp).fetchone()
            resposta = f"Faturamento do mês atual: R$ {r['total']:,.2f} ({r['qtd']} vendas)."

    elif any(w in pergunta for w in ['cliente', 'clientes']):
        if any(w in pergunta for w in ['não compra', 'nao compra', 'inativo', 'parado', 'sem compra']):
            rows = conn.execute(f"""
                SELECT c.razao_social, MAX(ov.data_emissao) as ultima
                FROM cadastros c
                LEFT JOIN ordens_venda ov ON ov.cadastro_id=c.id AND ov.status!='Cancelada' {vf_ov}
                WHERE c.status='Ativo'
                GROUP BY c.id HAVING ultima IS NOT NULL AND ultima < date('now','-30 days','localtime')
                ORDER BY ultima LIMIT 5
            """, vp).fetchall()
            if rows:
                lista = ', '.join(f"{r['razao_social']} (última: {r['ultima']})" for r in rows)
                resposta = f"Clientes sem compra há mais de 30 dias: {lista}"
            else:
                resposta = "Todos os clientes ativos compraram nos últimos 30 dias!"
        elif any(w in pergunta for w in ['quantos', 'total']):
            r = conn.execute("SELECT COUNT(*) as c FROM cadastros WHERE status='Ativo'").fetchone()
            resposta = f"Você tem {r['c']} clientes ativos cadastrados."
        else:
            r = conn.execute("SELECT COUNT(*) as c FROM cadastros WHERE status='Ativo'").fetchone()
            resposta = f"Há {r['c']} clientes ativos. Pergunte 'clientes que não compram há 30 dias' para ver inativos."

    elif any(w in pergunta for w in ['produto', 'categoria', 'mais vend']):
        rows = conn.execute(f"""
            SELECT i.categoria, SUM(i.valor_total) as total, COUNT(*) as qtd
            FROM ov_items i JOIN ordens_venda ov ON ov.id=i.ov_id
            WHERE strftime('%Y-%m', ov.data_emissao)=? AND ov.status!='Cancelada' {vf_ov}
            GROUP BY i.categoria ORDER BY total DESC LIMIT 5
        """, (mes_atual,) + vp).fetchall()
        if rows:
            lista = ', '.join(f"{r['categoria']}: R$ {r['total']:,.2f} ({r['qtd']}x)" for r in rows)
            resposta = f"Top produtos do mês: {lista}"
        else:
            resposta = "Nenhuma venda registrada este mês."

    elif any(w in pergunta for w in ['proposta', 'pipeline', 'aberta']):
        rows = conn.execute(f"""
            SELECT p.status, COUNT(*) as qtd,
                   COALESCE(SUM((SELECT SUM(valor_total) FROM proposta_items WHERE proposta_id=p.id)),0) as valor
            FROM propostas p WHERE p.tipo='VENDA' AND p.status IN ('Rascunho','Enviada','Em Negociação') {vf_p}
            GROUP BY p.status
        """, vp).fetchall()
        if rows:
            lista = ', '.join(f"{r['status']}: {r['qtd']} (R$ {r['valor']:,.2f})" for r in rows)
            resposta = f"Pipeline de vendas: {lista}"
        else:
            resposta = "Não há propostas abertas no momento."

    elif any(w in pergunta for w in ['pipeline', 'proposta aberta', 'potencial']):
        r = conn.execute(f"""
            SELECT COUNT(*) as qtd, COALESCE(SUM((SELECT SUM(valor_total) FROM proposta_items WHERE proposta_id=p.id)),0) as total
            FROM propostas p WHERE p.tipo='VENDA' AND p.status IN ('Rascunho','Enviada','Em Negociação','Aprovada') {vf_p}
        """, vp).fetchone()
        resposta = f"Pipeline ativo: {r['qtd']} propostas abertas totalizando R$ {r['total']:,.2f}. Acesse o Pipeline Comercial para detalhes."

    elif any(w in pergunta for w in ['meta', 'atingi', 'quanto falta']):
        r_vendas = conn.execute(f"SELECT COALESCE(SUM(i.valor_total),0) as total FROM ordens_venda ov JOIN ov_items i ON i.ov_id=ov.id WHERE strftime('%Y-%m', ov.data_emissao)=? AND ov.status!='Cancelada' {vf_ov}", (mes_atual,) + vp).fetchone()
        meta = conn.execute("SELECT meta_mensal FROM metas WHERE user_id=? AND mes=?", (user['id'], mes_atual)).fetchone()
        if meta and meta['meta_mensal']:
            pct = (r_vendas['total'] / meta['meta_mensal'] * 100) if meta['meta_mensal'] > 0 else 0
            falta = max(0, meta['meta_mensal'] - r_vendas['total'])
            resposta = f"Sua meta mensal é R$ {meta['meta_mensal']:,.2f}. Você faturou R$ {r_vendas['total']:,.2f} ({pct:.1f}%). Faltam R$ {falta:,.2f}."
        else:
            resposta = f"Faturamento do mês: R$ {r_vendas['total']:,.2f}. Nenhuma meta definida para este mês."

    elif any(w in pergunta for w in ['comissão', 'comissao', 'ganho', 'ganhei']):
        r = conn.execute("""
            SELECT COALESCE(SUM(i.comissao_valor),0) as total
            FROM ov_items i JOIN ordens_venda ov ON ov.id=i.ov_id
            WHERE ov.vendedor_id=? AND strftime('%Y-%m', ov.data_emissao)=? AND ov.status!='Cancelada'
        """, (user['id'], mes_atual)).fetchone()
        resposta = f"Sua comissão estimada do mês: R$ {r['total']:,.2f}."

    conn.close()

    if not resposta:
        # Fallback to existing keyword matching (assistente endpoint logic)
        return _ia_ask_fallback(pergunta)

    return jsonify({'resposta': resposta})


def _ia_ask_fallback(pergunta):
    """Fallback keyword matching from the assistente knowledge base"""
    knowledge_base = [
        (['proposta', 'criar proposta', 'nova proposta', 'como criar'], 'Para criar uma proposta, clique em "+ Proposta" na tela de Vendas ou Compras. Preencha o CNPJ do cliente (será consultado automaticamente), adicione itens com categoria/quantidade/valor, e defina condições de pagamento.'),
        (['ov', 'ordem de venda', 'converter'], 'Para gerar uma OV, abra uma proposta aprovada e clique em "Converter em Venda". A OV será criada automaticamente com todos os dados da proposta, incluindo parcelas e comissões.'),
        (['oc', 'ordem de compra', 'compra'], 'Para compras, vá em Compras > + Proposta. O fluxo é similar ao de vendas. Após aprovação, converta em OC.'),
        (['pdf', 'gerar pdf', 'imprimir'], 'Na visualização de uma proposta, clique no botão "PDF" para gerar e baixar o documento.'),
        (['whatsapp', 'enviar whatsapp', 'mensagem'], 'Na tela da proposta, clique em "WhatsApp" para enviar automaticamente uma mensagem com resumo e PDF para o contato do cliente.'),
        (['icms', 'imposto', 'pis', 'tributo'], 'O ICMS é calculado automaticamente com base na UF de destino. PIS/COFINS é fixo em 9,25%.'),
        (['comissão', 'comissao', 'quanto ganho'], 'A comissão é calculada sobre o valor líquido (após impostos). Percentuais variam por categoria e perfil.'),
        (['follow-up', 'followup', 'lembrete'], 'Crie follow-ups em qualquer proposta ou cadastro. Eles aparecem no dashboard quando vencem.'),
        (['cadastro', 'cliente', 'fornecedor', 'cnpj'], 'Cadastros são unificados (cliente e fornecedor). Ao digitar um CNPJ, o sistema consulta a Receita Federal automaticamente.'),
        (['parcela', 'pagamento', 'condição', 'condicao'], 'Defina condições de pagamento na proposta. As parcelas são geradas automaticamente ao converter em OV.'),
        (['fechamento', 'fechar mês'], 'O Fechamento consolida comissões do mês. Disponível apenas para gestores em Gestão > Fechamento.'),
        (['meta', 'metas', 'objetivo'], 'Metas de venda são configuradas por gestores em Configurações > Metas.'),
        (['sugestão', 'sugestao', 'bug', 'melhoria'], 'Use o Assistente > aba Sugestões para reportar bugs, pedir melhorias ou tirar dúvidas.'),
    ]

    best_match = None
    best_score = 0
    for keywords, answer in knowledge_base:
        score = sum(1 for kw in keywords if kw in pergunta)
        if score > best_score:
            best_score = score
            best_match = answer

    if best_match:
        return jsonify({'resposta': best_match})
    else:
        return jsonify({'resposta': 'Não encontrei uma resposta específica para sua pergunta. Tente reformular ou pergunte sobre: faturamento, clientes, propostas, pipeline, metas, comissão.'})


# ============ ANALYTICS ============

@app.route('/api/analytics/<int:ano>')
@permission_required('ver_relatorios')
def analytics_anual(ano):
    conn = get_db()
    ano_str = str(ano)

    # Vendas por mes (OVs) - single query with GROUP BY instead of 12 queries
    vendas_por_mes = [0] * 12
    rows_v = conn.execute("""
        SELECT CAST(strftime('%m', ov.data_emissao) AS INTEGER) as mes, COALESCE(SUM(i.valor_total), 0) as total
        FROM ov_items i JOIN ordens_venda ov ON i.ov_id = ov.id
        WHERE strftime('%Y', ov.data_emissao) = ? AND ov.status != 'Cancelada'
        GROUP BY mes
    """, (ano_str,)).fetchall()
    for r in rows_v:
        vendas_por_mes[r['mes'] - 1] = r['total']

    # Compras por mes (OCs) - single query with GROUP BY instead of 12 queries
    compras_por_mes = [0] * 12
    rows_c = conn.execute("""
        SELECT CAST(strftime('%m', oc.data_emissao) AS INTEGER) as mes, COALESCE(SUM(i.valor_total), 0) as total
        FROM oc_items i JOIN ordens_compra oc ON i.oc_id = oc.id
        WHERE strftime('%Y', oc.data_emissao) = ? AND oc.status != 'Cancelada'
        GROUP BY mes
    """, (ano_str,)).fetchall()
    for r in rows_c:
        compras_por_mes[r['mes'] - 1] = r['total']

    # Vendas por categoria
    cat_rows = conn.execute("""
        SELECT i.categoria, COALESCE(SUM(i.valor_total), 0) as total
        FROM ov_items i JOIN ordens_venda ov ON i.ov_id = ov.id
        WHERE strftime('%Y', ov.data_emissao) = ? AND ov.status != 'Cancelada'
        GROUP BY i.categoria ORDER BY total DESC
    """, (ano_str,)).fetchall()
    vendas_por_categoria = {r['categoria']: r['total'] for r in cat_rows}

    # Vendas por vendedor
    vend_rows = conn.execute("""
        SELECT u.nome, COALESCE(SUM(i.valor_total), 0) as total
        FROM ov_items i JOIN ordens_venda ov ON i.ov_id = ov.id
        JOIN users u ON ov.vendedor_id = u.id
        WHERE strftime('%Y', ov.data_emissao) = ? AND ov.status != 'Cancelada'
        GROUP BY u.nome ORDER BY total DESC
    """, (ano_str,)).fetchall()
    vendas_por_vendedor = {r['nome']: r['total'] for r in vend_rows}

    # Top 10 clientes
    top_cli = conn.execute("""
        SELECT c.razao_social as nome, COALESCE(SUM(i.valor_total), 0) as total, COUNT(DISTINCT ov.id) as count
        FROM ov_items i JOIN ordens_venda ov ON i.ov_id = ov.id
        JOIN cadastros c ON ov.cadastro_id = c.id
        WHERE strftime('%Y', ov.data_emissao) = ? AND ov.status != 'Cancelada'
        GROUP BY c.id ORDER BY total DESC LIMIT 10
    """, (ano_str,)).fetchall()
    top_clientes = [{'nome': r['nome'], 'razao_social': r['nome'], 'total': r['total'], 'total_valor': r['total'], 'count': r['count'], 'total_ovs': r['count']} for r in top_cli]

    # Top 10 fornecedores
    top_forn = conn.execute("""
        SELECT c.razao_social as nome, COALESCE(SUM(i.valor_total), 0) as total, COUNT(DISTINCT oc.id) as count
        FROM oc_items i JOIN ordens_compra oc ON i.oc_id = oc.id
        JOIN cadastros c ON oc.cadastro_id = c.id
        WHERE strftime('%Y', oc.data_emissao) = ? AND oc.status != 'Cancelada'
        GROUP BY c.id ORDER BY total DESC LIMIT 10
    """, (ano_str,)).fetchall()
    top_fornecedores = [{'nome': r['nome'], 'razao_social': r['nome'], 'total': r['total'], 'total_valor': r['total'], 'count': r['count'], 'total_ocs': r['count']} for r in top_forn]

    # Ticket medio
    ticket_row = conn.execute("""
        SELECT COALESCE(AVG(ov_total), 0) as ticket_medio FROM (
            SELECT ov.id, COALESCE(SUM(i.valor_total), 0) as ov_total
            FROM ordens_venda ov LEFT JOIN ov_items i ON i.ov_id = ov.id
            WHERE strftime('%Y', ov.data_emissao) = ? AND ov.status != 'Cancelada'
            GROUP BY ov.id
        )
    """, (ano_str,)).fetchone()
    ticket_medio = ticket_row['ticket_medio']

    # Taxa de conversao
    total_props = conn.execute(
        "SELECT COUNT(*) as c FROM propostas WHERE strftime('%Y', data_emissao) = ? AND tipo='VENDA'",
        (ano_str,)).fetchone()['c']
    aprovadas = conn.execute(
        "SELECT COUNT(*) as c FROM propostas WHERE strftime('%Y', data_emissao) = ? AND tipo='VENDA' AND status IN ('Aprovada','Convertida')",
        (ano_str,)).fetchone()['c']
    taxa_conversao = (aprovadas / total_props * 100) if total_props > 0 else 0

    conn.close()
    return jsonify({
        'vendas_por_mes': vendas_por_mes,
        'compras_por_mes': compras_por_mes,
        'vendas_por_categoria': vendas_por_categoria,
        'vendas_por_vendedor': vendas_por_vendedor,
        'top_clientes': top_clientes,
        'top_fornecedores': top_fornecedores,
        'ticket_medio': ticket_medio,
        'taxa_conversao': round(taxa_conversao, 1)
    })


# ============ QUARTERLY REPORT ============

@app.route('/api/analytics/trimestre/<int:ano>/<int:trimestre>')
@permission_required('ver_relatorios')
def analytics_trimestral(ano, trimestre):
    if trimestre < 1 or trimestre > 4:
        return jsonify({'error': 'Trimestre deve ser 1-4'}), 400

    conn = get_db()
    ano_str = str(ano)
    meses_trimestre = [(trimestre - 1) * 3 + i for i in range(1, 4)]
    meses_strs = [f'{m:02d}' for m in meses_trimestre]

    # Helper to build month IN clause for strftime
    month_placeholders = ','.join(['?' for _ in meses_strs])

    # Vendas por mes do trimestre
    vendas_por_mes = []
    for m in meses_trimestre:
        mes_str = f'{m:02d}'
        row = conn.execute("""
            SELECT COALESCE(SUM(i.valor_total), 0) as total
            FROM ov_items i JOIN ordens_venda ov ON i.ov_id = ov.id
            WHERE strftime('%Y', ov.data_emissao) = ? AND strftime('%m', ov.data_emissao) = ?
            AND ov.status != 'Cancelada'
        """, (ano_str, mes_str)).fetchone()
        vendas_por_mes.append({'mes': m, 'total': row['total']})

    # Compras por mes do trimestre
    compras_por_mes = []
    for m in meses_trimestre:
        mes_str = f'{m:02d}'
        row = conn.execute("""
            SELECT COALESCE(SUM(i.valor_total), 0) as total
            FROM oc_items i JOIN ordens_compra oc ON i.oc_id = oc.id
            WHERE strftime('%Y', oc.data_emissao) = ? AND strftime('%m', oc.data_emissao) = ?
            AND oc.status != 'Cancelada'
        """, (ano_str, mes_str)).fetchone()
        compras_por_mes.append({'mes': m, 'total': row['total']})

    # Vendas por categoria no trimestre
    cat_rows = conn.execute(f"""
        SELECT i.categoria, COALESCE(SUM(i.valor_total), 0) as total
        FROM ov_items i JOIN ordens_venda ov ON i.ov_id = ov.id
        WHERE strftime('%Y', ov.data_emissao) = ? AND strftime('%m', ov.data_emissao) IN ({month_placeholders})
        AND ov.status != 'Cancelada'
        GROUP BY i.categoria ORDER BY total DESC
    """, [ano_str] + meses_strs).fetchall()
    vendas_por_categoria = {r['categoria']: r['total'] for r in cat_rows}

    # Vendas por vendedor no trimestre
    vend_rows = conn.execute(f"""
        SELECT u.nome, COALESCE(SUM(i.valor_total), 0) as total
        FROM ov_items i JOIN ordens_venda ov ON i.ov_id = ov.id
        JOIN users u ON ov.vendedor_id = u.id
        WHERE strftime('%Y', ov.data_emissao) = ? AND strftime('%m', ov.data_emissao) IN ({month_placeholders})
        AND ov.status != 'Cancelada'
        GROUP BY u.nome ORDER BY total DESC
    """, [ano_str] + meses_strs).fetchall()
    vendas_por_vendedor = {r['nome']: r['total'] for r in vend_rows}

    # Top clientes do trimestre
    top_cli = conn.execute(f"""
        SELECT c.razao_social as nome, COALESCE(SUM(i.valor_total), 0) as total, COUNT(DISTINCT ov.id) as count
        FROM ov_items i JOIN ordens_venda ov ON i.ov_id = ov.id
        JOIN cadastros c ON ov.cadastro_id = c.id
        WHERE strftime('%Y', ov.data_emissao) = ? AND strftime('%m', ov.data_emissao) IN ({month_placeholders})
        AND ov.status != 'Cancelada'
        GROUP BY c.id ORDER BY total DESC LIMIT 10
    """, [ano_str] + meses_strs).fetchall()
    top_clientes = [{'nome': r['nome'], 'razao_social': r['nome'], 'total': r['total'], 'total_valor': r['total'], 'count': r['count'], 'total_ovs': r['count']} for r in top_cli]

    # Top fornecedores do trimestre
    top_forn = conn.execute(f"""
        SELECT c.razao_social as nome, COALESCE(SUM(i.valor_total), 0) as total, COUNT(DISTINCT oc.id) as count
        FROM oc_items i JOIN ordens_compra oc ON i.oc_id = oc.id
        JOIN cadastros c ON oc.cadastro_id = c.id
        WHERE strftime('%Y', oc.data_emissao) = ? AND strftime('%m', oc.data_emissao) IN ({month_placeholders})
        AND oc.status != 'Cancelada'
        GROUP BY c.id ORDER BY total DESC LIMIT 10
    """, [ano_str] + meses_strs).fetchall()
    top_fornecedores = [{'nome': r['nome'], 'razao_social': r['nome'], 'total': r['total'], 'total_valor': r['total'], 'count': r['count'], 'total_ocs': r['count']} for r in top_forn]

    # Ticket medio do trimestre
    ticket_row = conn.execute(f"""
        SELECT COALESCE(AVG(ov_total), 0) as ticket_medio FROM (
            SELECT ov.id, COALESCE(SUM(i.valor_total), 0) as ov_total
            FROM ordens_venda ov LEFT JOIN ov_items i ON i.ov_id = ov.id
            WHERE strftime('%Y', ov.data_emissao) = ? AND strftime('%m', ov.data_emissao) IN ({month_placeholders})
            AND ov.status != 'Cancelada'
            GROUP BY ov.id
        )
    """, [ano_str] + meses_strs).fetchone()
    ticket_medio = ticket_row['ticket_medio']

    # Taxa de conversao do trimestre
    total_props = conn.execute(f"""
        SELECT COUNT(*) as c FROM propostas
        WHERE strftime('%Y', data_emissao) = ? AND strftime('%m', data_emissao) IN ({month_placeholders})
        AND tipo='VENDA'
    """, [ano_str] + meses_strs).fetchone()['c']
    aprovadas = conn.execute(f"""
        SELECT COUNT(*) as c FROM propostas
        WHERE strftime('%Y', data_emissao) = ? AND strftime('%m', data_emissao) IN ({month_placeholders})
        AND tipo='VENDA' AND status IN ('Aprovada','Convertida')
    """, [ano_str] + meses_strs).fetchone()['c']
    taxa_conversao = (aprovadas / total_props * 100) if total_props > 0 else 0

    # Total do trimestre atual
    total_vendas_trimestre = sum(v['total'] for v in vendas_por_mes)
    total_compras_trimestre = sum(c['total'] for c in compras_por_mes)

    # Comparativo com trimestre anterior
    if trimestre > 1:
        prev_ano = ano
        prev_tri = trimestre - 1
    else:
        prev_ano = ano - 1
        prev_tri = 4
    prev_meses = [(prev_tri - 1) * 3 + i for i in range(1, 4)]
    prev_meses_strs = [f'{m:02d}' for m in prev_meses]
    prev_ano_str = str(prev_ano)
    prev_placeholders = ','.join(['?' for _ in prev_meses_strs])

    prev_vendas = conn.execute(f"""
        SELECT COALESCE(SUM(i.valor_total), 0) as total
        FROM ov_items i JOIN ordens_venda ov ON i.ov_id = ov.id
        WHERE strftime('%Y', ov.data_emissao) = ? AND strftime('%m', ov.data_emissao) IN ({prev_placeholders})
        AND ov.status != 'Cancelada'
    """, [prev_ano_str] + prev_meses_strs).fetchone()['total']

    prev_compras = conn.execute(f"""
        SELECT COALESCE(SUM(i.valor_total), 0) as total
        FROM oc_items i JOIN ordens_compra oc ON i.oc_id = oc.id
        WHERE strftime('%Y', oc.data_emissao) = ? AND strftime('%m', oc.data_emissao) IN ({prev_placeholders})
        AND oc.status != 'Cancelada'
    """, [prev_ano_str] + prev_meses_strs).fetchone()['total']

    comparativo_anterior = {
        'trimestre_anterior': f'Q{prev_tri}/{prev_ano}',
        'vendas_anterior': prev_vendas,
        'vendas_atual': total_vendas_trimestre,
        'vendas_variacao': ((total_vendas_trimestre - prev_vendas) / prev_vendas * 100) if prev_vendas > 0 else 0,
        'compras_anterior': prev_compras,
        'compras_atual': total_compras_trimestre,
        'compras_variacao': ((total_compras_trimestre - prev_compras) / prev_compras * 100) if prev_compras > 0 else 0,
    }

    conn.close()
    return jsonify({
        'trimestre': trimestre,
        'ano': ano,
        'vendas_por_mes': vendas_por_mes,
        'compras_por_mes': compras_por_mes,
        'vendas_por_categoria': vendas_por_categoria,
        'vendas_por_vendedor': vendas_por_vendedor,
        'top_clientes': top_clientes,
        'top_fornecedores': top_fornecedores,
        'ticket_medio': ticket_medio,
        'taxa_conversao': round(taxa_conversao, 1),
        'comparativo_anterior': comparativo_anterior
    })


# ============ CRM INTELLIGENCE ============

@app.route('/api/crm/alertas')
@login_required
def crm_alertas():
    user = get_current_user()
    conn = get_db()
    hoje = datetime.now().strftime('%Y-%m-%d')

    # Vendedor só vê alertas dos seus clientes
    vf = "AND ov.vendedor_id=?" if user['perfil'] == 'vendedor' else ""
    vp = (user['id'],) if user['perfil'] == 'vendedor' else ()

    # === RECOMPRA: clients whose avg purchase frequency has passed ===
    # Get all clients with 2+ OVs to calculate frequency
    clientes_ovs = conn.execute(f"""
        SELECT ov.cadastro_id, c.razao_social as nome, ov.data_emissao
        FROM ordens_venda ov JOIN cadastros c ON ov.cadastro_id = c.id
        WHERE ov.status != 'Cancelada' {vf}
        ORDER BY ov.cadastro_id, ov.data_emissao
    """, vp).fetchall()

    recompra_alertas = []
    compras_por_cliente = defaultdict(list)
    for row in clientes_ovs:
        compras_por_cliente[row['cadastro_id']].append({
            'nome': row['nome'],
            'data': row['data_emissao']
        })

    for cadastro_id, compras in compras_por_cliente.items():
        if len(compras) < 2:
            continue
        # Calculate average frequency in days
        datas = sorted([datetime.strptime(c['data'][:10], '%Y-%m-%d') for c in compras])
        intervalos = [(datas[i+1] - datas[i]).days for i in range(len(datas)-1)]
        avg_freq = sum(intervalos) / len(intervalos)
        if avg_freq < 1:
            continue
        last_purchase = datas[-1]
        days_since = (datetime.now() - last_purchase).days
        if days_since > avg_freq:
            # Get last items purchased
            last_items = conn.execute("""
                SELECT i.categoria, i.descricao_complementar
                FROM ov_items i JOIN ordens_venda ov ON i.ov_id = ov.id
                WHERE ov.cadastro_id = ? AND ov.status != 'Cancelada'
                ORDER BY ov.data_emissao DESC LIMIT 3
            """, (cadastro_id,)).fetchall()
            ultimo_comprado = [r['categoria'] + (f' - {r["descricao_complementar"]}' if r['descricao_complementar'] else '') for r in last_items]

            recompra_alertas.append({
                'cadastro_id': cadastro_id,
                'nome': compras[0]['nome'],
                'ultima_compra': last_purchase.strftime('%Y-%m-%d'),
                'frequencia_media_dias': round(avg_freq),
                'dias_desde_ultima': days_since,
                'atraso_dias': days_since - round(avg_freq),
                'ultimo_comprado': ultimo_comprado
            })

    recompra_alertas.sort(key=lambda x: x['atraso_dias'], reverse=True)

    # === INATIVOS: clients with no purchase in 90+ days who had previous purchases ===
    inativos = conn.execute(f"""
        SELECT c.id as cadastro_id, c.razao_social as nome,
            MAX(ov.data_emissao) as ultima_compra,
            COUNT(ov.id) as total_ovs,
            COALESCE(SUM(i_total.total), 0) as valor_historico
        FROM cadastros c
        JOIN ordens_venda ov ON ov.cadastro_id = c.id AND ov.status != 'Cancelada' {vf}
        LEFT JOIN (
            SELECT ov_id, SUM(valor_total) as total FROM ov_items GROUP BY ov_id
        ) i_total ON i_total.ov_id = ov.id
        GROUP BY c.id
        HAVING julianday(?) - julianday(MAX(ov.data_emissao)) > 90
        ORDER BY ultima_compra ASC
    """, vp + (hoje,)).fetchall()
    inativos_list = [{
        'cadastro_id': r['cadastro_id'],
        'nome': r['nome'],
        'ultima_compra': r['ultima_compra'],
        'dias_inativo': int((datetime.now() - datetime.strptime(r['ultima_compra'][:10], '%Y-%m-%d')).days),
        'total_ovs': r['total_ovs'],
        'valor_historico': r['valor_historico']
    } for r in inativos]

    # === VENCIMENTOS PROXIMOS: parcelas vencendo nos proximos 7 dias ===
    data_limite = (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')
    vencimentos = conn.execute(f"""
        SELECT p.id as parcela_id, p.valor, p.data_vencimento, p.numero_parcela, p.total_parcelas,
            ov.numero as ov_numero, c.razao_social as cliente_nome
        FROM ov_parcelas p
        JOIN ordens_venda ov ON p.ov_id = ov.id
        JOIN cadastros c ON ov.cadastro_id = c.id
        WHERE p.status = 'Pendente' AND date(p.data_vencimento) BETWEEN date(?) AND date(?) {vf}
        ORDER BY p.data_vencimento ASC
    """, (hoje, data_limite) + vp).fetchall()
    vencimentos_list = [{
        'parcela_id': r['parcela_id'],
        'valor': r['valor'],
        'data_vencimento': r['data_vencimento'],
        'parcela': f"{r['numero_parcela']}/{r['total_parcelas']}",
        'ov_numero': r['ov_numero'],
        'cliente_nome': r['cliente_nome']
    } for r in vencimentos]

    conn.close()
    return jsonify({
        'recompra': recompra_alertas,
        'inativos': inativos_list,
        'vencimentos_proximos': vencimentos_list
    })


@app.route('/api/cadastros/<int:id>/repetir-pedido', methods=['POST'])
@login_required
def repetir_pedido(id):
    """Create a new proposal duplicating the last OV items for this client"""
    conn = get_db()
    user = get_current_user()

    # Find last OV for this client
    last_ov = conn.execute(
        "SELECT id FROM ordens_venda WHERE cadastro_id=? AND status!='Cancelada' ORDER BY data_emissao DESC LIMIT 1",
        (id,)).fetchone()
    if not last_ov:
        conn.close()
        return jsonify({'error': 'Nenhum pedido anterior encontrado para este cliente'}), 404

    # Get the original proposal that generated this OV, or use OV items directly
    ov = conn.execute("SELECT * FROM ordens_venda WHERE id=?", (last_ov['id'],)).fetchone()
    ov_items = conn.execute("SELECT * FROM ov_items WHERE ov_id=?", (last_ov['id'],)).fetchall()

    if not ov_items:
        conn.close()
        return jsonify({'error': 'Pedido anterior sem itens'}), 404

    cadastro = conn.execute("SELECT * FROM cadastros WHERE id=?", (id,)).fetchone()
    if not cadastro:
        conn.close()
        return jsonify({'error': 'Cliente não encontrado'}), 404

    try:
        conn.execute("BEGIN IMMEDIATE")
        numero = get_next_number('PROP', conn)

        conn.execute('''INSERT INTO propostas (numero, tipo, status, cadastro_id, vendedor_id,
            uf_destino, icms_isento, data_emissao, validade_dias,
            condicao_pagamento, forma_pagamento, frete, obs_interna)
            VALUES (?,?,?,?,?,?,?,datetime('now','localtime'),?,?,?,?,?)''',
            (numero, 'VENDA', 'Rascunho', id, user['id'],
             ov['uf_destino'], ov.get('icms_isento', 0), 15,
             ov.get('condicao_pagamento', ''), ov.get('forma_pagamento', ''),
             ov.get('frete', 'CIF'),
             f'Recompra baseada no pedido {ov["numero"]}'))

        new_id = conn.execute("SELECT last_insert_rowid() as id").fetchone()['id']

        # Copy items from OV
        for idx, item in enumerate(ov_items):
            conn.execute('''INSERT INTO proposta_items (proposta_id, ordem, categoria, campos_especificos,
                descricao_complementar, peso_unitario, peso_total, quantidade, unidade,
                valor_unitario, valor_total)
                VALUES (?,?,?,?,?,?,?,?,?,?,?)''',
                (new_id, idx + 1, item['categoria'], item.get('campos_especificos', ''),
                 item.get('descricao_complementar', ''), item.get('peso_unitario', 0),
                 item.get('peso_total', 0), item['quantidade'], item['unidade'],
                 item['valor_unitario'], item['valor_total']))

        conn.execute("INSERT INTO proposta_log (proposta_id, user_id, acao, detalhes) VALUES (?,?,?,?)",
            (new_id, user['id'], 'Criação', f'Recompra do cliente {cadastro["razao_social"]} — baseada no pedido {ov["numero"]}'))

        conn.commit()
        conn.close()
        return jsonify({'ok': True, 'id': new_id, 'numero': numero, 'ov_base': ov['numero']})
    except Exception as e:
        conn.rollback()
        conn.close()
        app.logger.exception('Erro interno'); return jsonify({'error': 'Erro interno do servidor'}), 500


@app.route('/api/dashboard/recompra-alertas')
@login_required
def dashboard_recompra_alertas():
    """Quick endpoint for dashboard: clients past their purchase cycle"""
    conn = get_db()
    user = get_current_user()

    # Get all OV dates grouped by client
    vend_filter = ""
    vend_params = []
    if user['perfil'] == 'vendedor':
        vend_filter = "AND ov.vendedor_id = ?"
        vend_params = [user['id']]

    rows = conn.execute(f"""
        SELECT ov.cadastro_id, c.razao_social as nome, c.contato_whatsapp,
            ov.data_emissao
        FROM ordens_venda ov
        JOIN cadastros c ON ov.cadastro_id = c.id
        WHERE ov.status != 'Cancelada' {vend_filter}
        ORDER BY ov.cadastro_id, ov.data_emissao
    """, vend_params).fetchall()

    compras_por_cliente = defaultdict(list)
    cliente_info = {}
    for r in rows:
        compras_por_cliente[r['cadastro_id']].append(r['data_emissao'])
        cliente_info[r['cadastro_id']] = {'nome': r['nome'], 'whatsapp': r['contato_whatsapp']}

    alertas = []
    hoje = datetime.now()
    for cad_id, datas_str in compras_por_cliente.items():
        if len(datas_str) < 2:
            continue
        datas = sorted([datetime.strptime(d[:10], '%Y-%m-%d') for d in datas_str])
        intervalos = [(datas[i+1] - datas[i]).days for i in range(len(datas)-1)]
        avg_freq = sum(intervalos) / len(intervalos)
        if avg_freq < 1:
            continue
        days_since = (hoje - datas[-1]).days
        atraso = days_since - round(avg_freq)

        # Only show clients that are 10+ days past their cycle
        if atraso >= 10:
            info = cliente_info[cad_id]
            alertas.append({
                'cadastro_id': cad_id,
                'nome': info['nome'],
                'whatsapp': info['whatsapp'],
                'frequencia_media': round(avg_freq),
                'dias_sem_comprar': days_since,
                'atraso_dias': atraso,
                'nivel': 'risco' if atraso > 30 else 'atencao'
            })

    alertas.sort(key=lambda x: x['atraso_dias'], reverse=True)

    conn.close()
    return jsonify({'alertas': alertas, 'total': len(alertas)})


# ============ DASHBOARD POR VENDEDOR ============

@app.route('/api/dashboard/vendedor/<int:user_id>')
@login_required
def dashboard_vendedor(user_id):
    current_user = get_current_user()
    # Vendedor só vê o próprio dashboard
    if current_user['perfil'] == 'vendedor' and user_id != current_user['id']:
        return jsonify({'error': 'Sem permissão'}), 403
    conn = get_db()
    now = datetime.now()

    # Verify user exists
    user = conn.execute("SELECT id, nome, perfil FROM users WHERE id=?", (user_id,)).fetchone()
    if not user:
        conn.close()
        return jsonify({'error': 'Usuário não encontrado'}), 404

    # Weekly OV total (Monday to Sunday)
    weekday = now.weekday()  # 0=Monday
    inicio_semana = (now - timedelta(days=weekday)).strftime('%Y-%m-%d')
    fim_semana = (now - timedelta(days=weekday) + timedelta(days=6)).strftime('%Y-%m-%d')

    semana_total = conn.execute("""
        SELECT COALESCE(SUM(i.valor_total), 0) as total
        FROM ov_items i JOIN ordens_venda ov ON i.ov_id = ov.id
        WHERE ov.vendedor_id = ? AND ov.status != 'Cancelada'
        AND date(ov.data_emissao) BETWEEN date(?) AND date(?)
    """, (user_id, inicio_semana, fim_semana)).fetchone()['total']

    # Get weekly goal from config
    bonus_config = conn.execute("SELECT valor FROM configuracoes WHERE chave='bonus_semanal'").fetchone()
    meta_semanal = 50000
    valor_bonus = 250
    if bonus_config:
        bc = json.loads(bonus_config['valor'])
        meta_semanal = bc.get('meta_semanal', 50000)
        valor_bonus = bc.get('valor_bonus', 250)

    # Monthly goal progress
    mes_str = f'{now.month:02d}'
    ano_str = str(now.year)
    mes_total = conn.execute("""
        SELECT COALESCE(SUM(i.valor_total), 0) as total
        FROM ov_items i JOIN ordens_venda ov ON i.ov_id = ov.id
        WHERE ov.vendedor_id = ? AND ov.status != 'Cancelada'
        AND strftime('%Y', ov.data_emissao) = ? AND strftime('%m', ov.data_emissao) = ?
    """, (user_id, ano_str, mes_str)).fetchone()['total']

    # Personal conversion rate (all time for this user)
    total_props = conn.execute(
        "SELECT COUNT(*) as c FROM propostas WHERE vendedor_id=? AND tipo='VENDA'",
        (user_id,)).fetchone()['c']
    aprovadas = conn.execute(
        "SELECT COUNT(*) as c FROM propostas WHERE vendedor_id=? AND tipo='VENDA' AND status IN ('Aprovada','Convertida')",
        (user_id,)).fetchone()['c']
    taxa_conversao = (aprovadas / total_props * 100) if total_props > 0 else 0

    # Personal top 5 clients
    top_clientes = conn.execute("""
        SELECT c.razao_social as nome, COALESCE(SUM(i.valor_total), 0) as total, COUNT(DISTINCT ov.id) as count
        FROM ov_items i JOIN ordens_venda ov ON i.ov_id = ov.id
        JOIN cadastros c ON ov.cadastro_id = c.id
        WHERE ov.vendedor_id = ? AND ov.status != 'Cancelada'
        GROUP BY c.id ORDER BY total DESC LIMIT 5
    """, (user_id,)).fetchall()
    top_clientes_list = [{'nome': r['nome'], 'total': r['total'], 'count': r['count']} for r in top_clientes]

    conn.close()
    return jsonify({
        'vendedor': {'id': user['id'], 'nome': user['nome'], 'perfil': user['perfil']},
        'bonus_semanal': {
            'meta': meta_semanal,
            'atual': semana_total,
            'progresso_pct': round(semana_total / meta_semanal * 100, 1) if meta_semanal > 0 else 0,
            'atingiu': semana_total >= meta_semanal,
            'valor_bonus': valor_bonus,
            'periodo': f'{inicio_semana} a {fim_semana}'
        },
        'meta_mensal': {
            'total': mes_total,
            'mes': now.month,
            'ano': now.year
        },
        'taxa_conversao': round(taxa_conversao, 1),
        'total_propostas': total_props,
        'propostas_aprovadas': aprovadas,
        'top_clientes': top_clientes_list
    })


# ============ STATIC / SPA ============

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/manifest.json')
def manifest():
    return send_from_directory('static', 'manifest.json')

@app.route('/sw.js')
def service_worker():
    return send_from_directory('static/js', 'sw.js')


# ============ ANALYTICS ESTADOS ============

@app.route('/api/analytics/estados/<int:ano>')
@permission_required('ver_relatorios')
def analytics_estados(ano):
    conn = get_db()

    # Vendas por UF (from ordens_venda + ov_items)
    vendas_por_uf = conn.execute(
        """SELECT ov.uf_destino as uf,
                  COALESCE(SUM(it.valor_total), 0) as total,
                  COUNT(DISTINCT ov.id) as count,
                  COUNT(DISTINCT ov.cadastro_id) as clientes
           FROM ordens_venda ov
           JOIN ov_items it ON it.ov_id = ov.id
           WHERE strftime('%Y', ov.data_emissao) = ?
             AND ov.status != 'Cancelada'
             AND ov.uf_destino IS NOT NULL AND ov.uf_destino != ''
           GROUP BY ov.uf_destino
           ORDER BY total DESC""",
        (str(ano),)
    ).fetchall()

    # Categorias por UF
    categorias_por_uf = conn.execute(
        """SELECT ov.uf_destino as uf,
                  it.categoria,
                  COALESCE(SUM(it.valor_total), 0) as total
           FROM ordens_venda ov
           JOIN ov_items it ON it.ov_id = ov.id
           WHERE strftime('%Y', ov.data_emissao) = ?
             AND ov.status != 'Cancelada'
             AND ov.uf_destino IS NOT NULL AND ov.uf_destino != ''
           GROUP BY ov.uf_destino, it.categoria
           ORDER BY ov.uf_destino, total DESC""",
        (str(ano),)
    ).fetchall()

    # Clientes por UF (from cadastros)
    clientes_por_uf = conn.execute(
        """SELECT endereco_uf as uf, COUNT(*) as count
           FROM cadastros
           WHERE endereco_uf IS NOT NULL AND endereco_uf != ''
           GROUP BY endereco_uf
           ORDER BY count DESC"""
    ).fetchall()

    conn.close()

    return jsonify({
        'vendas_por_uf': [dict(r) for r in vendas_por_uf],
        'categorias_por_uf': [dict(r) for r in categorias_por_uf],
        'clientes_por_uf': [dict(r) for r in clientes_por_uf]
    })


# ============ ANALYTICS MARGEM ============

@app.route('/api/analytics/margem')
@permission_required('ver_margem')
@gestor_required
def analytics_margem():
    """Margin analysis by category and seller"""
    conn = get_db()
    mes = request.args.get('mes', datetime.now().month)
    ano = request.args.get('ano', datetime.now().year)

    # Margin by category this month
    por_categoria = conn.execute("""
        SELECT i.categoria,
            COUNT(*) as qtd_items,
            COALESCE(SUM(i.valor_total), 0) as receita,
            COALESCE(SUM(i.custo * i.quantidade), 0) as custo_total,
            COALESCE(AVG(i.margem), 0) as margem_media
        FROM ov_items i
        JOIN ordens_venda ov ON i.ov_id = ov.id
        WHERE ov.status != 'Cancelada'
            AND strftime('%m', ov.data_emissao) = ?
            AND strftime('%Y', ov.data_emissao) = ?
            AND i.custo IS NOT NULL AND i.custo > 0
        GROUP BY i.categoria
        ORDER BY receita DESC
    """, (f'{int(mes):02d}', str(ano))).fetchall()

    # Margin by seller this month
    por_vendedor = conn.execute("""
        SELECT u.nome as vendedor,
            COALESCE(SUM(i.valor_total), 0) as receita,
            COALESCE(SUM(i.custo * i.quantidade), 0) as custo_total,
            COALESCE(AVG(i.margem), 0) as margem_media
        FROM ov_items i
        JOIN ordens_venda ov ON i.ov_id = ov.id
        JOIN users u ON ov.vendedor_id = u.id
        WHERE ov.status != 'Cancelada'
            AND strftime('%m', ov.data_emissao) = ?
            AND strftime('%Y', ov.data_emissao) = ?
            AND i.custo IS NOT NULL AND i.custo > 0
        GROUP BY u.nome
        ORDER BY receita DESC
    """, (f'{int(mes):02d}', str(ano))).fetchall()

    # Overall margin
    geral = conn.execute("""
        SELECT COALESCE(SUM(i.valor_total), 0) as receita,
            COALESCE(SUM(i.custo * i.quantidade), 0) as custo_total,
            COALESCE(AVG(i.margem), 0) as margem_media
        FROM ov_items i
        JOIN ordens_venda ov ON i.ov_id = ov.id
        WHERE ov.status != 'Cancelada'
            AND strftime('%m', ov.data_emissao) = ?
            AND strftime('%Y', ov.data_emissao) = ?
            AND i.custo IS NOT NULL AND i.custo > 0
    """, (f'{int(mes):02d}', str(ano))).fetchone()

    conn.close()

    receita = geral['receita'] or 0
    custo = geral['custo_total'] or 0
    margem_geral = round((receita - custo) / custo * 100, 1) if custo > 0 else 0

    return jsonify({
        'margem_geral': margem_geral,
        'receita_total': receita,
        'custo_total': custo,
        'lucro_bruto': receita - custo,
        'por_categoria': [dict(r) for r in por_categoria],
        'por_vendedor': [dict(r) for r in por_vendedor]
    })


# ============ COMMERCIAL INTELLIGENCE ============

@app.route('/api/intelligence')
@permission_required('ver_intelligence')
def commercial_intelligence():
    """Onda 4 — Inteligência Comercial completa para diretor/gestor"""
    conn = get_db()
    now = datetime.now()
    ano = now.year
    mes = now.month
    ano_str = str(ano)
    hoje = now.strftime('%Y-%m-%d')

    # ===== C4: WIN/LOSS ANALYSIS =====
    # Motivo de perda agregado
    win_loss_raw = conn.execute("""
        SELECT p.motivo_perda, COUNT(*) as count,
            COALESCE(SUM((SELECT SUM(valor_total) FROM proposta_items WHERE proposta_id=p.id)), 0) as valor
        FROM propostas p
        WHERE p.status = 'Perdida' AND p.tipo = 'VENDA'
            AND strftime('%Y', p.data_emissao) = ?
        GROUP BY p.motivo_perda
        ORDER BY count DESC
    """, (ano_str,)).fetchall()
    win_loss = [dict(r) for r in win_loss_raw]

    # Total propostas venda no ano para taxas
    total_vendas_ano = conn.execute(
        "SELECT COUNT(*) as c FROM propostas WHERE tipo='VENDA' AND strftime('%Y', data_emissao)=?",
        (ano_str,)).fetchone()['c']
    convertidas_ano = conn.execute(
        "SELECT COUNT(*) as c FROM propostas WHERE tipo='VENDA' AND status IN ('Aprovada','Convertida') AND strftime('%Y', data_emissao)=?",
        (ano_str,)).fetchone()['c']
    perdidas_ano = conn.execute(
        "SELECT COUNT(*) as c FROM propostas WHERE tipo='VENDA' AND status='Perdida' AND strftime('%Y', data_emissao)=?",
        (ano_str,)).fetchone()['c']

    # Win/loss por mês (tendência)
    win_loss_mensal = []
    for m in range(1, 13):
        ms = f'{m:02d}'
        r = conn.execute("""
            SELECT
                SUM(CASE WHEN status IN ('Aprovada','Convertida') THEN 1 ELSE 0 END) as ganhas,
                SUM(CASE WHEN status = 'Perdida' THEN 1 ELSE 0 END) as perdidas,
                COUNT(*) as total
            FROM propostas WHERE tipo='VENDA' AND strftime('%Y', data_emissao)=? AND strftime('%m', data_emissao)=?
        """, (ano_str, ms)).fetchone()
        ganhas = r['ganhas'] or 0
        total = r['total'] or 0
        win_loss_mensal.append({
            'mes': m,
            'ganhas': ganhas,
            'perdidas': r['perdidas'] or 0,
            'total': total,
            'taxa': round(ganhas / total * 100, 1) if total > 0 else 0
        })

    # ===== C5: SPREAD COMPRA VS VENDA POR CATEGORIA =====
    spread_raw = conn.execute("""
        SELECT cat, tipo,
            SUM(valor) as total_valor,
            SUM(peso) as total_peso,
            COUNT(*) as count
        FROM (
            SELECT i.categoria as cat, 'VENDA' as tipo, COALESCE(i.valor_total, 0) as valor, COALESCE(i.peso_total, 0) as peso
            FROM ov_items i JOIN ordens_venda ov ON i.ov_id = ov.id
            WHERE ov.status != 'Cancelada' AND strftime('%Y', ov.data_emissao) = ?
            UNION ALL
            SELECT i.categoria as cat, 'COMPRA' as tipo, COALESCE(i.valor_total, 0) as valor, COALESCE(i.peso_total, 0) as peso
            FROM oc_items i JOIN ordens_compra oc ON i.oc_id = oc.id
            WHERE oc.status != 'Cancelada' AND strftime('%Y', oc.data_emissao) = ?
        )
        GROUP BY cat, tipo
        ORDER BY cat, tipo
    """, (ano_str, ano_str)).fetchall()

    spread = {}
    for r in spread_raw:
        cat = r['cat']
        if cat not in spread:
            spread[cat] = {'categoria': cat, 'venda': 0, 'compra': 0, 'venda_peso': 0, 'compra_peso': 0, 'venda_count': 0, 'compra_count': 0}
        if r['tipo'] == 'VENDA':
            spread[cat]['venda'] = r['total_valor']
            spread[cat]['venda_peso'] = r['total_peso']
            spread[cat]['venda_count'] = r['count']
        else:
            spread[cat]['compra'] = r['total_valor']
            spread[cat]['compra_peso'] = r['total_peso']
            spread[cat]['compra_count'] = r['count']

    for cat in spread.values():
        cat['spread'] = cat['venda'] - cat['compra']
        cat['spread_pct'] = round((cat['venda'] - cat['compra']) / cat['compra'] * 100, 1) if cat['compra'] > 0 else 0

    spread_list = sorted(spread.values(), key=lambda x: x['venda'], reverse=True)

    # ===== C6: CLIENT CONCENTRATION RISK =====
    clientes_vendas = conn.execute("""
        SELECT c.id, c.razao_social as nome,
            COALESCE(SUM(i.valor_total), 0) as total
        FROM ov_items i JOIN ordens_venda ov ON i.ov_id = ov.id
        JOIN cadastros c ON ov.cadastro_id = c.id
        WHERE ov.status != 'Cancelada' AND strftime('%Y', ov.data_emissao) = ?
        GROUP BY c.id ORDER BY total DESC
    """, (ano_str,)).fetchall()

    total_vendas_valor = sum(r['total'] for r in clientes_vendas)
    concentracao = []
    acum = 0
    for r in clientes_vendas:
        pct = round(r['total'] / total_vendas_valor * 100, 1) if total_vendas_valor > 0 else 0
        acum += pct
        concentracao.append({
            'id': r['id'], 'nome': r['nome'],
            'total': r['total'], 'pct': pct, 'acum': round(acum, 1)
        })

    # HHI (Herfindahl-Hirschman Index) — market concentration
    hhi = sum((r['total'] / total_vendas_valor * 100) ** 2 for r in clientes_vendas) if total_vendas_valor > 0 else 0
    # Pareto: how many clients represent 80% of revenue
    pareto_80 = 0
    pareto_acum = 0
    for r in clientes_vendas:
        pareto_acum += r['total']
        pareto_80 += 1
        if pareto_acum >= total_vendas_valor * 0.8:
            break

    # ===== C3: CYCLE TIME (proposta → conversão) =====
    cycle_raw = conn.execute("""
        SELECT p.id, p.numero, p.tipo,
            p.created_at, p.updated_at,
            julianday(p.updated_at) - julianday(p.created_at) as dias_ciclo,
            c.razao_social as cliente
        FROM propostas p
        LEFT JOIN cadastros c ON c.id = p.cadastro_id
        WHERE p.status = 'Convertida' AND strftime('%Y', p.data_emissao) = ?
        ORDER BY p.updated_at DESC
    """, (ano_str,)).fetchall()

    cycle_vendas = [dict(r) for r in cycle_raw if r['tipo'] == 'VENDA']
    cycle_compras = [dict(r) for r in cycle_raw if r['tipo'] == 'COMPRA']

    avg_cycle_venda = round(sum(r['dias_ciclo'] for r in cycle_vendas) / len(cycle_vendas), 1) if cycle_vendas else 0
    avg_cycle_compra = round(sum(r['dias_ciclo'] for r in cycle_compras) / len(cycle_compras), 1) if cycle_compras else 0

    # Cycle time por mês
    cycle_mensal = []
    for m in range(1, 13):
        ms = f'{m:02d}'
        r = conn.execute("""
            SELECT AVG(julianday(updated_at) - julianday(created_at)) as avg_dias,
                COUNT(*) as count
            FROM propostas
            WHERE status='Convertida' AND tipo='VENDA'
                AND strftime('%Y', data_emissao)=? AND strftime('%m', data_emissao)=?
        """, (ano_str, ms)).fetchone()
        cycle_mensal.append({
            'mes': m,
            'avg_dias': round(r['avg_dias'], 1) if r['avg_dias'] else 0,
            'count': r['count'] or 0
        })

    # ===== D2: RECEIVABLES AGING =====
    parcelas_raw = conn.execute("""
        SELECT p.id, p.valor, p.data_vencimento, p.status, p.valor_recebido,
            ov.numero as ov_numero, c.razao_social as cliente,
            julianday(?) - julianday(p.data_vencimento) as dias_atraso
        FROM ov_parcelas p
        JOIN ordens_venda ov ON p.ov_id = ov.id
        JOIN cadastros c ON ov.cadastro_id = c.id
        WHERE p.status IN ('Pendente', 'Vencida')
        ORDER BY p.data_vencimento ASC
    """, (hoje,)).fetchall()

    aging = {'corrente': 0, '1_30': 0, '31_60': 0, '61_90': 0, '90_plus': 0, 'total': 0}
    aging_detail = {'corrente': [], '1_30': [], '31_60': [], '61_90': [], '90_plus': []}

    for p in parcelas_raw:
        dias = p['dias_atraso'] or 0
        valor = p['valor'] - (p['valor_recebido'] or 0)
        item = {'ov': p['ov_numero'], 'cliente': p['cliente'], 'valor': valor, 'vencimento': p['data_vencimento'], 'dias': round(dias)}

        if dias <= 0:
            aging['corrente'] += valor
            aging_detail['corrente'].append(item)
        elif dias <= 30:
            aging['1_30'] += valor
            aging_detail['1_30'].append(item)
        elif dias <= 60:
            aging['31_60'] += valor
            aging_detail['31_60'].append(item)
        elif dias <= 90:
            aging['61_90'] += valor
            aging_detail['61_90'].append(item)
        else:
            aging['90_plus'] += valor
            aging_detail['90_plus'].append(item)

    aging['total'] = sum(aging[k] for k in ['corrente', '1_30', '31_60', '61_90', '90_plus'])

    # Top devedores
    devedores_raw = conn.execute("""
        SELECT c.id, c.razao_social as nome,
            SUM(p.valor - COALESCE(p.valor_recebido, 0)) as total_devendo,
            COUNT(*) as parcelas_abertas,
            MIN(p.data_vencimento) as parcela_mais_antiga
        FROM ov_parcelas p
        JOIN ordens_venda ov ON p.ov_id = ov.id
        JOIN cadastros c ON ov.cadastro_id = c.id
        WHERE p.status IN ('Pendente', 'Vencida')
        GROUP BY c.id
        ORDER BY total_devendo DESC
        LIMIT 10
    """).fetchall()
    devedores = [dict(r) for r in devedores_raw]

    # ===== C7: YoY SEASONAL COMPARISON =====
    ano_anterior = ano - 1
    ano_ant_str = str(ano_anterior)

    vendas_yoy = []
    compras_yoy = []
    for m in range(1, 13):
        ms = f'{m:02d}'
        v_atual = conn.execute("""
            SELECT COALESCE(SUM(i.valor_total), 0) as total
            FROM ov_items i JOIN ordens_venda ov ON i.ov_id = ov.id
            WHERE ov.status != 'Cancelada' AND strftime('%Y', ov.data_emissao)=? AND strftime('%m', ov.data_emissao)=?
        """, (ano_str, ms)).fetchone()['total']
        v_ant = conn.execute("""
            SELECT COALESCE(SUM(i.valor_total), 0) as total
            FROM ov_items i JOIN ordens_venda ov ON i.ov_id = ov.id
            WHERE ov.status != 'Cancelada' AND strftime('%Y', ov.data_emissao)=? AND strftime('%m', ov.data_emissao)=?
        """, (ano_ant_str, ms)).fetchone()['total']
        var_pct = round((v_atual - v_ant) / v_ant * 100, 1) if v_ant > 0 else 0
        vendas_yoy.append({'mes': m, 'atual': v_atual, 'anterior': v_ant, 'variacao': var_pct})

        c_atual = conn.execute("""
            SELECT COALESCE(SUM(i.valor_total), 0) as total
            FROM oc_items i JOIN ordens_compra oc ON i.oc_id = oc.id
            WHERE oc.status != 'Cancelada' AND strftime('%Y', oc.data_emissao)=? AND strftime('%m', oc.data_emissao)=?
        """, (ano_str, ms)).fetchone()['total']
        c_ant = conn.execute("""
            SELECT COALESCE(SUM(i.valor_total), 0) as total
            FROM oc_items i JOIN ordens_compra oc ON i.oc_id = oc.id
            WHERE oc.status != 'Cancelada' AND strftime('%Y', oc.data_emissao)=? AND strftime('%m', oc.data_emissao)=?
        """, (ano_ant_str, ms)).fetchone()['total']
        var_c = round((c_atual - c_ant) / c_ant * 100, 1) if c_ant > 0 else 0
        compras_yoy.append({'mes': m, 'atual': c_atual, 'anterior': c_ant, 'variacao': var_c})

    # ===== D3: COMPARATIVE MONTHLY TABLE =====
    comparativo_mensal = []
    for m in range(1, 13):
        ms = f'{m:02d}'
        v = conn.execute("""
            SELECT COALESCE(SUM(i.valor_total), 0) as total, COUNT(DISTINCT ov.id) as count
            FROM ov_items i JOIN ordens_venda ov ON i.ov_id = ov.id
            WHERE ov.status != 'Cancelada' AND strftime('%Y', ov.data_emissao)=? AND strftime('%m', ov.data_emissao)=?
        """, (ano_str, ms)).fetchone()
        c = conn.execute("""
            SELECT COALESCE(SUM(i.valor_total), 0) as total, COUNT(DISTINCT oc.id) as count
            FROM oc_items i JOIN ordens_compra oc ON i.oc_id = oc.id
            WHERE oc.status != 'Cancelada' AND strftime('%Y', oc.data_emissao)=? AND strftime('%m', oc.data_emissao)=?
        """, (ano_str, ms)).fetchone()
        props = conn.execute("""
            SELECT COUNT(*) as total,
                SUM(CASE WHEN status IN ('Aprovada','Convertida') THEN 1 ELSE 0 END) as convertidas
            FROM propostas WHERE tipo='VENDA' AND strftime('%Y', data_emissao)=? AND strftime('%m', data_emissao)=?
        """, (ano_str, ms)).fetchone()
        comparativo_mensal.append({
            'mes': m,
            'vendas': v['total'], 'vendas_count': v['count'],
            'compras': c['total'], 'compras_count': c['count'],
            'resultado': v['total'] - c['total'],
            'propostas': props['total'] or 0,
            'conversoes': props['convertidas'] or 0,
            'taxa': round((props['convertidas'] or 0) / (props['total'] or 1) * 100, 1) if (props['total'] or 0) > 0 else 0
        })

    # Totals
    total_vendas = sum(m['vendas'] for m in comparativo_mensal)
    total_compras = sum(m['compras'] for m in comparativo_mensal)

    conn.close()

    return jsonify({
        'ano': ano,
        'win_loss': {
            'motivos': win_loss,
            'total_vendas': total_vendas_ano,
            'convertidas': convertidas_ano,
            'perdidas': perdidas_ano,
            'taxa_geral': round(convertidas_ano / total_vendas_ano * 100, 1) if total_vendas_ano > 0 else 0,
            'mensal': win_loss_mensal
        },
        'spread': spread_list,
        'concentracao': {
            'clientes': concentracao[:20],
            'total_clientes': len(clientes_vendas),
            'total_vendas': total_vendas_valor,
            'hhi': round(hhi, 0),
            'hhi_classificacao': 'Baixa' if hhi < 1500 else ('Moderada' if hhi < 2500 else 'Alta'),
            'pareto_80': pareto_80,
            'pareto_80_pct': round(pareto_80 / len(clientes_vendas) * 100, 1) if clientes_vendas else 0
        },
        'cycle_time': {
            'avg_venda': avg_cycle_venda,
            'avg_compra': avg_cycle_compra,
            'mensal': cycle_mensal,
            'ultimas_vendas': cycle_vendas[:10],
            'ultimas_compras': cycle_compras[:10]
        },
        'aging': {
            'resumo': aging,
            'devedores': devedores,
            'detail_count': {k: len(v) for k, v in aging_detail.items()}
        },
        'yoy': {
            'vendas': vendas_yoy,
            'compras': compras_yoy,
            'ano_atual': ano,
            'ano_anterior': ano_anterior
        },
        'comparativo': {
            'mensal': comparativo_mensal,
            'total_vendas': total_vendas,
            'total_compras': total_compras,
            'resultado': total_vendas - total_compras
        }
    })


# ============ BACKUP SCHEDULER ============

def backup_scheduler():
    while True:
        time.sleep(6 * 3600)  # 6 hours
        try:
            do_backup()
        except:
            pass

# ============ MAIN ============

def _atualizar_parcelas_vencidas():
    """Atualiza status de parcelas pendentes que já venceram. Roda na inicialização."""
    try:
        conn = get_db()
        hoje = datetime.now().strftime('%Y-%m-%d')
        changed = conn.execute(
            "UPDATE ov_parcelas SET status='Vencida' WHERE status='Pendente' AND date(data_vencimento)<?",
            (hoje,)).rowcount
        conn.execute(
            "UPDATE oc_parcelas SET status='Vencida' WHERE status='Pendente' AND date(data_vencimento)<?",
            (hoje,)).rowcount
        conn.commit()
        conn.close()
        if changed:
            print(f"  Parcelas vencidas atualizadas: {changed}")
    except Exception:
        pass

# Restore DB from GitHub if this is a fresh Render deploy (no local DB)
restore_from_cloud()

# Initialize DB on import (needed for gunicorn/Render)
init_db()
check_backup_on_start()
_atualizar_parcelas_vencidas()
t = threading.Thread(target=backup_scheduler, daemon=True)
t.start()

# GitHub cloud backup — upload after data changes
def _trigger_cloud_backup():
    """Schedule a background upload to GitHub after data changes."""
    try:
        from cloud_sync import schedule_background_upload
        schedule_background_upload(DB_PATH, delay=5)
    except Exception:
        pass

if __name__ == '__main__':

    print("=" * 50)
    print("  ABMT Sistema Comercial")
    print("  http://localhost:5001")
    print("=" * 50)
    app.run(host='0.0.0.0', port=5001, debug=True)
