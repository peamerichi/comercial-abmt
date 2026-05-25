"""
Seed script - Populates 1 month of realistic data for ABMT Commercial System
Uses real client names from the vendas CSV + generates typical ABMT transactions
"""
import sqlite3
import os
import json
import random
from datetime import datetime, timedelta
import hashlib

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'comercial.db')

def hash_pw(pw):
    return hashlib.sha256(pw.encode()).hexdigest()

def seed():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys=ON")
    c = conn.cursor()

    # Check if we already have seed data
    count = c.execute("SELECT COUNT(*) FROM propostas").fetchone()[0]
    if count > 5:
        print(f"Database already has {count} propostas. Skipping seed.")
        return

    # Real clients from vendas CSV
    clientes_venda = [
        ("31.671.149/0001-26", "R C DE QUEIROZ TRANSFORMADORES", "RC Queiroz", "SP", "Reformador de transformadores"),
        ("58.152.338/0002-20", "EXTRABASE MINERACAO LTDA", "Extrabase", "MG", "Indústria"),
        ("25.238.314/0001-58", "UDITRAFOS EQUIPAMENTOS ELETRICOS LTDA", "Uditrafos", "SP", "Reformador de transformadores"),
        ("00.130.132/0004-80", "IBRAP INDUSTRIA BRASILEIRA DE ALUMINIO E PLASTICOS SA", "Ibrap", "SP", "Indústria"),
        ("38.660.268/0001-22", "F C BRITO NERES ENGENHARIA & SERVICOS LTDA", "FC Brito", "PA", "Concessionária de energia"),
        ("12.706.289/0001-48", "USINA SERRA GRANDE SA", "Serra Grande", "GO", "Indústria"),
    ]

    # Additional fictitious clients
    clientes_extra = [
        ("44.111.222/0001-33", "ELETROTRAFOS INDUSTRIA LTDA", "Eletrotrafos", "MG", "Fabricante de transformadores"),
        ("55.222.333/0001-44", "METALURGICA SAO PAULO SA", "Metalurgica SP", "SP", "Indústria"),
        ("66.333.444/0001-55", "ENERGISA DISTRIBUICAO LTDA", "Energisa", "PB", "Concessionária de energia"),
        ("77.444.555/0001-66", "RECICLA METAIS EIRELI", "Recicla Metais", "PR", "Sucateiro / Reciclagem"),
        ("88.555.666/0001-77", "TRANSFORMADORES BRASIL LTDA", "Trans Brasil", "RJ", "Reformador de transformadores"),
        ("99.666.777/0001-88", "COOPERATIVA ENERGIA RURAL", "Coop Energia", "RS", "Concessionária de energia"),
    ]

    # Fornecedores (para compras)
    fornecedores = [
        ("11.222.333/0001-99", "SUCATA VALE DO PARAIBA LTDA", "Sucata VP", "SP", "Sucateiro / Reciclagem"),
        ("22.333.444/0001-11", "DESMANCHE INDUSTRIAL SA", "Desmanche Ind", "MG", "Sucateiro / Reciclagem"),
        ("33.444.555/0001-22", "TRANSFORMADORES DESCARTE LTDA", "Trans Descarte", "RJ", "Reformador de transformadores"),
        ("44.555.666/0001-33", "ACEARIA NACIONAL LTDA", "Acearia Nacional", "SP", "Indústria"),
    ]

    all_clientes = clientes_venda + clientes_extra + fornecedores

    # Insert all cadastros
    cadastro_ids = {}
    for cnpj, razao, fantasia, uf, segmento in all_clientes:
        try:
            c.execute("""INSERT INTO cadastros (cnpj_cpf, tipo_pessoa, razao_social, nome_fantasia,
                endereco_cidade, endereco_uf, segmento, contato_nome, contato_whatsapp)
                VALUES (?,?,?,?,?,?,?,?,?)""",
                (cnpj, 'PJ', razao, fantasia, f"Cidade-{uf}", uf, segmento,
                 f"Contato {fantasia}", f"11999{random.randint(100000,999999)}"))
            cadastro_ids[cnpj] = c.lastrowid
        except sqlite3.IntegrityError:
            row = c.execute("SELECT id FROM cadastros WHERE cnpj_cpf=?", (cnpj,)).fetchone()
            if row:
                cadastro_ids[cnpj] = row[0]

    # Users
    users = c.execute("SELECT id, nome, perfil FROM users WHERE ativo=1").fetchall()
    user_map = {u['nome']: u['id'] for u in users}
    vendedores = [u for u in users if u['perfil'] in ('vendedor', 'gerente')]
    if not vendedores:
        vendedores = [users[0]] if users else []

    # ICMS table
    icms_tabela = {"AC":7,"AL":7,"AM":7,"AP":7,"BA":7,"CE":7,"DF":7,"ES":7,"GO":7,
        "MA":7,"MG":12,"MS":7,"MT":7,"PA":7,"PB":7,"PE":7,"PI":7,"PR":12,
        "RJ":12,"RN":7,"RO":7,"RR":7,"RS":12,"SC":12,"SE":7,"SP":18,"TO":7}
    pis_pct = 9.25

    # Helper to create proposal number
    prop_counter = [1]
    def next_prop_num(tipo):
        num = f"PROP-{'V' if tipo=='VENDA' else 'C'}-2026-{prop_counter[0]:04d}"
        prop_counter[0] += 1
        return num

    ov_counter = [1]
    def next_ov_num():
        num = f"OV-2026-{ov_counter[0]:04d}"
        ov_counter[0] += 1
        return num

    oc_counter = [1]
    def next_oc_num():
        num = f"OC-2026-{oc_counter[0]:04d}"
        oc_counter[0] += 1
        return num

    # === GENERATE VENDAS (April + May 2026 - real data + extras) ===
    vendas_data = [
        # From real CSV - April
        {"cliente": "31.671.149/0001-26", "valor": 56000, "data": "2026-04-30", "vendedor": "Pedro",
         "cat": "Chapas de Aço Silício", "qtd": 8000, "un": "KG", "preco": 7.00},
        {"cliente": "58.152.338/0002-20", "valor": 86000, "data": "2026-04-30", "vendedor": "Pedro",
         "cat": "Transformador Usado", "qtd": 500, "un": "KVA", "preco": 172.00},
        {"cliente": "25.238.314/0001-58", "valor": 155000, "data": "2026-04-30", "vendedor": "Pedro",
         "cat": "Transformador Usado", "qtd": 1000, "un": "KVA", "preco": 155.00},
        {"cliente": "00.130.132/0004-80", "valor": 540000, "data": "2026-04-24", "vendedor": "Pedro",
         "cat": "Alumínio", "qtd": 60000, "un": "KG", "preco": 9.00},
        {"cliente": "38.660.268/0001-22", "valor": 35400, "data": "2026-04-23", "vendedor": "Pedro",
         "cat": "Transformador Usado", "qtd": 300, "un": "KVA", "preco": 118.00},
        {"cliente": "12.706.289/0001-48", "valor": 208000, "data": "2026-04-27", "vendedor": "Pedro",
         "cat": "Transformador Novo", "qtd": 2000, "un": "KVA", "preco": 104.00},
        # Extra vendas - April
        {"cliente": "44.111.222/0001-33", "valor": 45000, "data": "2026-04-05", "vendedor": "Pedro",
         "cat": "Bobinas de Aço Silício", "qtd": 3000, "un": "KG", "preco": 15.00},
        {"cliente": "55.222.333/0001-44", "valor": 28000, "data": "2026-04-08", "vendedor": "Pedro",
         "cat": "Cobre", "qtd": 400, "un": "KG", "preco": 70.00},
        {"cliente": "66.333.444/0001-55", "valor": 95000, "data": "2026-04-10", "vendedor": "Pedro",
         "cat": "Transformador Usado", "qtd": 750, "un": "KVA", "preco": 126.67},
        {"cliente": "77.444.555/0001-66", "valor": 18500, "data": "2026-04-12", "vendedor": "Pedro",
         "cat": "Óleo Isolante", "qtd": 5000, "un": "LITRO", "preco": 3.70},
        {"cliente": "88.555.666/0001-77", "valor": 72000, "data": "2026-04-15", "vendedor": "Pedro",
         "cat": "Caixa e Núcleo", "qtd": 500, "un": "KVA", "preco": 144.00},
        {"cliente": "99.666.777/0001-88", "valor": 32000, "data": "2026-04-18", "vendedor": "Pedro",
         "cat": "Transformador Usado", "qtd": 225, "un": "KVA", "preco": 142.22},
        {"cliente": "44.111.222/0001-33", "valor": 15000, "data": "2026-04-20", "vendedor": "Pedro",
         "cat": "Radiadores", "qtd": 10, "un": "UNIDADE", "preco": 1500.00},
        # May 2026 vendas (mês atual)
        {"cliente": "31.671.149/0001-26", "valor": 48000, "data": "2026-05-02", "vendedor": "Pedro",
         "cat": "Transformador Usado", "qtd": 300, "un": "KVA", "preco": 160.00},
        {"cliente": "00.130.132/0004-80", "valor": 315000, "data": "2026-05-05", "vendedor": "Pedro",
         "cat": "Alumínio", "qtd": 35000, "un": "KG", "preco": 9.00},
        {"cliente": "66.333.444/0001-55", "valor": 78000, "data": "2026-05-07", "vendedor": "Pedro",
         "cat": "Transformador Usado", "qtd": 500, "un": "KVA", "preco": 156.00},
        {"cliente": "88.555.666/0001-77", "valor": 42000, "data": "2026-05-09", "vendedor": "Pedro",
         "cat": "Chapas de Aço Silício", "qtd": 6000, "un": "KG", "preco": 7.00},
        {"cliente": "25.238.314/0001-58", "valor": 67500, "data": "2026-05-12", "vendedor": "Pedro",
         "cat": "Transformador Usado", "qtd": 450, "un": "KVA", "preco": 150.00},
        {"cliente": "12.706.289/0001-48", "valor": 52000, "data": "2026-05-14", "vendedor": "Pedro",
         "cat": "Cobre", "qtd": 800, "un": "KG", "preco": 65.00},
    ]

    # Propostas perdidas
    perdas_data = [
        {"cliente": "55.222.333/0001-44", "valor": 120000, "data": "2026-04-03", "vendedor": "Pedro",
         "cat": "Transformador Usado", "qtd": 1500, "un": "KVA", "preco": 80.00, "motivo": "Preço alto"},
        {"cliente": "66.333.444/0001-55", "valor": 45000, "data": "2026-04-14", "vendedor": "Pedro",
         "cat": "Chapas de Aço Silício", "qtd": 5000, "un": "KG", "preco": 9.00, "motivo": "Fechou com concorrente"},
    ]

    # Compras
    compras_data = [
        {"cliente": "11.222.333/0001-99", "valor": 35000, "data": "2026-04-02", "vendedor": "Pedro",
         "cat": "Transformador Usado", "qtd": 500, "un": "KVA", "preco": 70.00,
         "carregamento": "Munck ABMT", "endereco": "Rua das Indústrias, 500 - Taubaté/SP"},
        {"cliente": "22.333.444/0001-11", "valor": 22000, "data": "2026-04-07", "vendedor": "Pedro",
         "cat": "Cobre", "qtd": 1000, "un": "KG", "preco": 22.00,
         "carregamento": "Fornecedor carrega", "endereco": "Av. Brasil, 1200 - Juiz de Fora/MG"},
        {"cliente": "33.444.555/0001-22", "valor": 85000, "data": "2026-04-11", "vendedor": "Pedro",
         "cat": "Transformador Usado", "qtd": 1500, "un": "KVA", "preco": 56.67,
         "carregamento": "Contratar frete", "endereco": "Rod. Presidente Dutra, km 200 - Volta Redonda/RJ"},
        {"cliente": "44.555.666/0001-33", "valor": 48000, "data": "2026-04-16", "vendedor": "Pedro",
         "cat": "Chapas de Aço Silício", "qtd": 12000, "un": "KG", "preco": 4.00,
         "carregamento": "Munck ABMT", "endereco": "Rua Siderúrgica, 800 - Pindamonhangaba/SP"},
        {"cliente": "11.222.333/0001-99", "valor": 15000, "data": "2026-04-22", "vendedor": "Pedro",
         "cat": "Óleo Isolante", "qtd": 10000, "un": "LITRO", "preco": 1.50,
         "carregamento": "Caminhão ABMT", "endereco": "Rua das Indústrias, 500 - Taubaté/SP"},
        # May 2026 compras (mês atual)
        {"cliente": "11.222.333/0001-99", "valor": 42000, "data": "2026-05-03", "vendedor": "Pedro",
         "cat": "Transformador Usado", "qtd": 600, "un": "KVA", "preco": 70.00,
         "carregamento": "Munck ABMT", "endereco": "Rua das Indústrias, 500 - Taubaté/SP"},
        {"cliente": "33.444.555/0001-22", "valor": 28000, "data": "2026-05-08", "vendedor": "Pedro",
         "cat": "Cobre", "qtd": 1400, "un": "KG", "preco": 20.00,
         "carregamento": "Fornecedor carrega", "endereco": "Rod. Presidente Dutra, km 200 - Volta Redonda/RJ"},
        {"cliente": "44.555.666/0001-33", "valor": 36000, "data": "2026-05-13", "vendedor": "Pedro",
         "cat": "Chapas de Aço Silício", "qtd": 9000, "un": "KG", "preco": 4.00,
         "carregamento": "Contratar frete", "endereco": "Rua Siderúrgica, 800 - Pindamonhangaba/SP"},
    ]

    # Create all vendas propostas (as Convertida + OVs)
    for v in vendas_data:
        cid = cadastro_ids.get(v["cliente"])
        if not cid:
            continue
        vid = user_map.get(v["vendedor"], vendedores[0]['id'] if vendedores else 1)
        uf_row = c.execute("SELECT endereco_uf FROM cadastros WHERE id=?", (cid,)).fetchone()
        uf = uf_row['endereco_uf'] if uf_row else 'SP'
        icms_pct = icms_tabela.get(uf, 0)

        valor_bruto = v["valor"]
        pis_val = valor_bruto * pis_pct / 100
        icms_val = valor_bruto * icms_pct / 100
        valor_liq = valor_bruto - pis_val - icms_val

        numero = next_prop_num('VENDA')
        data_emissao = v["data"]
        data_exp = (datetime.strptime(data_emissao, '%Y-%m-%d') + timedelta(days=7)).strftime('%Y-%m-%d')

        # Create proposta (status Convertida)
        c.execute("""INSERT INTO propostas (numero, tipo, status, cadastro_id, vendedor_id,
            data_emissao, data_expiracao, uf_destino, icms_isento,
            forma_pagamento, frete, incluir_dados_bancarios, incluir_politica, mostrar_impostos,
            validade_dias) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (numero, 'VENDA', 'Convertida', cid, vid,
             data_emissao, data_exp, uf, 0,
             'Faturado', 'FOB', 0, 0, 1, 7))
        prop_id = c.lastrowid

        # Proposta item
        specs = {}
        if 'Transformador' in v["cat"]:
            specs = {"tipo": "Trifásico", "potencia": str(int(v["qtd"])), "tensao_alta": "15",
                     "tensao_baixa": "380/220", "nucleo": "Envolvente", "oleo": "Com óleo"}
        elif v["cat"] == "Bobinas de Aço Silício":
            specs = {"tipo_aco": "GO", "largura": "100", "espessura": "0.27"}
        elif 'Chapas' in v["cat"]:
            specs = {"tipo_aco": "GO", "espessura": "0.30"}
        elif v["cat"] == "Cobre":
            specs = {"tipo_cobre": "Mel"}
        elif v["cat"] == "Alumínio":
            specs = {"tipo_aluminio": "Bloco"}
        elif v["cat"] == "Óleo Isolante":
            specs = {"estado_oleo": "Usado"}

        peso_unit = 0
        peso_total = 0
        if v["un"] == "KG":
            peso_total = v["qtd"]
        elif v["un"] == "KVA":
            peso_unit = v["qtd"] * 3.5  # rough estimate
            peso_total = peso_unit

        c.execute("""INSERT INTO proposta_items (proposta_id, ordem, categoria, campos_especificos,
            quantidade, unidade, valor_unitario, valor_total, peso_unitario, peso_total)
            VALUES (?,?,?,?,?,?,?,?,?,?)""",
            (prop_id, 1, v["cat"], json.dumps(specs),
             v["qtd"], v["un"], v["preco"], valor_bruto, peso_unit, peso_total))

        # Log
        c.execute("INSERT INTO proposta_log (proposta_id, user_id, acao, detalhes) VALUES (?,?,?,?)",
            (prop_id, vid, 'Criação', f'Proposta criada'))
        c.execute("INSERT INTO proposta_log (proposta_id, user_id, acao, detalhes) VALUES (?,?,?,?)",
            (prop_id, vid, 'Status → Convertida', f'Convertida para OV'))

        # Create OV
        ov_num = next_ov_num()
        c.execute("""INSERT INTO ordens_venda (numero, proposta_id, cadastro_id, vendedor_id,
            data_emissao, status, uf_destino, forma_pagamento, frete)
            VALUES (?,?,?,?,?,?,?,?,?)""",
            (ov_num, prop_id, cid, vid, data_emissao, 'Faturada',
             uf, 'Faturado', 'FOB'))
        ov_id = c.lastrowid

        # OV items
        c.execute("""INSERT INTO ov_items (ov_id, ordem, categoria, campos_especificos,
            quantidade, unidade, valor_unitario, valor_total, peso_unitario, peso_total,
            comissao_percentual, comissao_valor)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)""",
            (ov_id, 1, v["cat"], json.dumps(specs),
             v["qtd"], v["un"], v["preco"], valor_bruto, peso_unit, peso_total,
             2.5, valor_bruto * 0.025))

        # Update proposta with OV reference
        c.execute("UPDATE propostas SET ordem_gerada_id=?, ordem_gerada_tipo='OV' WHERE id=?", (ov_id, prop_id))

        # Parcelas (30/60/90 dias)
        n_parcelas = random.choice([1, 2, 3])
        dias_parcela = {1: [0], 2: [30, 60], 3: [30, 60, 90]}[n_parcelas]
        for ip, dp in enumerate(dias_parcela):
            dt_venc = (datetime.strptime(data_emissao, '%Y-%m-%d') + timedelta(days=dp)).strftime('%Y-%m-%d')
            val_parcela = valor_bruto / n_parcelas
            # Some parcels are paid, some pending
            status_p = 'Paga' if dp <= 30 and v["data"] < "2026-04-20" else 'Pendente'
            if dp == 0:
                status_p = 'Paga'
            c.execute("""INSERT INTO ov_parcelas (ov_id, numero_parcela, total_parcelas,
                valor, data_vencimento, status) VALUES (?,?,?,?,?,?)""",
                (ov_id, ip+1, n_parcelas, val_parcela, dt_venc, status_p))

    # Create perdas
    for p in perdas_data:
        cid = cadastro_ids.get(p["cliente"])
        if not cid:
            continue
        vid = user_map.get(p["vendedor"], vendedores[0]['id'] if vendedores else 1)
        numero = next_prop_num('VENDA')
        c.execute("""INSERT INTO propostas (numero, tipo, status, cadastro_id, vendedor_id,
            data_emissao, data_expiracao, uf_destino,
            forma_pagamento, frete, motivo_perda, validade_dias)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)""",
            (numero, 'VENDA', 'Perdida', cid, vid,
             p["data"], p["data"], 'SP',
             'Faturado', 'FOB', p["motivo"], 7))
        prop_id = c.lastrowid
        c.execute("""INSERT INTO proposta_items (proposta_id, ordem, categoria, campos_especificos,
            quantidade, unidade, valor_unitario, valor_total) VALUES (?,?,?,?,?,?,?,?)""",
            (prop_id, 1, p["cat"], '{}', p["qtd"], p["un"], p["preco"], p["valor"]))

    # Create compras (OCs)
    for co in compras_data:
        cid = cadastro_ids.get(co["cliente"])
        if not cid:
            continue
        vid = user_map.get(co["vendedor"], vendedores[0]['id'] if vendedores else 1)
        numero_p = next_prop_num('COMPRA')
        c.execute("""INSERT INTO propostas (numero, tipo, status, cadastro_id, vendedor_id,
            data_emissao, data_expiracao, forma_pagamento, frete,
            obs_transporte, validade_dias) VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
            (numero_p, 'COMPRA', 'Convertida', cid, vid,
             co["data"], co["data"], 'PIX', 'FOB',
             f"Carregamento: {co['carregamento']} | Endereço: {co['endereco']}", 7))
        prop_id = c.lastrowid

        specs = {}
        if 'Transformador' in co["cat"]:
            specs = {"tipo": "Trifásico", "potencia": str(int(co["qtd"]))}
        c.execute("""INSERT INTO proposta_items (proposta_id, ordem, categoria, campos_especificos,
            quantidade, unidade, valor_unitario, valor_total) VALUES (?,?,?,?,?,?,?,?)""",
            (prop_id, 1, co["cat"], json.dumps(specs), co["qtd"], co["un"], co["preco"], co["valor"]))

        # Create OC
        oc_num = next_oc_num()
        c.execute("""INSERT INTO ordens_compra (numero, proposta_id, cadastro_id, comprador_id,
            data_emissao, status, forma_pagamento, frete)
            VALUES (?,?,?,?,?,?,?,?)""",
            (oc_num, prop_id, cid, vid, co["data"], 'Recebida Total', 'PIX', 'FOB'))
        oc_id = c.lastrowid

        c.execute("""INSERT INTO oc_items (oc_id, ordem, categoria, campos_especificos,
            quantidade, unidade, valor_unitario, valor_total) VALUES (?,?,?,?,?,?,?,?)""",
            (oc_id, 1, co["cat"], json.dumps(specs), co["qtd"], co["un"], co["preco"], co["valor"]))

        c.execute("UPDATE propostas SET ordem_gerada_id=?, ordem_gerada_tipo='OC' WHERE id=?", (oc_id, prop_id))

    # Create some open propostas (not yet converted)
    open_props = [
        {"cliente": "55.222.333/0001-44", "tipo": "VENDA", "status": "Enviada", "data": "2026-05-10",
         "cat": "Transformador Usado", "qtd": 750, "preco": 130, "un": "KVA"},
        {"cliente": "99.666.777/0001-88", "tipo": "VENDA", "status": "Em Negociação", "data": "2026-05-12",
         "cat": "Chapas de Aço Silício", "qtd": 6000, "preco": 8.50, "un": "KG"},
        {"cliente": "44.111.222/0001-33", "tipo": "VENDA", "status": "Rascunho", "data": "2026-05-15",
         "cat": "Bobinas de Aço Silício", "qtd": 4000, "preco": 16, "un": "KG"},
        {"cliente": "22.333.444/0001-11", "tipo": "COMPRA", "status": "Enviada", "data": "2026-05-14",
         "cat": "Cobre", "qtd": 2000, "preco": 20, "un": "KG"},
    ]

    for op in open_props:
        cid = cadastro_ids.get(op["cliente"])
        if not cid:
            continue
        vid = vendedores[0]['id'] if vendedores else 1
        valor = op["qtd"] * op["preco"]
        numero = next_prop_num(op["tipo"])
        data_exp = (datetime.strptime(op["data"], '%Y-%m-%d') + timedelta(days=7)).strftime('%Y-%m-%d')

        c.execute("""INSERT INTO propostas (numero, tipo, status, cadastro_id, vendedor_id,
            data_emissao, data_expiracao, forma_pagamento, frete, validade_dias)
            VALUES (?,?,?,?,?,?,?,?,?,?)""",
            (numero, op["tipo"], op["status"], cid, vid, op["data"], data_exp, 'Faturado', 'FOB', 7))
        prop_id = c.lastrowid

        c.execute("""INSERT INTO proposta_items (proposta_id, ordem, categoria, campos_especificos,
            quantidade, unidade, valor_unitario, valor_total) VALUES (?,?,?,?,?,?,?,?)""",
            (prop_id, 1, op["cat"], '{}', op["qtd"], op["un"], op["preco"], valor))

    # Follow-ups
    followups = [
        ("Ligar para Uditrafos sobre proposta de trafo 1000kVA", "2026-05-16 10:00", 0),
        ("Enviar catálogo chapas para Metalurgica SP", "2026-05-16 14:00", 0),
        ("Cobrar pagamento Extrabase - parcela vencida", "2026-05-17 09:00", 0),
        ("Visitar Ibrap para proposta de alumínio", "2026-05-19 08:00", 0),
        ("Retornar Energisa sobre trafo 750kVA", "2026-05-14 10:00", 0),
    ]
    vid = vendedores[0]['id'] if vendedores else 1
    for acao, dt, feito in followups:
        c.execute("INSERT INTO followups (user_id, acao, data_hora, concluido) VALUES (?,?,?,?)",
            (vid, acao, dt, feito))

    # Notas
    notas = [
        ("Reunião Ibrap", "Ibrap quer fechar 100 ton de alumínio em junho. Preço referência R$9/kg. Verificar estoque."),
        ("Cotação chapas GO", "Preço de compra caiu para R$4/kg. Margem boa acima de R$7/kg na venda."),
        ("Fornecedor novo - Volta Redonda", "Trans Descarte tem lote de 5 trafos usados. Total ~3000 kVA. Ir visitar semana que vem."),
    ]
    for titulo, conteudo in notas:
        c.execute("INSERT INTO notas (user_id, titulo, conteudo) VALUES (?,?,?)", (vid, titulo, conteudo))

    conn.commit()
    conn.close()
    print("Seed completo!")
    print(f"   - {len(vendas_data)} vendas convertidas (OVs)")
    print(f"   - {len(perdas_data)} propostas perdidas")
    print(f"   - {len(compras_data)} compras convertidas (OCs)")
    print(f"   - {len(open_props)} propostas em aberto")
    print(f"   - {len(all_clientes)} cadastros")
    print(f"   - {len(followups)} follow-ups")
    print(f"   - {len(notas)} notas")

if __name__ == '__main__':
    seed()
