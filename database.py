"""
Database module for ABMT Commercial System
SQLite with FTS5 for global search
"""
import sqlite3
import os
import json
import shutil
from datetime import datetime, timedelta

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'comercial.db')
BACKUP_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backups')

def get_db():
    conn = sqlite3.connect(DB_PATH, timeout=10)  # Wait up to 10s if locked
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    conn.execute("PRAGMA busy_timeout=10000")  # 10s busy timeout
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()

    # === USERS ===
    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        nome TEXT NOT NULL,
        perfil TEXT NOT NULL CHECK(perfil IN ('vendedor','gerente','diretor')),
        cpf TEXT,
        dados_bancarios TEXT,
        ativo INTEGER DEFAULT 1,
        must_change_password INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now','localtime'))
    )''')

    # === CLIENTS/SUPPLIERS (unified) ===
    c.execute('''CREATE TABLE IF NOT EXISTS cadastros (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cnpj_cpf TEXT UNIQUE NOT NULL,
        tipo_pessoa TEXT NOT NULL CHECK(tipo_pessoa IN ('PF','PJ')),
        razao_social TEXT NOT NULL,
        nome_fantasia TEXT,
        inscricao_estadual TEXT,
        endereco_cep TEXT,
        endereco_rua TEXT,
        endereco_numero TEXT,
        endereco_complemento TEXT,
        endereco_bairro TEXT,
        endereco_cidade TEXT,
        endereco_uf TEXT,
        contato_nome TEXT,
        contato_cargo TEXT,
        contato_telefone TEXT,
        contato_whatsapp TEXT,
        contato_email TEXT,
        contatos_adicionais TEXT, -- JSON array
        segmento TEXT,
        tags TEXT, -- JSON array
        vendedor_responsavel_id INTEGER REFERENCES users(id),
        observacoes TEXT,
        limite_faturamento REAL,
        dias_inadimplencia INTEGER DEFAULT 30,
        status TEXT DEFAULT 'Ativo' CHECK(status IN ('Ativo','Inativo','Bloqueado')),
        created_at TEXT DEFAULT (datetime('now','localtime')),
        updated_at TEXT DEFAULT (datetime('now','localtime'))
    )''')

    # === PROPOSALS ===
    c.execute('''CREATE TABLE IF NOT EXISTS propostas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        numero TEXT UNIQUE NOT NULL,
        tipo TEXT NOT NULL CHECK(tipo IN ('COMPRA','VENDA')),
        status TEXT DEFAULT 'Rascunho' CHECK(status IN ('Rascunho','Enviada','Em Negociação','Aprovada','Convertida','Perdida','Expirada')),
        cadastro_id INTEGER REFERENCES cadastros(id),
        vendedor_id INTEGER REFERENCES users(id),
        uf_destino TEXT,
        icms_isento INTEGER DEFAULT 0, -- toggle SP Normal/Isento
        proposta_vinculada_id INTEGER REFERENCES propostas(id),
        data_emissao TEXT DEFAULT (datetime('now','localtime')),
        validade_dias INTEGER DEFAULT 7,
        data_expiracao TEXT,
        condicao_pagamento TEXT, -- JSON: {tipo, parcelas[], data_referencia, texto_livre}
        forma_pagamento TEXT DEFAULT 'Faturado',
        dados_pagamento TEXT, -- JSON: chave_pix, dados_bancarios
        frete TEXT DEFAULT 'FOB',
        transportadora TEXT,
        valor_frete REAL,
        obs_transporte TEXT,
        prazo_entrega TEXT,
        garantia TEXT,
        obs_cliente TEXT, -- aparece no PDF
        obs_interna TEXT, -- NÃO aparece no PDF
        incluir_dados_bancarios INTEGER DEFAULT 0,
        incluir_politica INTEGER DEFAULT 0,
        mostrar_impostos INTEGER DEFAULT 1,
        motivo_perda TEXT,
        ordem_gerada_id INTEGER, -- OV or OC id
        ordem_gerada_tipo TEXT, -- 'OV' or 'OC'
        intermediario_id INTEGER REFERENCES cadastros(id),
        valor_bruto_venda REAL,
        valor_liquido_venda REAL,
        comissao_forma TEXT,
        intermediario_obs TEXT,
        created_at TEXT DEFAULT (datetime('now','localtime')),
        updated_at TEXT DEFAULT (datetime('now','localtime'))
    )''')

    # === SAVED PAYMENT CONDITIONS ===
    c.execute('''CREATE TABLE IF NOT EXISTS condicoes_salvas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        descricao TEXT NOT NULL UNIQUE,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')

    # === PROPOSAL ITEMS ===
    c.execute('''CREATE TABLE IF NOT EXISTS proposta_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        proposta_id INTEGER NOT NULL REFERENCES propostas(id) ON DELETE CASCADE,
        ordem INTEGER DEFAULT 0,
        categoria TEXT NOT NULL,
        campos_especificos TEXT, -- JSON with category-specific fields
        descricao_complementar TEXT,
        peso_unitario REAL,
        peso_total REAL, -- calculated
        quantidade REAL NOT NULL,
        unidade TEXT NOT NULL CHECK(unidade IN ('KG','KVA','LITRO','UNIDADE')),
        valor_unitario REAL NOT NULL,
        desconto_tipo TEXT CHECK(desconto_tipo IN ('percentual','valor')),
        desconto_valor REAL DEFAULT 0,
        valor_total REAL, -- calculated
        created_at TEXT DEFAULT (datetime('now','localtime'))
    )''')

    # === PROPOSAL CHANGE LOG ===
    c.execute('''CREATE TABLE IF NOT EXISTS proposta_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        proposta_id INTEGER NOT NULL REFERENCES propostas(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id),
        acao TEXT NOT NULL,
        detalhes TEXT, -- what changed
        created_at TEXT DEFAULT (datetime('now','localtime'))
    )''')

    # === SALES ORDERS (OV) ===
    c.execute('''CREATE TABLE IF NOT EXISTS ordens_venda (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        numero TEXT UNIQUE NOT NULL,
        status TEXT DEFAULT 'Aprovada' CHECK(status IN ('Aprovada','Em Produção','Faturada','Despachada','Entregue','Cancelada')),
        proposta_id INTEGER REFERENCES propostas(id),
        cadastro_id INTEGER NOT NULL REFERENCES cadastros(id),
        vendedor_id INTEGER NOT NULL REFERENCES users(id),
        uf_destino TEXT,
        icms_isento INTEGER DEFAULT 0,
        numero_omie TEXT,
        nota_fiscal TEXT,
        data_emissao TEXT DEFAULT (datetime('now','localtime')),
        data_entrega_prevista TEXT,
        condicao_pagamento TEXT, -- JSON
        forma_pagamento TEXT DEFAULT 'Faturado',
        dados_pagamento TEXT,
        frete TEXT DEFAULT 'FOB',
        transportadora TEXT,
        valor_frete REAL,
        obs_transporte TEXT,
        observacoes TEXT,
        obs_interna TEXT,
        motivo_cancelamento TEXT,
        cancelado_por INTEGER REFERENCES users(id),
        cancelado_em TEXT,
        created_at TEXT DEFAULT (datetime('now','localtime')),
        updated_at TEXT DEFAULT (datetime('now','localtime'))
    )''')

    # === OV ITEMS ===
    c.execute('''CREATE TABLE IF NOT EXISTS ov_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ov_id INTEGER NOT NULL REFERENCES ordens_venda(id) ON DELETE CASCADE,
        ordem INTEGER DEFAULT 0,
        categoria TEXT NOT NULL,
        campos_especificos TEXT, -- JSON
        descricao_complementar TEXT,
        peso_unitario REAL,
        peso_total REAL,
        quantidade REAL NOT NULL,
        unidade TEXT NOT NULL,
        valor_unitario REAL NOT NULL,
        desconto_tipo TEXT,
        desconto_valor REAL DEFAULT 0,
        valor_total REAL,
        oc_origem_id INTEGER REFERENCES ordens_compra(id),
        custo REAL, -- visible only to gestor/diretor
        margem REAL, -- calculated
        comissao_percentual REAL,
        comissao_valor REAL,
        status TEXT DEFAULT 'Pendente' CHECK(status IN ('Pendente','Separado','Faturado','Entregue')),
        created_at TEXT DEFAULT (datetime('now','localtime'))
    )''')

    # === OV PARCELAS ===
    c.execute('''CREATE TABLE IF NOT EXISTS ov_parcelas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ov_id INTEGER NOT NULL REFERENCES ordens_venda(id) ON DELETE CASCADE,
        numero_parcela INTEGER NOT NULL,
        total_parcelas INTEGER NOT NULL,
        valor REAL NOT NULL,
        data_vencimento TEXT NOT NULL,
        status TEXT DEFAULT 'Pendente' CHECK(status IN ('Pendente','Vencida','Paga','Paga Parcial')),
        valor_recebido REAL,
        data_pagamento TEXT,
        marcado_por INTEGER REFERENCES users(id),
        created_at TEXT DEFAULT (datetime('now','localtime')),
        updated_at TEXT DEFAULT (datetime('now','localtime'))
    )''')

    # === PURCHASE ORDERS (OC) ===
    c.execute('''CREATE TABLE IF NOT EXISTS ordens_compra (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        numero TEXT UNIQUE NOT NULL,
        status TEXT DEFAULT 'Rascunho' CHECK(status IN ('Rascunho','Enviada ao Fornecedor','Confirmada','Recebida Parcial','Recebida Total','Cancelada')),
        proposta_id INTEGER REFERENCES propostas(id),
        cadastro_id INTEGER NOT NULL REFERENCES cadastros(id),
        comprador_id INTEGER NOT NULL REFERENCES users(id),
        numero_omie TEXT,
        data_emissao TEXT DEFAULT (datetime('now','localtime')),
        data_entrega_prevista TEXT,
        condicao_pagamento TEXT, -- JSON
        forma_pagamento TEXT DEFAULT 'Faturado',
        dados_pagamento TEXT,
        frete TEXT DEFAULT 'FOB',
        transportadora TEXT,
        valor_frete REAL,
        obs_transporte TEXT,
        observacoes TEXT,
        obs_interna TEXT,
        intermediario_nome TEXT,
        intermediario_cpf_cnpj TEXT,
        intermediario_comissao_tipo TEXT CHECK(intermediario_comissao_tipo IN ('percentual','valor_fixo')),
        intermediario_comissao_valor REAL,
        intermediario_obs TEXT,
        motivo_cancelamento TEXT,
        cancelado_por INTEGER REFERENCES users(id),
        cancelado_em TEXT,
        created_at TEXT DEFAULT (datetime('now','localtime')),
        updated_at TEXT DEFAULT (datetime('now','localtime'))
    )''')

    # === OC ITEMS ===
    c.execute('''CREATE TABLE IF NOT EXISTS oc_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        oc_id INTEGER NOT NULL REFERENCES ordens_compra(id) ON DELETE CASCADE,
        ordem INTEGER DEFAULT 0,
        categoria TEXT NOT NULL,
        campos_especificos TEXT, -- JSON
        descricao_complementar TEXT,
        peso_unitario REAL,
        peso_total REAL,
        quantidade REAL NOT NULL,
        unidade TEXT NOT NULL,
        valor_unitario REAL NOT NULL,
        desconto_tipo TEXT,
        desconto_valor REAL DEFAULT 0,
        valor_total REAL,
        quantidade_recebida REAL DEFAULT 0,
        status TEXT DEFAULT 'Pendente' CHECK(status IN ('Pendente','Recebido Parcial','Recebido Total')),
        created_at TEXT DEFAULT (datetime('now','localtime')),
        updated_at TEXT DEFAULT (datetime('now','localtime'))
    )''')

    # === OC PARCELAS ===
    c.execute('''CREATE TABLE IF NOT EXISTS oc_parcelas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        oc_id INTEGER NOT NULL REFERENCES ordens_compra(id) ON DELETE CASCADE,
        numero_parcela INTEGER NOT NULL,
        total_parcelas INTEGER NOT NULL,
        valor REAL NOT NULL,
        data_vencimento TEXT NOT NULL,
        status TEXT DEFAULT 'Pendente' CHECK(status IN ('Pendente','Vencida','Paga','Paga Parcial')),
        valor_pago REAL,
        data_pagamento TEXT,
        marcado_por INTEGER REFERENCES users(id),
        created_at TEXT DEFAULT (datetime('now','localtime')),
        updated_at TEXT DEFAULT (datetime('now','localtime'))
    )''')

    # === OC-OV LINKS (margin tracking) ===
    c.execute('''CREATE TABLE IF NOT EXISTS oc_ov_links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        oc_id INTEGER NOT NULL REFERENCES ordens_compra(id),
        ov_id INTEGER NOT NULL REFERENCES ordens_venda(id),
        descricao TEXT,
        valor_alocado_compra REAL,
        valor_alocado_venda REAL,
        created_by INTEGER REFERENCES users(id),
        created_at TEXT DEFAULT (datetime('now','localtime')),
        UNIQUE(oc_id, ov_id)
    )''')

    # === OC-OV ITEM-LEVEL LINKS (replaces old oc_ov_links for granular tracking) ===
    c.execute('''CREATE TABLE IF NOT EXISTS oc_ov_link_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        oc_id INTEGER NOT NULL REFERENCES ordens_compra(id),
        ov_id INTEGER NOT NULL REFERENCES ordens_venda(id),
        oc_item_id INTEGER NOT NULL REFERENCES oc_items(id),
        quantidade_alocada REAL NOT NULL,
        unidade TEXT NOT NULL,
        valor_unitario REAL,
        valor_total_alocado REAL,
        observacao TEXT,
        created_by INTEGER REFERENCES users(id),
        created_at TEXT DEFAULT (datetime('now','localtime'))
    )''')

    # === ATTACHMENTS ===
    c.execute('''CREATE TABLE IF NOT EXISTS anexos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entidade_tipo TEXT NOT NULL CHECK(entidade_tipo IN ('OV','OC','proposta')),
        entidade_id INTEGER NOT NULL,
        nome_arquivo TEXT NOT NULL,
        caminho TEXT NOT NULL,
        tamanho INTEGER,
        uploaded_by INTEGER REFERENCES users(id),
        deletado INTEGER DEFAULT 0,
        deletado_por INTEGER REFERENCES users(id),
        deletado_em TEXT,
        created_at TEXT DEFAULT (datetime('now','localtime'))
    )''')

    # === NOTES ===
    c.execute('''CREATE TABLE IF NOT EXISTS notas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id),
        titulo TEXT,
        conteudo TEXT,
        tags TEXT, -- JSON array
        cor TEXT,
        fixada INTEGER DEFAULT 0,
        vinculo_tipo TEXT, -- 'cadastro','proposta','ov','oc'
        vinculo_id INTEGER,
        checklist TEXT, -- JSON array [{texto, concluido}]
        lembrete_data TEXT,
        created_at TEXT DEFAULT (datetime('now','localtime')),
        updated_at TEXT DEFAULT (datetime('now','localtime'))
    )''')

    # === INTERACTIONS (CRM timeline) ===
    c.execute('''CREATE TABLE IF NOT EXISTS interacoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cadastro_id INTEGER NOT NULL REFERENCES cadastros(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        tipo TEXT NOT NULL CHECK(tipo IN ('Ligação','WhatsApp','Email','Reunião','Visita','Outro')),
        descricao TEXT NOT NULL,
        data TEXT DEFAULT (datetime('now','localtime')),
        created_at TEXT DEFAULT (datetime('now','localtime'))
    )''')

    # === FOLLOW-UPS ===
    c.execute('''CREATE TABLE IF NOT EXISTS followups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id),
        cadastro_id INTEGER REFERENCES cadastros(id),
        vinculo_tipo TEXT, -- 'proposta','ov','oc'
        vinculo_id INTEGER,
        acao TEXT NOT NULL,
        data_hora TEXT NOT NULL,
        concluido INTEGER DEFAULT 0,
        concluido_em TEXT,
        created_at TEXT DEFAULT (datetime('now','localtime'))
    )''')

    # === MONTHLY CLOSING ===
    c.execute('''CREATE TABLE IF NOT EXISTS fechamentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mes INTEGER NOT NULL,
        ano INTEGER NOT NULL,
        tipo TEXT DEFAULT 'geral' CHECK(tipo IN ('geral','vendas','compras')),
        status TEXT DEFAULT 'Aberto' CHECK(status IN ('Aberto','Fechado')),
        fechado_por INTEGER REFERENCES users(id),
        fechado_em TEXT,
        reaberto_por INTEGER REFERENCES users(id),
        reaberto_em TEXT,
        dados TEXT, -- JSON snapshot of all commissions when closed
        created_at TEXT DEFAULT (datetime('now','localtime')),
        UNIQUE(mes, ano, tipo)
    )''')

    # === CLOSING AUDIT HISTORY ===
    c.execute('''CREATE TABLE IF NOT EXISTS fechamento_historico (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fechamento_id INTEGER NOT NULL REFERENCES fechamentos(id),
        acao TEXT NOT NULL CHECK(acao IN ('fechou','reabriu')),
        user_id INTEGER NOT NULL REFERENCES users(id),
        motivo TEXT,
        snapshot_anterior TEXT,
        snapshot_novo TEXT,
        created_at TEXT DEFAULT (datetime('now','localtime'))
    )''')

    # === CONFIGURATIONS ===
    c.execute('''CREATE TABLE IF NOT EXISTS configuracoes (
        chave TEXT PRIMARY KEY,
        valor TEXT NOT NULL,
        updated_at TEXT DEFAULT (datetime('now','localtime'))
    )''')

    # === AUDIT LOG ===
    c.execute('''CREATE TABLE IF NOT EXISTS audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id),
        acao TEXT NOT NULL,
        entidade_tipo TEXT,
        entidade_id INTEGER,
        detalhes TEXT,
        created_at TEXT DEFAULT (datetime('now','localtime'))
    )''')

    # === NOTIFICATIONS ===
    c.execute('''CREATE TABLE IF NOT EXISTS notificacoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id),
        tipo TEXT NOT NULL,
        titulo TEXT NOT NULL,
        mensagem TEXT,
        lida INTEGER DEFAULT 0,
        link TEXT,
        created_at TEXT DEFAULT (datetime('now','localtime'))
    )''')

    # === FTS5 VIRTUAL TABLE FOR GLOBAL SEARCH ===
    c.execute('''CREATE VIRTUAL TABLE IF NOT EXISTS busca_global USING fts5(
        tipo, -- 'cadastro','proposta','ov','oc','nota'
        entidade_id,
        texto,
        content='',
        tokenize='unicode61'
    )''')

    # === METAS (vendedor targets) ===
    c.execute('''CREATE TABLE IF NOT EXISTS metas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id),
        mes TEXT NOT NULL,
        meta_mensal REAL DEFAULT 0,
        meta_semanal REAL DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now','localtime')),
        updated_at TEXT DEFAULT (datetime('now','localtime')),
        UNIQUE(user_id, mes)
    )''')

    # === SUGESTOES ===
    c.execute('''CREATE TABLE IF NOT EXISTS sugestoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id),
        categoria TEXT NOT NULL CHECK(categoria IN ('Bug','Melhoria','Dúvida','Outro')),
        texto TEXT NOT NULL,
        status TEXT DEFAULT 'Nova' CHECK(status IN ('Nova','Em Análise','Implementada','Descartada')),
        resposta TEXT,
        created_at TEXT DEFAULT (datetime('now','localtime'))
    )''')

    # === INDEXES FOR PERFORMANCE ===
    indexes = [
        "CREATE INDEX IF NOT EXISTS idx_propostas_vendedor ON propostas(vendedor_id)",
        "CREATE INDEX IF NOT EXISTS idx_propostas_tipo_status ON propostas(tipo, status)",
        "CREATE INDEX IF NOT EXISTS idx_propostas_data ON propostas(data_emissao)",
        "CREATE INDEX IF NOT EXISTS idx_propostas_cadastro ON propostas(cadastro_id)",
        "CREATE INDEX IF NOT EXISTS idx_ov_vendedor ON ordens_venda(vendedor_id)",
        "CREATE INDEX IF NOT EXISTS idx_ov_cadastro ON ordens_venda(cadastro_id)",
        "CREATE INDEX IF NOT EXISTS idx_ov_data ON ordens_venda(data_emissao)",
        "CREATE INDEX IF NOT EXISTS idx_ov_status ON ordens_venda(status)",
        "CREATE INDEX IF NOT EXISTS idx_oc_comprador ON ordens_compra(comprador_id)",
        "CREATE INDEX IF NOT EXISTS idx_oc_cadastro ON ordens_compra(cadastro_id)",
        "CREATE INDEX IF NOT EXISTS idx_oc_data ON ordens_compra(data_emissao)",
        "CREATE INDEX IF NOT EXISTS idx_ov_items_ov ON ov_items(ov_id)",
        "CREATE INDEX IF NOT EXISTS idx_oc_items_oc ON oc_items(oc_id)",
        "CREATE INDEX IF NOT EXISTS idx_proposta_items_prop ON proposta_items(proposta_id)",
        "CREATE INDEX IF NOT EXISTS idx_ov_parcelas_ov ON ov_parcelas(ov_id)",
        "CREATE INDEX IF NOT EXISTS idx_ov_parcelas_vencimento ON ov_parcelas(status, data_vencimento)",
        "CREATE INDEX IF NOT EXISTS idx_followups_user ON followups(user_id, concluido)",
        "CREATE INDEX IF NOT EXISTS idx_followups_data ON followups(data_hora)",
        "CREATE INDEX IF NOT EXISTS idx_cadastros_cnpj ON cadastros(cnpj_cpf)",
        "CREATE INDEX IF NOT EXISTS idx_cadastros_status ON cadastros(status)",
        "CREATE INDEX IF NOT EXISTS idx_notificacoes_user ON notificacoes(user_id, lida)",
        "CREATE INDEX IF NOT EXISTS idx_notas_user ON notas(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_interacoes_cadastro ON interacoes(cadastro_id)",
        "CREATE INDEX IF NOT EXISTS idx_oc_parcelas_oc ON oc_parcelas(oc_id)",
        "CREATE INDEX IF NOT EXISTS idx_oc_parcelas_vencimento ON oc_parcelas(status, data_vencimento)",
        "CREATE INDEX IF NOT EXISTS idx_oc_ov_links_oc ON oc_ov_links(oc_id)",
        "CREATE INDEX IF NOT EXISTS idx_oc_ov_links_ov ON oc_ov_links(ov_id)",
        "CREATE INDEX IF NOT EXISTS idx_link_items_oc_item ON oc_ov_link_items(oc_item_id)",
        "CREATE INDEX IF NOT EXISTS idx_link_items_ov ON oc_ov_link_items(ov_id)",
        "CREATE INDEX IF NOT EXISTS idx_link_items_oc ON oc_ov_link_items(oc_id)",
        "CREATE INDEX IF NOT EXISTS idx_anexos_entidade ON anexos(entidade_tipo, entidade_id)",
        "CREATE INDEX IF NOT EXISTS idx_audit_log_entidade ON audit_log(entidade_tipo, entidade_id)",
        "CREATE INDEX IF NOT EXISTS idx_proposta_log_proposta ON proposta_log(proposta_id)",
    ]
    for idx in indexes:
        c.execute(idx)

    # === MIGRATIONS (ALTER TABLE for existing databases) ===
    try:
        c.execute("ALTER TABLE cadastros ADD COLUMN regime_tributario TEXT")
    except sqlite3.OperationalError:
        pass  # column already exists

    for col in ['intermediario_id INTEGER', 'valor_bruto_venda REAL', 'valor_liquido_venda REAL', 'comissao_forma TEXT', 'intermediario_obs TEXT']:
        try:
            c.execute(f"ALTER TABLE propostas ADD COLUMN {col}")
        except sqlite3.OperationalError:
            pass  # column already exists

    try:
        c.execute("ALTER TABLE users ADD COLUMN must_change_password INTEGER DEFAULT 0")
    except sqlite3.OperationalError:
        pass  # column already exists

    # Migration: expand OV status to include workflow statuses
    # SQLite doesn't support ALTER CHECK, so we recreate by removing constraint via rename+copy
    try:
        existing_cols = [row[1] for row in c.execute("PRAGMA table_info(ordens_venda)").fetchall()]
        if existing_cols:
            # Check if migration needed by trying an invalid status
            # Simpler approach: just try inserting a test status; if constraint fails, migrate
            c.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='ordens_venda'")
            create_sql = c.fetchone()[0]
            if "'Aprovada','Cancelada'" in create_sql and "'Faturada'" not in create_sql:
                # Need migration: expand CHECK constraint
                c.execute("ALTER TABLE ordens_venda RENAME TO ordens_venda_old")
                c.execute('''CREATE TABLE ordens_venda (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    numero TEXT UNIQUE NOT NULL,
                    status TEXT DEFAULT 'Aprovada' CHECK(status IN ('Aprovada','Em Produção','Faturada','Despachada','Entregue','Cancelada')),
                    proposta_id INTEGER REFERENCES propostas(id),
                    cadastro_id INTEGER NOT NULL REFERENCES cadastros(id),
                    vendedor_id INTEGER NOT NULL REFERENCES users(id),
                    uf_destino TEXT,
                    icms_isento INTEGER DEFAULT 0,
                    numero_omie TEXT,
                    nota_fiscal TEXT,
                    data_emissao TEXT DEFAULT (datetime('now','localtime')),
                    data_entrega_prevista TEXT,
                    condicao_pagamento TEXT,
                    forma_pagamento TEXT DEFAULT 'Faturado',
                    dados_pagamento TEXT,
                    frete TEXT DEFAULT 'FOB',
                    transportadora TEXT,
                    valor_frete REAL,
                    obs_transporte TEXT,
                    observacoes TEXT,
                    obs_interna TEXT,
                    motivo_cancelamento TEXT,
                    cancelado_por INTEGER REFERENCES users(id),
                    cancelado_em TEXT,
                    created_at TEXT DEFAULT (datetime('now','localtime')),
                    updated_at TEXT DEFAULT (datetime('now','localtime'))
                )''')
                c.execute("""INSERT INTO ordens_venda SELECT * FROM ordens_venda_old""")
                c.execute("DROP TABLE ordens_venda_old")
                # Recreate indexes
                c.execute("CREATE INDEX IF NOT EXISTS idx_ov_vendedor ON ordens_venda(vendedor_id)")
                c.execute("CREATE INDEX IF NOT EXISTS idx_ov_cadastro ON ordens_venda(cadastro_id)")
                c.execute("CREATE INDEX IF NOT EXISTS idx_ov_data ON ordens_venda(data_emissao)")
                c.execute("CREATE INDEX IF NOT EXISTS idx_ov_status ON ordens_venda(status)")
    except Exception:
        pass

    # Migration: add nota_fiscal column to ordens_compra
    try:
        c.execute("ALTER TABLE ordens_compra ADD COLUMN nota_fiscal TEXT")
    except sqlite3.OperationalError:
        pass  # column already exists

    # === SEED DEFAULT CONFIGS ===
    defaults = {
        'pis_percentual': '9.25',
        'margem_minima_alerta': '15',
        'dias_inadimplencia_padrao': '30',
        'empresa_razao_social': 'A.B.M.T. EQUIPAMENTOS ELETRICOS LTDA',
        'empresa_cnpj': '17.820.873/0001-43',
        'empresa_ie': '127.185.387.111',
        'empresa_endereco': 'Rua Veneza, 431 — Jardim Campestre — Guarulhos/SP — CEP 07175-110',
        'empresa_telefone': '(11) 2545-7846',
        'empresa_site': 'www.abmt.com.br',
        'dados_bancarios': json.dumps({
            'banco': '',
            'agencia': '',
            'conta': '',
            'pix': '17.820.873/0001-43',
            'titular': 'A.B.M.T. EQUIPAMENTOS ELETRICOS LTDA'
        }),
        'politica_comercial': json.dumps([
            'Preços válidos para a quantidade e condições descritas nesta proposta',
            'Reserva de material mediante confirmação formal do pedido',
            'Prazo de entrega a partir da confirmação do pedido e liberação de crédito',
            'Material sujeito à disponibilidade em estoque',
            'Cancelamento após confirmação pode gerar cobrança de multa'
        ]),
        'icms_tabela': json.dumps({
            'SP': 18, 'MG': 7, 'ES': 7, 'BA': 7, 'SE': 7, 'AL': 7,
            'PE': 7, 'PB': 7, 'RN': 7, 'CE': 7, 'PI': 7, 'MA': 7,
            'PA': 7, 'AM': 7, 'RR': 7, 'AP': 7, 'AC': 7, 'RO': 7,
            'TO': 7, 'MT': 7, 'GO': 7, 'DF': 7, 'SC': 7,
            'PR': 12, 'RS': 12, 'RJ': 12, 'MS': 12
        }),
        'comissao_vendas': json.dumps({
            'gerente': {
                'Transformador Usado': 3.0, 'Transformador Novo': 2.0,
                'Bobinas de Aço Silício': 2.5, 'Chapas de Aço Silício': 2.5,
                'Chapas de Aço Silício Cortadas': 1.5,
                'Cobre': 0.5, 'Alumínio': 0.5, 'Óleo Isolante': 0.5
            },
            'vendedor': {
                'Transformador Usado': 2.5, 'Transformador Novo': 1.8,
                'Bobinas de Aço Silício': 2.0, 'Chapas de Aço Silício': 2.0,
                'Chapas de Aço Silício Cortadas': 1.3,
                'Cobre': 0.4, 'Alumínio': 0.4, 'Óleo Isolante': 0.4
            },
            'diretor': {
                'Transformador Usado': 3.0, 'Transformador Novo': 2.0,
                'Bobinas de Aço Silício': 2.5, 'Chapas de Aço Silício': 2.5,
                'Chapas de Aço Silício Cortadas': 1.5,
                'Cobre': 0.5, 'Alumínio': 0.5, 'Óleo Isolante': 0.5
            }
        }),
        'comissao_compras': json.dumps({
            'Pedro': 3.0, 'Thiago': 2.5, 'Guilherme': 3.0,
            'diferenca_gerente': 0.5
        }),
        'bonus_semanal': json.dumps({
            'meta_semanal': 50000, 'valor_bonus': 250
        }),
        'templates_condicoes': json.dumps({
            'prazo_entrega': '15 dias úteis',
            'garantia': '12 meses contra defeitos de fabricação',
            'frete': 'FOB'
        })
    }

    for chave, valor in defaults.items():
        c.execute('''INSERT OR IGNORE INTO configuracoes (chave, valor) VALUES (?, ?)''', (chave, valor))

    # Seed default users (must_change_password=1 forces password change on first login)
    from werkzeug.security import generate_password_hash
    default_users = [
        ('guilherme', 'abmt2026', 'Guilherme', 'diretor'),
        ('pedro', 'abmt2026', 'Pedro', 'gerente'),
        ('thiago', 'abmt2026', 'Thiago', 'vendedor'),
    ]
    for username, pwd, nome, perfil in default_users:
        c.execute('''INSERT OR IGNORE INTO users (username, password_hash, nome, perfil, must_change_password)
                     VALUES (?, ?, ?, ?, 1)''', (username, generate_password_hash(pwd), nome, perfil))

    conn.commit()
    conn.close()


