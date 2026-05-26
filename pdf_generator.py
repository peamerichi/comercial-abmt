"""
PDF Generator for ABMT Commercial Proposals and Purchase Orders
Uses reportlab for PDF generation
"""
import os
import json
from datetime import datetime, timedelta

try:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import mm, cm
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
    from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
    HAS_REPORTLAB = True
except ImportError:
    HAS_REPORTLAB = False

from database import get_db


def format_money(value):
    if value is None:
        return "0,00"
    return f"{value:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def format_date(date_str):
    if not date_str:
        return "-"
    try:
        dt = datetime.strptime(date_str[:10], '%Y-%m-%d')
        return dt.strftime('%d/%m/%Y')
    except:
        return date_str


def generate_proposta_pdf(proposta_id):
    """Generate PDF for a commercial proposal"""
    if not HAS_REPORTLAB:
        return None, "reportlab não instalado. Execute: pip install reportlab"

    conn = get_db()
    prop = conn.execute("""SELECT p.*, c.razao_social, c.nome_fantasia, c.cnpj_cpf,
        c.endereco_rua, c.endereco_numero, c.endereco_bairro, c.endereco_cidade, c.endereco_uf,
        c.endereco_cep, c.contato_nome, c.contato_telefone, u.nome as vendedor_nome
        FROM propostas p LEFT JOIN cadastros c ON p.cadastro_id=c.id
        LEFT JOIN users u ON p.vendedor_id=u.id WHERE p.id=?""", (proposta_id,)).fetchone()

    if not prop:
        conn.close()
        return None, "Proposta não encontrada"

    items = conn.execute("SELECT * FROM proposta_items WHERE proposta_id=? ORDER BY ordem", (proposta_id,)).fetchall()

    # Get config
    configs = {}
    for row in conn.execute("SELECT chave, valor FROM configuracoes").fetchall():
        configs[row['chave']] = row['valor']
    conn.close()

    # Generate PDF
    pdf_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads', 'pdfs')
    os.makedirs(pdf_dir, exist_ok=True)
    filename = f"{prop['numero'].replace('-', '_')}.pdf"
    filepath = os.path.join(pdf_dir, filename)

    doc = SimpleDocTemplate(filepath, pagesize=A4,
                           leftMargin=20*mm, rightMargin=20*mm,
                           topMargin=15*mm, bottomMargin=20*mm)

    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name='Title2', fontSize=16, fontName='Helvetica-Bold', spaceAfter=4*mm))
    styles.add(ParagraphStyle(name='Subtitle', fontSize=10, textColor=colors.grey, spaceAfter=6*mm))
    styles.add(ParagraphStyle(name='SectionTitle', fontSize=11, fontName='Helvetica-Bold', spaceAfter=3*mm, spaceBefore=5*mm))
    styles.add(ParagraphStyle(name='Small', fontSize=9, textColor=colors.grey))
    styles.add(ParagraphStyle(name='Right', fontSize=10, alignment=TA_RIGHT))
    styles.add(ParagraphStyle(name='BigTotal', fontSize=14, fontName='Helvetica-Bold', alignment=TA_RIGHT))

    elements = []

    # Header with logo
    logo_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'img', 'logo_abmt_transparent.png')
    if os.path.exists(logo_path):
        try:
            logo = Image(logo_path, width=50*mm, height=16*mm)
            header_data = [[
                logo,
                [Paragraph(f"PROPOSTA COMERCIAL Nº {prop['numero']}", styles['Title2']),
                 Paragraph(f"Data: {format_date(prop['data_emissao'])} — Válida até {format_date(prop['data_expiracao'])}", styles['Subtitle'])]
            ]]
            header_table = Table(header_data, colWidths=[55*mm, 115*mm])
            header_table.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('PADDING', (0, 0), (-1, -1), 0),
            ]))
            elements.append(header_table)
        except:
            elements.append(Paragraph(f"PROPOSTA COMERCIAL Nº {prop['numero']}", styles['Title2']))
            elements.append(Paragraph(f"Data: {format_date(prop['data_emissao'])} — Válida até {format_date(prop['data_expiracao'])}", styles['Subtitle']))
    else:
        elements.append(Paragraph(f"PROPOSTA COMERCIAL Nº {prop['numero']}", styles['Title2']))
        elements.append(Paragraph(f"Data: {format_date(prop['data_emissao'])} — Válida até {format_date(prop['data_expiracao'])}", styles['Subtitle']))

    # Client info
    elements.append(Paragraph("DESTINATÁRIO", styles['SectionTitle']))
    client_data = [
        [Paragraph(f"<b>{prop['razao_social'] or ''}</b>", styles['Normal'])],
        [Paragraph(f"CNPJ/CPF: {prop['cnpj_cpf'] or ''}", styles['Small'])],
        [Paragraph(f"{prop['endereco_rua'] or ''} {prop['endereco_numero'] or ''}, {prop['endereco_bairro'] or ''} — {prop['endereco_cidade'] or ''}/{prop['endereco_uf'] or ''}", styles['Small'])],
        [Paragraph(f"Contato: {prop['contato_nome'] or ''} — {prop['contato_telefone'] or ''}", styles['Small'])],
    ]
    t = Table(client_data, colWidths=[170*mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.Color(0.1, 0.12, 0.15)),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.white),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 5*mm))

    # Items table
    elements.append(Paragraph("ITENS", styles['SectionTitle']))
    table_data = [['Item', 'Descrição', 'Qtd', 'Un', 'Valor Unit.', 'Total']]

    total_valor = 0
    total_peso = 0
    for i, item in enumerate(items, 1):
        specs = json.loads(item['campos_especificos'] or '{}')
        desc_parts = [item['categoria']]
        if item['descricao_complementar']:
            desc_parts.append(item['descricao_complementar'])
        # Add key specs
        for key in ['potencia', 'tipo', 'tipo_aco', 'espessura', 'marca', 'tensao_alta', 'tensao_baixa']:
            if specs.get(key):
                desc_parts.append(f"{key}: {specs[key]}")
        # Add embalagem info
        if specs.get('embalagem_tipo') and specs.get('embalagem_custo_total'):
            desc_parts.append(f"Embalagem: {specs.get('embalagem_qtd', 0)}× {specs['embalagem_tipo']} (R$ {format_money(specs['embalagem_custo_total'])})")

        table_data.append([
            str(i),
            Paragraph('<br/>'.join([desc_parts[0]] + [f"<font size=8 color='grey'>{' · '.join(desc_parts[1:])}</font>"] if len(desc_parts) > 1 else desc_parts), styles['Normal']),
            f"{item['quantidade']:.0f}" if item['quantidade'] == int(item['quantidade']) else f"{item['quantidade']:.2f}",
            item['unidade'],
            f"R$ {format_money(item['valor_unitario'])}",
            f"R$ {format_money(item['valor_total'])}"
        ])
        total_valor += (item['valor_total'] or 0)
        total_peso += (item['peso_total'] or 0)

    col_widths = [10*mm, 70*mm, 18*mm, 15*mm, 28*mm, 29*mm]
    t = Table(table_data, colWidths=col_widths)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.Color(0.15, 0.18, 0.22)),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('ALIGN', (2, 0), (-1, -1), 'RIGHT'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.Color(0.3, 0.3, 0.3)),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 3*mm))

    # Totals
    elements.append(Paragraph(f"Peso total: {format_money(total_peso)} kg", styles['Small']))
    elements.append(Spacer(1, 2*mm))
    elements.append(Paragraph(f"VALOR TOTAL: R$ {format_money(total_valor)}", styles['BigTotal']))

    # Taxes (if showing)
    if prop['tipo'] == 'VENDA' and prop['mostrar_impostos']:
        pis_pct = float(configs.get('pis_percentual', 9.25))
        icms_tabela = json.loads(configs.get('icms_tabela', '{}'))
        uf = prop['uf_destino'] or prop['endereco_uf'] or 'SP'
        icms_pct = 0 if (uf == 'SP' and prop['icms_isento']) else icms_tabela.get(uf, 0)
        pis_val = total_valor * pis_pct / 100
        icms_val = total_valor * icms_pct / 100

        elements.append(Spacer(1, 3*mm))
        elements.append(Paragraph(f"PIS ({pis_pct}%): R$ {format_money(pis_val)}", styles['Right']))
        elements.append(Paragraph(f"ICMS ({icms_pct}% — {uf}): R$ {format_money(icms_val)}", styles['Right']))
        elements.append(Paragraph(f"Valor Líquido: R$ {format_money(total_valor - pis_val - icms_val)}", styles['Right']))

    # Payment conditions
    elements.append(Spacer(1, 5*mm))
    elements.append(Paragraph("CONDIÇÕES", styles['SectionTitle']))
    cond_items = []
    if prop['forma_pagamento']:
        cond_items.append(f"Pagamento: {prop['forma_pagamento']}")

    # Parse condicao_pagamento and show installment schedule
    try:
        cond_json = json.loads(prop['condicao_pagamento'] or '{}')
        cond_tipo = cond_json.get('tipo', '')
    except:
        cond_tipo = ''

    if cond_tipo and cond_tipo != 'Personalizado':
        cond_items.append(f"Condição: {cond_tipo}")

    if prop['frete']:
        frete_text = f"Frete: {prop['frete']}"
        if prop['transportadora']:
            frete_text += f" ({prop['transportadora']})"
        cond_items.append(frete_text)
    if prop['prazo_entrega']:
        cond_items.append(f"Prazo de entrega: {prop['prazo_entrega']}")
    if prop['obs_cliente']:
        cond_items.append(f"Obs: {prop['obs_cliente']}")

    for item in cond_items:
        elements.append(Paragraph(f"• {item}", styles['Normal']))

    # Payment schedule table
    if cond_tipo and cond_tipo not in ('Personalizado', 'À vista'):
        dias_str = cond_tipo.replace(' dias', '').split('/')
        dias = [int(d) for d in dias_str if d.strip().isdigit()]
        if dias:
            try:
                data_base = datetime.strptime(prop['data_emissao'][:10], '%Y-%m-%d')
            except:
                data_base = datetime.now()
            valor_parcela = total_valor / len(dias) if len(dias) > 0 else 0

            elements.append(Spacer(1, 3*mm))
            parcela_data = [['Parcela', 'Vencimento', 'Dias', 'Valor']]
            for i, d in enumerate(dias):
                dt_venc = data_base + timedelta(days=d)
                parcela_data.append([
                    f"{i+1}/{len(dias)}",
                    dt_venc.strftime('%d/%m/%Y'),
                    f"{d} dias",
                    f"R$ {format_money(valor_parcela)}"
                ])
            parcela_data.append(['', '', Paragraph('<b>Total</b>', styles['Normal']), Paragraph(f"<b>R$ {format_money(total_valor)}</b>", styles['Normal'])])

            parcela_widths = [22*mm, 35*mm, 22*mm, 40*mm]
            pt = Table(parcela_data, colWidths=parcela_widths)
            pt.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.Color(0.15, 0.18, 0.22)),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('ALIGN', (0, 0), (0, -1), 'CENTER'),
                ('ALIGN', (2, 0), (2, -1), 'CENTER'),
                ('ALIGN', (3, 0), (3, -1), 'RIGHT'),
                ('GRID', (0, 0), (-1, -2), 0.5, colors.Color(0.3, 0.3, 0.3)),
                ('LINEABOVE', (0, -1), (-1, -1), 1.5, colors.Color(0.2, 0.2, 0.2)),
                ('PADDING', (0, 0), (-1, -1), 5),
                ('BACKGROUND', (0, -1), (-1, -1), colors.Color(0.95, 0.95, 0.95)),
            ]))
            elements.append(pt)
    elif cond_tipo == 'À vista':
        elements.append(Spacer(1, 2*mm))
        elements.append(Paragraph(f"Pagamento à vista — R$ {format_money(total_valor)}", styles['Normal']))

    # Bank details (optional)
    if prop['incluir_dados_bancarios']:
        elements.append(Spacer(1, 5*mm))
        elements.append(Paragraph("DADOS PARA PAGAMENTO", styles['SectionTitle']))
        banco = json.loads(configs.get('dados_bancarios', '{}'))
        if banco.get('banco'):
            elements.append(Paragraph(f"Banco: {banco['banco']} — Ag: {banco.get('agencia','')} — CC: {banco.get('conta','')}", styles['Normal']))
        if banco.get('pix'):
            elements.append(Paragraph(f"PIX: {banco['pix']}", styles['Normal']))
        if banco.get('titular'):
            elements.append(Paragraph(f"Titular: {banco['titular']}", styles['Small']))

    # Commercial policy (optional)
    if prop['incluir_politica']:
        politica = json.loads(configs.get('politica_comercial', '[]'))
        if politica:
            elements.append(Spacer(1, 5*mm))
            elements.append(Paragraph("POLÍTICA COMERCIAL", styles['SectionTitle']))
            for clausula in politica:
                elements.append(Paragraph(f"• {clausula}", styles['Small']))

    # Footer
    elements.append(Spacer(1, 10*mm))
    elements.append(Paragraph("_" * 60, styles['Normal']))
    elements.append(Paragraph("De acordo: _______________________________________________", styles['Normal']))
    elements.append(Spacer(1, 5*mm))
    empresa = configs.get('empresa_razao_social', 'ABMT')
    elements.append(Paragraph(f"{empresa} — CNPJ: {configs.get('empresa_cnpj', '')} — {configs.get('empresa_telefone', '')}", styles['Small']))
    elements.append(Paragraph(configs.get('empresa_endereco', ''), styles['Small']))

    doc.build(elements)
    return filepath, None