def get_next_number(prefix, conn):
    """Gera próximo número sequencial (PROP-XXXX, OV-XXXX, OC-XXXX).
    OBRIGATÓRIO: conn já deve estar dentro de uma transação BEGIN IMMEDIATE.
    Não faz fallback silencioso — se não encontrar padrão, começa em 0001.
    """
    import re
    table_map = {'PROP': 'propostas', 'OV': 'ordens_venda', 'OC': 'ordens_compra'}
    if prefix not in table_map:
        raise ValueError(f"Prefixo inválido: {prefix}")
    table = table_map[prefix]
    row = conn.execute(
        f"SELECT numero FROM {table} ORDER BY id DESC LIMIT 1"
    ).fetchone()
    if row and row['numero']:
        match = re.search(r'(\d+)$', row['numero'])
        if match:
            next_num = int(match.group(1)) + 1
            last_prefix = row['numero'][:row['numero'].rfind(match.group(1))]
            return f"{last_prefix}{next_num:04d}"
    return f"{prefix}-0001"


def do_backup():
    """Create a timestamped backup of the database"""
    if not os.path.exists(DB_PATH):
        return
    os.makedirs(BACKUP_DIR, exist_ok=True)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_path = os.path.join(BACKUP_DIR, f'comercial_{timestamp}.db')
    shutil.copy2(DB_PATH, backup_path)

    # Rotate: keep last 30
    backups = sorted([f for f in os.listdir(BACKUP_DIR) if f.endswith('.db')])
    while len(backups) > 30:
        os.remove(os.path.join(BACKUP_DIR, backups.pop(0)))

    return backup_path


def check_backup_on_start():
    """Backup on server start if last backup was >6h ago"""
    os.makedirs(BACKUP_DIR, exist_ok=True)
    backups = sorted([f for f in os.listdir(BACKUP_DIR) if f.endswith('.db')])
    if not backups:
        do_backup()
        return
    last = backups[-1]
    # Parse timestamp from filename
    try:
        ts_str = last.replace('comercial_', '').replace('.db', '')
        last_time = datetime.strptime(ts_str, '%Y%m%d_%H%M%S')
        if datetime.now() - last_time > timedelta(hours=6):
            do_backup()
    except:
        do_backup()


def update_fts(tipo, entidade_id, texto):
    """Update FTS5 index — removes old entries before inserting to avoid duplicates"""
    conn = get_db()
    try:
        # Delete old entries for this entity (FTS5 content='' requires special delete syntax)
        old_rows = conn.execute(
            "SELECT rowid, tipo, entidade_id, texto FROM busca_global WHERE tipo=? AND entidade_id=?",
            (tipo, str(entidade_id))
        ).fetchall()
        for row in old_rows:
            conn.execute(
                "INSERT INTO busca_global(busca_global, rowid, tipo, entidade_id, texto) VALUES('delete', ?, ?, ?, ?)",
                (row['rowid'], row['tipo'], row['entidade_id'], row['texto'])
            )
        # Insert fresh entry
        conn.execute("INSERT INTO busca_global(tipo, entidade_id, texto) VALUES (?, ?, ?)",
                     (tipo, str(entidade_id), texto))
        conn.commit()
    finally:
        conn.close()
