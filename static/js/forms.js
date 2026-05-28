/* ABMT Commercial System - Form Components */
// Fechar dropdown de busca ao clicar fora
document.addEventListener('click', (e) => {
    const results = document.getElementById('cliente-nome-results');
    const input = document.getElementById('cliente-nome-busca');
    if (results && !results.contains(e.target) && e.target !== input) {
        results.style.display = 'none';
    }
});

const FORMS = {
    CATEGORIAS: [
        'Transformador Usado', 'Transformador Novo', 'Bobinas de Aço Silício',
        'Chapas de Aço Silício', 'Chapas de Aço Silício Cortadas', 'Caixa e Núcleo',
        'Cobre', 'Alumínio', 'Óleo Isolante', 'Radiadores', 'Papel Kraft',
        'Retalho / Sucata', 'Diversos'
    ],

    SUBCATEGORIAS_DIVERSOS: [
        'Veículo', 'Imóvel', 'Equipamento', 'Material Elétrico',
        'Ferro / Metal', 'Caldeiraria', 'Outro'
    ],

    UFS: ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT',
          'PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'],

    UNIDADES: ['KG','KVA','LITRO','UNIDADE'],

    FORMAS_PAGAMENTO: ['Faturado','PIX','Boleto','Depósito','TED','Cartão','Outro'],

    CONDICOES_RAPIDAS: ['À vista','30 dias','30/45/60 dias','30/60 dias','30/60/90 dias','30/60/90/120 dias','28/56 dias','Personalizado'],

    REGIMES_TRIBUTARIOS: ['Simples Nacional', 'Lucro Presumido', 'Lucro Real', 'MEI', 'Isento'],

    // ICMS rate helper: origin SP
    getICMSRate(ufOrigem, ufDestino, isento = false) {
        if (isento) return 0;
        if (!ufDestino) return 18;
        if (ufOrigem === ufDestino) {
            // Intra-state rates
            const intra = { SP: 18, MG: 18, RJ: 20, PR: 19.5, SC: 17, RS: 17 };
            return intra[ufDestino] || 18;
        }
        // Interstate from SP
        const sulSudeste = ['MG', 'RJ', 'PR', 'SC', 'RS']; // S/SE exceto ES
        if (sulSudeste.includes(ufDestino)) return 12;
        return 7; // N/NE/CO/ES
    },

    items: [],

    // ===== PROPOSTA FORM =====
    async renderPropostaForm(params = {}) {
        const el = document.getElementById('page-content');
        let proposta = null;

        if (params.id) {
            proposta = await APP.api(`/api/propostas/${params.id}`);
            if (!proposta) return;
            this.items = proposta.items.map(i => ({ ...i, campos_especificos: JSON.parse(i.campos_especificos || '{}') }));
        } else {
            this.items = [];
        }

        const tipo = params.tipo || proposta?.tipo || 'VENDA';
        const users = await APP.api('/api/users');

        // Parse saved condition for edit mode
        let savedCondTipo = '';
        let savedCondDesc = '';
        if (proposta?.condicao_pagamento) {
            try {
                const cond = JSON.parse(proposta.condicao_pagamento);
                savedCondTipo = cond.tipo || '';
                savedCondDesc = cond.descricao || '';
            } catch { savedCondTipo = ''; }
        }
        this._savedCondDesc = savedCondDesc;

        // Load taxa de juros e desconto à vista pra calculadora
        if (tipo === 'VENDA') {
            try {
                const cfg = await APP.api('/api/config');
                this._taxaJurosMensal = parseFloat(cfg?.taxa_juros_venda_prazo) || 2.8;
                this._descontoAVista = parseFloat(cfg?.desconto_avista_percentual) || 5;
            } catch { this._taxaJurosMensal = 2.8; this._descontoAVista = 5; }
        }

        el.innerHTML = `
        <div style="margin-bottom:16px">
            <button class="btn btn-outline btn-sm" onclick="APP.navigate('${tipo==='VENDA'?'vendas':'compras'}')">← Voltar</button>
            <span style="font-size:18px;font-weight:700;margin-left:8px">${proposta ? `Editar ${proposta.numero}` : `Nova Proposta de ${tipo==='VENDA'?'Venda':'Compra'}`}</span>
        </div>

        <form id="proposta-form" onsubmit="FORMS.saveProposta(event,'${tipo}',${params.id||'null'})" oninput="APP.markFormDirty()">
            <input type="hidden" name="tipo" value="${tipo}">

            <div class="card">
                <div class="card-header"><span class="card-title">${tipo==='VENDA'?'Cliente':'Fornecedor'}</span></div>
                <div class="form-group">
                    <label>Buscar por nome</label>
                    <div style="position:relative">
                        <input type="text" id="cliente-nome-busca" class="form-control" placeholder="Digite o nome do cliente..."
                            value="${proposta?.razao_social || ''}" oninput="FORMS.buscaClienteNome(this.value)" autocomplete="off">
                        <div id="cliente-nome-results" style="display:none;position:absolute;top:100%;left:0;right:0;background:var(--bg-card);border:1px solid var(--border);border-radius:0 0 8px 8px;max-height:220px;overflow-y:auto;z-index:100;box-shadow:0 4px 12px rgba(0,0,0,.3)"></div>
                    </div>
                </div>
                <div class="form-group">
                    <label>ou CNPJ/CPF</label>
                    <div style="display:flex;gap:8px">
                        <input type="text" name="cnpj_cpf" class="form-control" placeholder="00.000.000/0000-00"
                            value="${proposta?.cliente_cnpj || ''}" onblur="FORMS.lookupCNPJ(this.value)">
                        <button type="button" class="btn btn-outline btn-sm" onclick="FORMS.lookupCNPJ(document.querySelector('[name=cnpj_cpf]').value)">${LI("search",14)}</button>
                    </div>
                </div>
                <div id="cadastro-info" style="display:${proposta?.cadastro_id?'block':'none'};margin-top:8px;font-size:13px;color:var(--text-secondary)">
                    <span id="cadastro-nome">${proposta?.razao_social || ''}</span>
                    <input type="hidden" name="cadastro_id" value="${proposta?.cadastro_id || ''}">
                </div>
                <div id="cadastro-summary"></div>
            </div>

            <div class="card">
                <div class="card-header"><span class="card-title">Responsável</span></div>
                <div class="form-group">
                    <label>Vendedor/Comprador responsável</label>
                    <select name="vendedor_id" class="form-control">
                        ${users?.items?.map(u => `<option value="${u.id}" ${(proposta?.vendedor_id||APP.user.id)==u.id?'selected':''}>${u.nome}</option>`).join('')}
                    </select>
                </div>
                ${tipo === 'VENDA' ? `
                <div class="form-row">
                    <div class="form-group">
                        <label>UF de destino (ICMS)</label>
                        <select name="uf_destino" class="form-control" onchange="FORMS.checkSPIsento(this.value)">
                            <option value="" ${!proposta?.uf_destino?'selected':''}>Selecione UF...</option>
                            ${this.UFS.map(uf => `<option value="${uf}" ${(proposta?.uf_destino||'')==uf?'selected':''}>${uf}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group" id="sp-isento-group" style="display:${(proposta?.uf_destino||'SP')==='SP'?'block':'none'}">
                        <label>ICMS SP</label>
                        <div class="toggle-group">
                            <button type="button" class="toggle-btn ${!proposta?.icms_isento?'active':''}" onclick="FORMS.setIsento(0)">Normal (18%)</button>
                            <button type="button" class="toggle-btn ${proposta?.icms_isento?'active':''}" onclick="FORMS.setIsento(1)">Isento (0%)</button>
                        </div>
                        <input type="hidden" name="icms_isento" value="${proposta?.icms_isento||0}">
                    </div>
                </div>` : ''}
            </div>

            <div class="card">
                <div class="card-header">
                    <span class="card-title">Itens</span>
                    <button type="button" class="btn btn-primary btn-sm" onclick="FORMS.addItem()">+ Item</button>
                </div>
                <div id="items-container">
                    ${this.items.map((item, i) => this.renderItemAccordion(i, item)).join('')}
                </div>
                <div id="items-totals" style="margin-top:12px;font-weight:700;font-size:15px"></div>
            </div>

            <div class="card">
                <div class="card-header"><span class="card-title">Pagamento</span></div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Condição</label>
                        <select name="condicao_tipo" class="form-control" onchange="FORMS.onCondicaoChange(this.value)">
                            ${this.CONDICOES_RAPIDAS.map(c => `<option value="${c}" ${savedCondTipo===c?'selected':''}>${c}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Faturamento a partir de</label>
                        <input type="date" name="data_base_faturamento" class="form-control"
                            value="${proposta?.data_base_faturamento || new Date().toISOString().slice(0,10)}"
                            onchange="FORMS.onCondicaoChange(document.querySelector('[name=condicao_tipo]').value)">
                    </div>
                </div>
                <div id="parcelas-preview"></div>
                <div class="form-group">
                    <label>Forma de pagamento</label>
                    <select name="forma_pagamento" class="form-control">
                        ${this.FORMAS_PAGAMENTO.map(f => `<option value="${f}" ${(proposta?.forma_pagamento||'Faturado')===f?'selected':''}>${f}</option>`).join('')}
                    </select>
                </div>
            </div>

            <div class="card">
                <div class="card-header"><span class="card-title">Logística</span></div>
                ${tipo === 'VENDA' ? `
                <div class="form-row">
                    <div class="form-group">
                        <label>Frete</label>
                        <select name="frete" class="form-control">
                            <option value="FOB" ${(proposta?.frete||'FOB')==='FOB'?'selected':''}>FOB - cliente retira</option>
                            <option value="CIF" ${proposta?.frete==='CIF'?'selected':''}>CIF - ABMT entrega</option>
                            <option value="Transportadora" ${proposta?.frete==='Transportadora'?'selected':''}>Transportadora</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Transportadora</label>
                        <input type="text" name="transportadora" class="form-control" value="${proposta?.transportadora||''}" placeholder="Nome da transportadora">
                    </div>
                </div>
                <div class="form-group">
                    <label>Dados para coleta/entrega</label>
                    <textarea name="obs_transporte" class="form-control" rows="2" placeholder="Informações para logística organizar">${proposta?.obs_transporte||''}</textarea>
                </div>
                ` : `
                <div class="form-group">
                    <label>Endereço de coleta</label>
                    <textarea name="endereco_coleta" class="form-control" rows="2" placeholder="Endereço completo do fornecedor">${proposta?.endereco_coleta||''}</textarea>
                </div>
                <div class="form-group">
                    <label>Tipo de carregamento</label>
                    <select name="tipo_carregamento" class="form-control">
                        <option value="" ${!proposta?.tipo_carregamento?'selected':''}>Selecione...</option>
                        <option value="Fornecedor carrega" ${proposta?.tipo_carregamento==='Fornecedor carrega'?'selected':''}>Fornecedor carrega</option>
                        <option value="Munck ABMT" ${proposta?.tipo_carregamento==='Munck ABMT'?'selected':''}>Munck ABMT</option>
                        <option value="Guindaste" ${proposta?.tipo_carregamento==='Guindaste'?'selected':''}>Guindaste</option>
                        <option value="Contratar frete" ${proposta?.tipo_carregamento==='Contratar frete'?'selected':''}>Contratar frete</option>
                        <option value="Funcionário ABMT" ${proposta?.tipo_carregamento==='Funcionário ABMT'?'selected':''}>Funcionário ABMT</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Observações de logística</label>
                    <textarea name="obs_logistica" class="form-control" rows="2" placeholder="Espaço, acesso, dimensões, fotos etc">${proposta?.obs_logistica||''}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Dimensões do material</label>
                        <input type="text" name="dimensoes_material" class="form-control" value="${proposta?.dimensoes_material||''}" placeholder="Ex: 2m x 1.5m x 1.8m">
                    </div>
                    <div class="form-group">
                        <label>Peso estimado (kg)</label>
                        <input type="number" name="peso_estimado" class="form-control" step="0.01" value="${proposta?.peso_estimado||''}">
                    </div>
                </div>
                `}
            </div>

            <div class="card">
                <div class="card-header"><span class="card-title">Observações</span></div>
                <div class="form-group">
                    <label>Observação para o cliente (aparece no PDF)</label>
                    <textarea name="obs_cliente" class="form-control" rows="2">${proposta?.obs_cliente||''}</textarea>
                </div>
                <div class="form-group">
                    <label>Observação INTERNA (NÃO aparece no PDF)</label>
                    <textarea name="obs_interna" class="form-control" rows="2" style="border-color:var(--warning)">${proposta?.obs_interna||''}</textarea>
                </div>
                <div class="form-group">
                    <label>Validade (dias)</label>
                    <input type="number" name="validade_dias" class="form-control" value="${proposta?.validade_dias||7}">
                </div>
            </div>

            ${tipo === 'VENDA' ? `
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Intermediário / Comissão</span>
                    <button type="button" class="btn btn-outline btn-sm" onclick="FORMS.toggleIntermediario()">
                        ${proposta?.intermediario_id ? 'Editar' : '+ Adicionar'}
                    </button>
                </div>
                <div id="intermediario-section" style="display:${proposta?.intermediario_id ? 'block' : 'none'}">
                    <div class="form-group">
                        <label>Intermediário (CNPJ/CPF ou nome)</label>
                        <input type="text" id="intermediario-search" class="form-control" placeholder="Buscar por CNPJ ou nome..."
                            value="${proposta?.intermediario_nome || ''}" oninput="FORMS.searchIntermediario(this.value)">
                        <input type="hidden" name="intermediario_id" value="${proposta?.intermediario_id || ''}">
                        <div id="intermediario-results" style="display:none" class="search-results"></div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Valor bruto da venda (cliente final)</label>
                            <input type="number" name="valor_bruto_venda" class="form-control" step="0.01"
                                value="${proposta?.valor_bruto_venda || ''}" placeholder="Ex: 180000" oninput="FORMS.calcComissaoIntermediario()">
                        </div>
                        <div class="form-group">
                            <label>Valor líquido (seu preço)</label>
                            <input type="number" name="valor_liquido_venda" class="form-control" step="0.01"
                                value="${proposta?.valor_liquido_venda || ''}" placeholder="Ex: 150000" oninput="FORMS.calcComissaoIntermediario()">
                        </div>
                    </div>
                    <div id="comissao-intermediario-calc" style="font-size:13px;margin:8px 0"></div>
                    <div class="form-group">
                        <label>Forma de pagamento da comissão</label>
                        <select name="comissao_forma" class="form-control">
                            <option value="Dinheiro" ${(proposta?.comissao_forma||'Dinheiro')==='Dinheiro'?'selected':''}>Dinheiro / Transferência</option>
                            <option value="Material" ${proposta?.comissao_forma==='Material'?'selected':''}>Em material (compensação)</option>
                            <option value="Misto" ${proposta?.comissao_forma==='Misto'?'selected':''}>Misto (parte $ + parte material)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Observações sobre a negociação</label>
                        <input type="text" name="intermediario_obs" class="form-control" value="${proposta?.intermediario_obs || ''}"
                            placeholder="Ex: Paga comissão em chapas de aço">
                    </div>
                </div>
            </div>` : ''}

            <div class="card">
                <div class="card-header"><span class="card-title">Opções do PDF</span></div>
                <div style="display:flex;gap:16px;flex-wrap:wrap">
                    <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer">
                        <input type="checkbox" name="incluir_dados_bancarios" ${proposta?.incluir_dados_bancarios?'checked':''}>
                        Incluir dados bancários
                    </label>
                    <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer">
                        <input type="checkbox" name="incluir_politica" ${proposta?.incluir_politica?'checked':''}>
                        Incluir política comercial
                    </label>
                    ${tipo==='VENDA' ? `<label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer">
                        <input type="checkbox" name="mostrar_impostos" ${proposta?.mostrar_impostos!==0?'checked':''}>
                        Mostrar impostos no PDF
                    </label>` : ''}
                </div>
            </div>

            <button type="submit" class="btn btn-primary btn-block" style="margin-top:16px">
                ${proposta ? LI("check",14)+' Salvar alterações' : LI("check",14)+' Criar proposta'}
            </button>
        </form>`;

        this.updateItemsTotals();

        // Initialize juros from existing proposta (so saving without changing condição preserves values)
        if (proposta && tipo === 'VENDA') {
            this._jurosCalculado = {
                juros_total: proposta.juros_total || 0,
                valor_liquido_abmt: proposta.valor_liquido_abmt || 0,
                taxa_aplicada: proposta.taxa_juros_aplicada || this._taxaJurosMensal || 2.8
            };
        }

        // Auto-fill client if cadastro_id provided (from client page "+ Proposta" button)
        if (params.cadastro_id && !params.id) {
            const cad = await APP.api(`/api/cadastros/${params.cadastro_id}`);
            if (cad) {
                document.querySelector('[name="cnpj_cpf"]').value = cad.cnpj_cpf;
                document.querySelector('[name="cadastro_id"]').value = cad.id;
                document.getElementById('cadastro-nome').textContent = cad.razao_social;
                document.getElementById('cadastro-info').style.display = 'block';
                // Auto-set UF from client
                if (cad.endereco_uf) {
                    const ufSelect = document.querySelector('[name="uf_destino"]');
                    if (ufSelect) {
                        ufSelect.value = cad.endereco_uf;
                        this.checkSPIsento(cad.endereco_uf);
                    }
                }
            }
            // Smart defaults: fetch last proposal to this client for payment/freight defaults
            const lastProps = await APP.api(`/api/propostas?cadastro_id=${params.cadastro_id}&per_page=1`);
            if (lastProps?.items?.length > 0) {
                const last = lastProps.items[0];
                // Pre-fill payment condition
                if (last.condicao_pagamento) {
                    try {
                        const cond = JSON.parse(last.condicao_pagamento);
                        if (cond.tipo) {
                            const condSelect = document.querySelector('[name="condicao_tipo"]');
                            if (condSelect) {
                                condSelect.value = cond.tipo;
                                this.onCondicaoChange(cond.tipo);
                            }
                        }
                    } catch(e) {}
                }
                // Pre-fill payment form
                if (last.forma_pagamento) {
                    const formaSelect = document.querySelector('[name="forma_pagamento"]');
                    if (formaSelect) formaSelect.value = last.forma_pagamento;
                }
                // Pre-fill freight
                if (last.frete) {
                    const freteSelect = document.querySelector('[name="frete"]');
                    if (freteSelect) freteSelect.value = last.frete;
                }
                if (last.transportadora) {
                    const transpInput = document.querySelector('[name="transportadora"]');
                    if (transpInput) transpInput.value = last.transportadora;
                }
            }
        }
    },

    renderItemAccordion(index, item = {}) {
        const specs = item.campos_especificos || {};
        const summary = item.categoria ?
            `${item.categoria} — ${item.quantidade||''} ${item.unidade||''} — R$ ${APP.formatMoney(item.valor_total)}` :
            'Novo item (clique para expandir)';

        return `
        <div class="accordion" id="item-${index}">
            <div class="accordion-header ${!item.categoria?'open':''}" onclick="FORMS.toggleAccordion(${index})">
                <span class="icon">▶</span>
                <span class="summary">${summary}</span>
                <button type="button" style="background:none;border:none;color:var(--danger);font-size:16px" onclick="FORMS.removeItem(${index});event.stopPropagation()">${LI("x",14)}</button>
            </div>
            <div class="accordion-body ${!item.categoria?'show':''}">
                <div class="form-group">
                    <label>Categoria</label>
                    <select class="form-control item-categoria" data-index="${index}" onchange="FORMS.onCategoriaChange(${index},this.value)">
                        <option value="">Selecione...</option>
                        ${this.CATEGORIAS.map(c => `<option value="${c}" ${item.categoria===c?'selected':''}>${c}</option>`).join('')}
                    </select>
                </div>
                <div id="item-fields-${index}">${item.categoria ? this.getCategoryFields(index, item.categoria, specs) : ''}</div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Quantidade</label>
                        <input type="number" class="form-control item-quantidade" data-index="${index}" step="0.01" min="0" value="${item.quantidade||''}" oninput="FORMS.calcItemTotal(${index})">
                    </div>
                    <div class="form-group">
                        <label>Unidade</label>
                        <select class="form-control item-unidade" data-index="${index}" onchange="FORMS.onUnidadeChange(${index})">
                            ${this.UNIDADES.map(u => `<option value="${u}" ${(item.unidade||'UNIDADE')===u?'selected':''}>${u}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label id="valor-label-${index}">Valor unitário (${this.getUnidadeLabel(item.unidade || 'UNIDADE')})</label>
                        <input type="number" class="form-control item-valor" data-index="${index}" step="0.01" min="0" value="${item.valor_unitario||''}" oninput="FORMS.calcItemTotal(${index})" placeholder="Ex: 65.00">
                        <div class="price-ref" id="item-price-ref-${index}"></div>
                    </div>
                    <div class="form-group" id="peso-group-${index}" style="display:${['KG','LITRO'].includes(item.unidade)?'none':'block'}">
                        <label>Peso unitário (kg)</label>
                        <input type="number" class="form-control item-peso" data-index="${index}" step="0.01" value="${item.peso_unitario||''}">
                    </div>
                </div>
                <div id="preco-unidade-row-${index}" class="form-row" style="display:${['Transformador Usado','Transformador Novo'].includes(item.categoria)?'flex':'none'}">
                    <div class="form-group">
                        <label id="preco-alt-label-${index}">Preço da unidade (R$)</label>
                        <input type="number" class="form-control item-preco-unidade" data-index="${index}" step="0.01" min="0" value="${(item.campos_especificos||{}).preco_unidade||''}" oninput="FORMS.calcPrecoKVA(${index})" placeholder="Ex: 23000">
                    </div>
                    <div class="form-group" style="padding-top:20px;font-size:12px;color:var(--text-secondary)" id="preco-conv-${index}"></div>
                </div>
                <div id="preco-kva-info-${index}" class="calc-result" style="display:none;background:var(--bg-alt);border-radius:8px;padding:8px 12px;margin-top:4px;font-size:13px;color:var(--text-secondary)"></div>
                <div id="item-calc-${index}" class="calc-result" style="display:${(item.valor_total > 0)?'flex':'none'}">
                    <div>
                        <span class="calc-label">${item.quantidade||0} ${item.unidade||'un'} × R$ ${APP.formatMoney(item.valor_unitario||0)}/${(item.unidade||'un').toLowerCase()} =</span>
                        <strong> R$ ${APP.formatMoney(item.valor_total || 0)}</strong>
                    </div>
                </div>
                <div class="form-row" style="margin-top:8px">
                    <div class="form-group">
                        <label>Custo ref. (R$/${(item.unidade||'un').toLowerCase()})</label>
                        <input type="number" class="form-control item-custo-ref" data-index="${index}" step="0.01" value="${item.custo_referencia||specs.custo_referencia||''}" oninput="FORMS.calcMargin(${index})" placeholder="Custo base">
                    </div>
                    <div class="form-group">
                        <div id="item-margin-${index}" class="margin-indicator" style="font-size:12px;padding-top:20px"></div>
                    </div>
                </div>
                <div class="form-group">
                    <label>Descrição complementar</label>
                    <input type="text" class="form-control item-descricao" data-index="${index}" value="${item.descricao_complementar||''}">
                </div>
                <div id="item-historico-${index}" style="margin-top:8px;font-size:12px;color:var(--text-secondary)"></div>
            </div>
        </div>`;
    },

    getCategoryFields(index, categoria, specs = {}) {
        let html = '';
        if (['Transformador Usado', 'Transformador Novo'].includes(categoria)) {
            html = `
            <div class="form-row">
                <div class="form-group">
                    <label>Tipo</label>
                    <div class="toggle-group">
                        <button type="button" class="toggle-btn ${(specs.tipo||'Trifásico')==='Monofásico'?'active':''}" onclick="FORMS.setSpec(${index},'tipo','Monofásico',this)">Monofásico</button>
                        <button type="button" class="toggle-btn ${(specs.tipo||'Trifásico')==='Trifásico'?'active':''}" onclick="FORMS.setSpec(${index},'tipo','Trifásico',this)">Trifásico</button>
                    </div>
                </div>
                <div class="form-group">
                    <label>Potência (kVA)</label>
                    <input type="text" class="form-control item-spec" data-index="${index}" data-field="potencia" value="${specs.potencia||''}" placeholder="Ex: 500" oninput="FORMS.onPotenciaChange(${index}, this.value)">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Tensão Alta (kV)</label>
                    <input type="text" class="form-control item-spec" data-index="${index}" data-field="tensao_alta" value="${specs.tensao_alta||''}" placeholder="15, 25, 34">
                </div>
                <div class="form-group">
                    <label>Tensão Baixa</label>
                    <input type="text" class="form-control item-spec" data-index="${index}" data-field="tensao_baixa" value="${specs.tensao_baixa||''}" placeholder="380/220">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Marca</label>
                    <input type="text" class="form-control item-spec" data-index="${index}" data-field="marca" value="${specs.marca||''}">
                </div>
                <div class="form-group">
                    <label>Núcleo</label>
                    <div class="toggle-group">
                        <button type="button" class="toggle-btn ${(specs.nucleo||'Envolvente')==='Envolvente'?'active':''}" onclick="FORMS.setSpec(${index},'nucleo','Envolvente',this)">Envolvente</button>
                        <button type="button" class="toggle-btn ${specs.nucleo==='Empilhado'?'active':''}" onclick="FORMS.setSpec(${index},'nucleo','Empilhado',this)">Empilhado</button>
                    </div>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Isolamento</label>
                    <div class="toggle-group">
                        <button type="button" class="toggle-btn ${(specs.isolamento||'A Óleo')==='A Óleo'?'active':''}" onclick="FORMS.setSpec(${index},'isolamento','A Óleo',this)">A Óleo</button>
                        <button type="button" class="toggle-btn ${specs.isolamento==='A Seco'?'active':''}" onclick="FORMS.setSpec(${index},'isolamento','A Seco',this)">A Seco</button>
                    </div>
                </div>
                ${categoria === 'Transformador Usado' ? `
                <div class="form-group">
                    <label>Condição</label>
                    <select class="form-control item-spec" data-index="${index}" data-field="condicao">
                        <option value="Funcionando" ${specs.condicao==='Funcionando'?'selected':''}>Funcionando</option>
                        <option value="Não funcionando" ${specs.condicao==='Não funcionando'?'selected':''}>Não funcionando</option>
                        <option value="Semi-novo" ${specs.condicao==='Semi-novo'?'selected':''}>Semi-novo</option>
                    </select>
                </div>` : ''}
            </div>`;
        } else if (['Bobinas de Aço Silício'].includes(categoria)) {
            html = `<div class="form-row-3">
                <div class="form-group"><label>Tipo</label>
                    <div class="toggle-group">
                        <button type="button" class="toggle-btn ${(specs.tipo_aco||'GO')==='GO'?'active':''}" onclick="FORMS.setSpec(${index},'tipo_aco','GO',this)">GO</button>
                        <button type="button" class="toggle-btn ${specs.tipo_aco==='GNO'?'active':''}" onclick="FORMS.setSpec(${index},'tipo_aco','GNO',this)">GNO</button>
                    </div>
                </div>
                <div class="form-group"><label>Largura (mm)</label><input type="number" class="form-control item-spec" data-index="${index}" data-field="largura" value="${specs.largura||''}"></div>
                <div class="form-group"><label>Espessura (mm)</label><input type="number" class="form-control item-spec" data-index="${index}" data-field="espessura" step="0.01" value="${specs.espessura||''}"></div>
            </div>`;
        } else if (['Chapas de Aço Silício', 'Chapas de Aço Silício Cortadas'].includes(categoria)) {
            html = `<div class="form-row-3">
                <div class="form-group"><label>Tipo</label>
                    <div class="toggle-group">
                        <button type="button" class="toggle-btn ${(specs.tipo_aco||'GO')==='GO'?'active':''}" onclick="FORMS.setSpec(${index},'tipo_aco','GO',this)">GO</button>
                        <button type="button" class="toggle-btn ${specs.tipo_aco==='GNO'?'active':''}" onclick="FORMS.setSpec(${index},'tipo_aco','GNO',this)">GNO</button>
                    </div>
                </div>
                <div class="form-group"><label>Espessura (mm)</label><input type="number" class="form-control item-spec" data-index="${index}" data-field="espessura" step="0.01" value="${specs.espessura||''}"></div>
                <div class="form-group"><label>Largura (mm)</label><input type="number" class="form-control item-spec" data-index="${index}" data-field="largura" value="${specs.largura||''}"></div>
            </div>`;
        } else if (categoria === 'Cobre') {
            html = `<div class="form-group"><label>Tipo</label>
                <div class="toggle-group">
                    ${['Mel','Misto','Cobre de 3º','Cobre com Papel'].map(t => `<button type="button" class="toggle-btn ${specs.tipo_cobre===t?'active':''}" onclick="FORMS.setSpec(${index},'tipo_cobre','${t}',this)">${t}</button>`).join('')}
                </div></div>`;
        } else if (categoria === 'Alumínio') {
            html = `<div class="form-group"><label>Tipo</label>
                <div class="toggle-group">
                    ${['Bloco','Perfil','Cabo'].map(t => `<button type="button" class="toggle-btn ${specs.tipo_aluminio===t?'active':''}" onclick="FORMS.setSpec(${index},'tipo_aluminio','${t}',this)">${t}</button>`).join('')}
                </div></div>`;
        } else if (categoria === 'Óleo Isolante') {
            html = `<div class="form-group"><label>Estado</label>
                <div class="toggle-group">
                    <button type="button" class="toggle-btn ${(specs.estado_oleo||'Usado')==='Usado'?'active':''}" onclick="FORMS.setSpec(${index},'estado_oleo','Usado',this)">Usado</button>
                    <button type="button" class="toggle-btn ${specs.estado_oleo==='Novo'?'active':''}" onclick="FORMS.setSpec(${index},'estado_oleo','Novo',this)">Novo</button>
                </div></div>
            <div class="form-group"><label>Embalagem</label>
                <select class="form-control item-spec" data-index="${index}" data-field="embalagem_tipo" onchange="FORMS.calcItemTotal(${index})">
                    <option value="Sem embalagem" ${(specs.embalagem_tipo||'Sem embalagem')==='Sem embalagem'?'selected':''}>Sem embalagem</option>
                    <option value="Tambor (200L)" ${specs.embalagem_tipo==='Tambor (200L)'?'selected':''}>Tambor (200L) - R$ 165,00</option>
                    <option value="IBC (1000L)" ${specs.embalagem_tipo==='IBC (1000L)'?'selected':''}>IBC (1000L) - R$ 510,00</option>
                </select>
            </div>
            <div id="embalagem-calc-${index}" class="embalagem-calc" style="display:${specs.embalagem_tipo && specs.embalagem_tipo !== 'Sem embalagem' ? 'block' : 'none'}">
                ${specs.embalagem_qtd ? `<div class="alert alert-info">${LI("package",14)} ${specs.embalagem_qtd}x ${specs.embalagem_tipo} = R$ ${APP.formatMoney(specs.embalagem_custo_total)}</div>` : ''}
            </div>`;
        } else if (categoria === 'Diversos') {
            html = `
            <div class="alert alert-warning" style="display:flex;align-items:center;gap:8px;padding:10px 14px;margin-bottom:12px;border-radius:8px;background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.3);color:#f59e0b;font-size:13px">
                ${LI('alert-triangle',16)} <span><strong>Verifique</strong> se este item não se encaixa em outra categoria antes de usar "Diversos"</span>
            </div>
            <div class="form-group">
                <label>Subcategoria *</label>
                <select class="form-control item-spec" data-index="${index}" data-field="subcategoria" onchange="FORMS.setSpec(${index},'subcategoria',this.value)">
                    <option value="">Selecione a subcategoria...</option>
                    ${this.SUBCATEGORIAS_DIVERSOS.map(s => `<option value="${s}" ${specs.subcategoria===s?'selected':''}>${s}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Descrição do item</label>
                <input type="text" class="form-control item-spec" data-index="${index}" data-field="descricao_diversos" value="${specs.descricao_diversos||''}" placeholder="Ex: BMW X7 2019, Guindaste 2007...">
            </div>`;
        } else if (categoria === 'Caixa e Núcleo') {
            html = `
            <div class="form-row-3">
                <div class="form-group"><label>Peso caixa (kg)</label><input type="number" class="form-control item-spec" data-index="${index}" data-field="peso_caixa" value="${specs.peso_caixa||''}"></div>
                <div class="form-group"><label>Peso núcleo (kg)</label><input type="number" class="form-control item-spec" data-index="${index}" data-field="peso_nucleo" value="${specs.peso_nucleo||''}"></div>
                <div class="form-group"><label>Potência (kVA)</label><input type="text" class="form-control item-spec" data-index="${index}" data-field="potencia" value="${specs.potencia||''}"></div>
            </div>
            <div class="form-row-3">
                <div class="form-group"><label>A caixa (mm)</label><input type="number" class="form-control item-spec" data-index="${index}" data-field="caixa_altura" value="${specs.caixa_altura||''}"></div>
                <div class="form-group"><label>L caixa (mm)</label><input type="number" class="form-control item-spec" data-index="${index}" data-field="caixa_largura" value="${specs.caixa_largura||''}"></div>
                <div class="form-group"><label>C caixa (mm)</label><input type="number" class="form-control item-spec" data-index="${index}" data-field="caixa_comprimento" value="${specs.caixa_comprimento||''}"></div>
            </div>
            <div class="form-row-3">
                <div class="form-group"><label>A núcleo (mm)</label><input type="number" class="form-control item-spec" data-index="${index}" data-field="nucleo_altura" value="${specs.nucleo_altura||''}"></div>
                <div class="form-group"><label>L núcleo (mm)</label><input type="number" class="form-control item-spec" data-index="${index}" data-field="nucleo_largura" value="${specs.nucleo_largura||''}"></div>
                <div class="form-group"><label>C núcleo (mm)</label><input type="number" class="form-control item-spec" data-index="${index}" data-field="nucleo_comprimento" value="${specs.nucleo_comprimento||''}"></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>A janela (mm)</label><input type="number" class="form-control item-spec" data-index="${index}" data-field="janela_altura" value="${specs.janela_altura||''}"></div>
                <div class="form-group"><label>L janela (mm)</label><input type="number" class="form-control item-spec" data-index="${index}" data-field="janela_largura" value="${specs.janela_largura||''}"></div>
            </div>`;
        }
        return html;
    },

    // Item actions
    addItem() {
        this.items.push({ categoria: '', quantidade: 0, unidade: 'UNIDADE', valor_unitario: 0, campos_especificos: {} });
        const container = document.getElementById('items-container');
        container.insertAdjacentHTML('beforeend', this.renderItemAccordion(this.items.length - 1));
    },

    removeItem(index) {
        this.items.splice(index, 1);
        document.getElementById('items-container').innerHTML = this.items.map((item, i) => this.renderItemAccordion(i, item)).join('');
        this.updateItemsTotals();
    },

    toggleAccordion(index) {
        const header = document.querySelector(`#item-${index} .accordion-header`);
        const body = document.querySelector(`#item-${index} .accordion-body`);
        header.classList.toggle('open');
        body.classList.toggle('show');
    },

    onCategoriaChange(index, categoria) {
        this.items[index].categoria = categoria;
        document.getElementById(`item-fields-${index}`).innerHTML = this.getCategoryFields(index, categoria, {});

        // Auto-set unidade based on category
        const unidadeEl = document.querySelector(`.item-unidade[data-index="${index}"]`);
        if (unidadeEl) {
            const catUnidade = this.getDefaultUnidade(categoria);
            unidadeEl.value = catUnidade;
            this.onUnidadeChange(index);
        }

        // Update valor unitario label
        this.updateValorLabel(index);

        // Show/hide preco unidade row for transformers
        const precoUnidadeRow = document.getElementById(`preco-unidade-row-${index}`);
        if (precoUnidadeRow) {
            precoUnidadeRow.style.display = ['Transformador Usado','Transformador Novo'].includes(categoria) ? 'flex' : 'none';
        }

        // Load price history
        this.loadPriceHistory(index, categoria);
    },

    getDefaultUnidade(categoria) {
        if (['Transformador Usado','Transformador Novo','Caixa e Núcleo'].includes(categoria)) return 'KVA';
        if (['Bobinas de Aço Silício','Chapas de Aço Silício','Chapas de Aço Silício Cortadas','Cobre','Alumínio','Retalho / Sucata'].includes(categoria)) return 'KG';
        if (categoria === 'Óleo Isolante') return 'LITRO';
        return 'UNIDADE';
    },

    getUnidadeLabel(unidade) {
        const map = { 'KVA': 'R$/kVA', 'KG': 'R$/kg', 'LITRO': 'R$/litro', 'UNIDADE': 'R$/un' };
        return map[unidade] || 'R$/un';
    },

    updateValorLabel(index) {
        const unidade = document.querySelector(`.item-unidade[data-index="${index}"]`)?.value || 'UNIDADE';
        const label = document.querySelector(`#valor-label-${index}`);
        if (label) label.textContent = `Valor unitário (${this.getUnidadeLabel(unidade)})`;
    },

    async loadPriceHistory(index, categoria) {
        const cadastro_id = document.querySelector('[name=cadastro_id]')?.value || '';
        const tipo = document.querySelector('[name=tipo]')?.value || 'VENDA';
        const data = await APP.api(`/api/historico-precos?categoria=${encodeURIComponent(categoria)}&cadastro_id=${cadastro_id}&tipo=${tipo}`);
        if (!data) return;
        const el = document.getElementById(`item-historico-${index}`);
        let html = '';
        if (data.cliente && data.cliente.length > 0) {
            html += `<div>${LI("bar-chart-3",14)} Este cliente: ${data.cliente.map(h => `R$ ${APP.formatMoney(h.valor_unitario)}/${h.unidade} (${APP.formatDate(h.data_emissao)})`).join(' · ')}</div>`;
        }
        if (data.geral && data.geral.length > 0) {
            html += `<div>${LI("bar-chart-3",14)} Geral: ${data.geral.map(h => `R$ ${APP.formatMoney(h.valor_unitario)}/${h.unidade} (${APP.formatDate(h.data_emissao)})`).join(' · ')}</div>`;
        }
        if (data.compra && data.compra.length > 0) {
            html += `<div>${LI("bar-chart-3",14)} Compra: ${data.compra.map(h => `R$ ${APP.formatMoney(h.valor_unitario)}/${h.unidade} (${APP.formatDate(h.data_emissao)})`).join(' · ')}</div>`;
        }
        el.innerHTML = html;
    },

    onUnidadeChange(index) {
        const unidade = document.querySelector(`.item-unidade[data-index="${index}"]`).value;
        const categoria = document.querySelector(`.item-categoria[data-index="${index}"]`)?.value || '';
        const pesoGroup = document.getElementById(`peso-group-${index}`);
        if (pesoGroup) pesoGroup.style.display = ['KG','LITRO'].includes(unidade) ? 'none' : 'block';
        this.updateValorLabel(index);

        // Atualizar label do campo alternativo para transformadores
        const isTrafo = ['Transformador Usado','Transformador Novo'].includes(categoria);
        const altLabel = document.getElementById(`preco-alt-label-${index}`);
        if (altLabel && isTrafo) {
            if (unidade === 'KVA') {
                altLabel.textContent = 'Preço da unidade (R$)';
            } else {
                altLabel.textContent = 'Ou informe R$/kVA';
            }
        }

        this.calcItemTotal(index);
    },

    calcItemTotal(index, skipRecalc) {
        const qtd = parseFloat(document.querySelector(`.item-quantidade[data-index="${index}"]`)?.value || 0);
        const val = parseFloat(document.querySelector(`.item-valor[data-index="${index}"]`)?.value || 0);
        const unidade = document.querySelector(`.item-unidade[data-index="${index}"]`)?.value || 'UNIDADE';

        // When unit is KVA, val = price per kVA → multiply by potência to get price per unit
        let totalProduto;
        const potencia = parseFloat(this.items[index]?.campos_especificos?.potencia || 0);
        if (unidade === 'KVA' && potencia > 0) {
            // qtd = number of transformers, val = R$/kVA, potência = kVA per transformer
            totalProduto = qtd * potencia * val;
        } else {
            totalProduto = qtd * val;
        }

        // Recalculate embalagem if Óleo Isolante
        const categoria = document.querySelector(`.item-categoria[data-index="${index}"]`)?.value;
        if (categoria === 'Óleo Isolante') this.calcEmbalagem(index);

        // Get embalagem cost if exists
        const embCusto = this.items[index]?.campos_especificos?.embalagem_custo_total || 0;
        const total = totalProduto + embCusto;

        const calcEl = document.getElementById(`item-calc-${index}`);
        if (calcEl) {
            if (total > 0) {
                const unidadeShort = { KVA: 'kVA', KG: 'kg', LITRO: 'L', UNIDADE: 'un' }[unidade] || 'un';
                calcEl.style.display = 'flex';
                let html;
                if (unidade === 'KVA' && potencia > 0) {
                    const precoUnidade = potencia * val;
                    html = `<div><span class="calc-label">${qtd} un × ${potencia} kVA × R$ ${APP.formatMoney(val)}/kVA = R$ ${APP.formatMoney(totalProduto)}</span>`;
                    html += `<br><span class="calc-label" style="color:var(--text-muted)">Preço/un: R$ ${APP.formatMoney(precoUnidade)}</span>`;
                } else {
                    html = `<div><span class="calc-label">${qtd} ${unidadeShort} × R$ ${APP.formatMoney(val)}/${unidadeShort} = R$ ${APP.formatMoney(totalProduto)}</span>`;
                }
                if (embCusto > 0) {
                    const embQtd = this.items[index].campos_especificos.embalagem_qtd;
                    const embTipo = this.items[index].campos_especificos.embalagem_tipo;
                    html += `<br><span class="calc-label">+ ${embQtd}× ${embTipo} = R$ ${APP.formatMoney(embCusto)}</span>`;
                }
                html += `<br><strong>TOTAL: R$ ${APP.formatMoney(total)}</strong></div>`;
                calcEl.innerHTML = html;
            } else {
                calcEl.style.display = 'none';
            }
        }
        // Recalculate unit price / KVA price for transformers (skip if called from calcPrecoKVA to avoid loop)
        if (!skipRecalc) this.calcPrecoUnidade(index);
        // Recalculate margin
        this.calcMargin(index);
        this.updateItemsTotals();
    },

    calcMargin(index) {
        const valor = parseFloat(document.querySelector(`.item-valor[data-index="${index}"]`)?.value) || 0;
        const custo = parseFloat(document.querySelector(`.item-custo-ref[data-index="${index}"]`)?.value) || 0;
        const el = document.getElementById(`item-margin-${index}`);
        if (!el) return;
        if (custo > 0 && valor > 0) {
            const margem = ((valor - custo) / custo * 100).toFixed(1);
            const cor = margem >= 20 ? 'var(--success)' : margem >= 10 ? 'var(--warning)' : 'var(--danger)';
            el.innerHTML = `<span style="color:${cor};font-weight:700;font-size:14px">${margem}%</span><br><span style="color:var(--text-muted)">margem</span>`;
        } else {
            el.innerHTML = '';
        }
    },

    calcEmbalagem(index) {
        const tipoEl = document.querySelector(`.item-spec[data-index="${index}"][data-field="embalagem_tipo"]`);
        const calcEl = document.getElementById(`embalagem-calc-${index}`);
        if (!tipoEl || !calcEl) return;
        const tipo = tipoEl.value;
        if (tipo === 'Sem embalagem') {
            calcEl.style.display = 'none';
            if (this.items[index]?.campos_especificos) {
                delete this.items[index].campos_especificos.embalagem_qtd;
                delete this.items[index].campos_especificos.embalagem_custo_unit;
                delete this.items[index].campos_especificos.embalagem_custo_total;
            }
            return;
        }
        const qtdLitros = parseFloat(document.querySelector(`.item-quantidade[data-index="${index}"]`)?.value || 0);
        let capacidade = 200, custoUnit = 165;
        if (tipo === 'IBC (1000L)') { capacidade = 1000; custoUnit = 510; }
        const qtdEmbalagens = Math.ceil(qtdLitros / capacidade);
        const custoTotal = qtdEmbalagens * custoUnit;

        calcEl.style.display = 'block';
        calcEl.innerHTML = `<div class="alert alert-info">${LI("package",14)} ${qtdEmbalagens}x ${tipo} = R$ ${APP.formatMoney(custoTotal)}</div>`;

        // Store in campos_especificos
        if (!this.items[index]) this.items[index] = { campos_especificos: {} };
        if (!this.items[index].campos_especificos) this.items[index].campos_especificos = {};
        this.items[index].campos_especificos.embalagem_tipo = tipo;
        this.items[index].campos_especificos.embalagem_qtd = qtdEmbalagens;
        this.items[index].campos_especificos.embalagem_custo_unit = custoUnit;
        this.items[index].campos_especificos.embalagem_custo_total = custoTotal;
    },

    updateItemsTotals() {
        const container = document.getElementById('items-totals');
        if (!container) return;
        let totalValor = 0, totalPeso = 0, totalEmbalagem = 0;
        document.querySelectorAll('.item-quantidade').forEach((el) => {
            const i = parseInt(el.dataset.index);
            const qtd = parseFloat(el.value || 0);
            const val = parseFloat(document.querySelector(`.item-valor[data-index="${i}"]`)?.value || 0);
            const unidade = document.querySelector(`.item-unidade[data-index="${i}"]`)?.value;
            const peso = parseFloat(document.querySelector(`.item-peso[data-index="${i}"]`)?.value || 0);
            // When unit is KVA, val = price per kVA → multiply by potência
            const potencia = parseFloat(this.items[i]?.campos_especificos?.potencia || 0);
            if (unidade === 'KVA' && potencia > 0) {
                totalValor += qtd * potencia * val;
            } else {
                totalValor += qtd * val;
            }
            if (unidade === 'KG') totalPeso += qtd;
            else if (peso) totalPeso += peso * qtd;
            // Add embalagem cost
            const embCusto = this.items[i]?.campos_especificos?.embalagem_custo_total || 0;
            totalEmbalagem += embCusto;
        });
        totalValor += totalEmbalagem;
        // Cache the computed total — this is the single source of truth for _getPropostaTotal
        this._cachedTotal = totalValor;
        let html = `<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px"><span>PESO TOTAL: ${APP.formatNumber(totalPeso)} kg</span>`;
        if (totalEmbalagem > 0) html += `<span>EMBALAGEM: R$ ${APP.formatMoney(totalEmbalagem)}</span>`;
        html += `<span>VALOR TOTAL: R$ ${APP.formatMoney(totalValor)}</span></div>`;
        container.innerHTML = html;
        // Update parcelas preview with new total
        const condSelect = document.querySelector('[name="condicao_tipo"]');
        if (condSelect && condSelect.value) {
            this.onCondicaoChange(condSelect.value);
        }
    },

    setSpec(index, field, value, btn) {
        if (!this.items[index].campos_especificos) this.items[index].campos_especificos = {};
        this.items[index].campos_especificos[field] = value;
        // Toggle UI
        btn.parentElement.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // When isolamento changes, hide/show oil-related notice for dry transformers
        if (field === 'isolamento') {
            const noticeEl = document.getElementById(`seco-notice-${index}`);
            if (value === 'A Seco') {
                if (!noticeEl) {
                    const parent = btn.closest('.form-row');
                    if (parent) {
                        const notice = document.createElement('div');
                        notice.id = `seco-notice-${index}`;
                        notice.className = 'alert alert-info';
                        notice.style.cssText = 'margin-top:6px;font-size:12px';
                        notice.innerHTML = `${typeof LI==='function'?LI("info",14):''} Transformador a seco — não necessita óleo isolante`;
                        parent.after(notice);
                    }
                }
            } else {
                if (noticeEl) noticeEl.remove();
            }
        }
    },

    checkSPIsento(uf) {
        const group = document.getElementById('sp-isento-group');
        if (group) group.style.display = uf === 'SP' ? 'block' : 'none';
    },

    setIsento(val) {
        document.querySelector('[name=icms_isento]').value = val;
        const btns = document.querySelectorAll('#sp-isento-group .toggle-btn');
        btns[0].classList.toggle('active', val === 0);
        btns[1].classList.toggle('active', val === 1);
    },

    // Collect items from form
    collectItems() {
        const items = [];
        document.querySelectorAll('.item-categoria').forEach((el) => {
            const i = el.dataset.index;
            const categoria = el.value;
            if (!categoria) return;

            const campos_especificos = {};
            document.querySelectorAll(`.item-spec[data-index="${i}"]`).forEach(spec => {
                if (spec.value) campos_especificos[spec.dataset.field] = spec.value;
            });
            // Merge toggle specs
            if (this.items[i]?.campos_especificos) {
                Object.assign(campos_especificos, this.items[i].campos_especificos);
            }
            // Include custo_referencia in campos_especificos
            const custoRef = document.querySelector(`.item-custo-ref[data-index="${i}"]`)?.value;
            if (custoRef) campos_especificos.custo_referencia = parseFloat(custoRef);

            // Salvar preco_unidade e preco_por_kva para transformadores (métricas)
            if (['Transformador Usado','Transformador Novo'].includes(categoria)) {
                const precoAlt = parseFloat(document.querySelector(`.item-preco-unidade[data-index="${i}"]`)?.value || 0);
                const potencia = parseFloat(campos_especificos.potencia || 0);
                const valorUnit = parseFloat(document.querySelector(`.item-valor[data-index="${i}"]`)?.value || 0);
                const unidadeItem = document.querySelector(`.item-unidade[data-index="${i}"]`)?.value || 'UNIDADE';
                if (unidadeItem === 'KVA' && potencia > 0 && valorUnit > 0) {
                    campos_especificos.preco_unidade = valorUnit * potencia;
                    campos_especificos.preco_por_kva = valorUnit;
                } else if (unidadeItem === 'UNIDADE' && potencia > 0 && valorUnit > 0) {
                    campos_especificos.preco_unidade = valorUnit;
                    campos_especificos.preco_por_kva = valorUnit / potencia;
                } else if (precoAlt > 0) {
                    campos_especificos.preco_unidade = precoAlt;
                }
            }

            items.push({
                categoria,
                campos_especificos,
                quantidade: parseFloat(document.querySelector(`.item-quantidade[data-index="${i}"]`)?.value || 0),
                unidade: document.querySelector(`.item-unidade[data-index="${i}"]`)?.value || 'UNIDADE',
                valor_unitario: parseFloat(document.querySelector(`.item-valor[data-index="${i}"]`)?.value || 0),
                peso_unitario: parseFloat(document.querySelector(`.item-peso[data-index="${i}"]`)?.value) || null,
                descricao_complementar: document.querySelector(`.item-descricao[data-index="${i}"]`)?.value || '',
            });
        });
        return items;
    },

    // Save proposta
    async saveProposta(e, tipo, id) {
        e.preventDefault();
        const form = document.getElementById('proposta-form');

        const cadastroId = form.querySelector('[name="cadastro_id"]')?.value;
        if (!cadastroId) {
            APP.toast('Selecione um cliente/fornecedor antes de salvar', 'danger');
            return;
        }

        const items = this.collectItems();

        // Validate items
        if (items.length === 0) {
            APP.toast('Adicione pelo menos um item à proposta', 'danger');
            return;
        }
        for (let i = 0; i < items.length; i++) {
            if (!items[i].categoria) {
                APP.toast(`Item ${i + 1}: selecione a categoria`, 'danger');
                return;
            }
            if (items[i].categoria === 'Diversos' && !items[i].campos_especificos?.subcategoria) {
                APP.toast(`Item ${i + 1}: selecione a subcategoria de "Diversos"`, 'danger');
                return;
            }
            if (!items[i].quantidade || items[i].quantidade <= 0) {
                APP.toast(`Item ${i + 1}: quantidade deve ser maior que zero`, 'danger');
                return;
            }
            if (!items[i].valor_unitario || items[i].valor_unitario <= 0) {
                APP.toast(`Item ${i + 1}: valor unitário deve ser maior que zero`, 'danger');
                return;
            }
        }

        // Build condition payment
        const condicaoTipo = form.querySelector('[name=condicao_tipo]').value;
        let condicao_pagamento = { tipo: condicaoTipo };
        if (condicaoTipo === 'Personalizado') {
            const desc = form.querySelector('[name=condicao_personalizada]')?.value || '';
            condicao_pagamento = { tipo: 'Personalizado', descricao: desc };
        }

        const body = {
            tipo,
            cadastro_id: parseInt(form.querySelector('[name=cadastro_id]').value) || null,
            vendedor_id: parseInt(form.querySelector('[name=vendedor_id]').value),
            uf_destino: form.querySelector('[name=uf_destino]')?.value || null,
            icms_isento: parseInt(form.querySelector('[name=icms_isento]')?.value || 0),
            condicao_pagamento,
            forma_pagamento: form.querySelector('[name=forma_pagamento]').value,
            frete: form.querySelector('[name=frete]')?.value || null,
            transportadora: form.querySelector('[name=transportadora]')?.value || '',
            obs_transporte: form.querySelector('[name=obs_transporte]')?.value || '',
            endereco_coleta: form.querySelector('[name=endereco_coleta]')?.value || '',
            tipo_carregamento: form.querySelector('[name=tipo_carregamento]')?.value || '',
            obs_logistica: form.querySelector('[name=obs_logistica]')?.value || '',
            dimensoes_material: form.querySelector('[name=dimensoes_material]')?.value || '',
            peso_estimado: parseFloat(form.querySelector('[name=peso_estimado]')?.value) || null,
            obs_cliente: form.querySelector('[name=obs_cliente]').value,
            obs_interna: form.querySelector('[name=obs_interna]').value,
            validade_dias: parseInt(form.querySelector('[name=validade_dias]').value) || 7,
            incluir_dados_bancarios: form.querySelector('[name=incluir_dados_bancarios]')?.checked ? 1 : 0,
            incluir_politica: form.querySelector('[name=incluir_politica]')?.checked ? 1 : 0,
            mostrar_impostos: form.querySelector('[name=mostrar_impostos]')?.checked ? 1 : 0,
            intermediario_id: parseInt(form.querySelector('[name=intermediario_id]')?.value) || null,
            valor_bruto_venda: parseFloat(form.querySelector('[name=valor_bruto_venda]')?.value) || null,
            valor_liquido_venda: parseFloat(form.querySelector('[name=valor_liquido_venda]')?.value) || null,
            comissao_forma: form.querySelector('[name=comissao_forma]')?.value || null,
            intermediario_obs: form.querySelector('[name=intermediario_obs]')?.value || '',
            // Juros calculadora venda a prazo — recalcular na hora de salvar com total real
            ...this._recalcJurosParaSalvar(tipo, condicaoTipo, items),
            data_base_faturamento: form.querySelector('[name=data_base_faturamento]')?.value || null,
            items
        };

        APP.setSubmitting(form, true);
        let res;
        try {
            if (id) {
                res = await APP.api(`/api/propostas/${id}`, { method: 'PUT', body });
            } else {
                res = await APP.api('/api/propostas', { method: 'POST', body });
            }
        } finally {
            APP.setSubmitting(form, false);
        }

        if (res && (res.ok || res.id)) {
            APP.clearFormDirty();
            // Save custom condition for reuse
            if (condicaoTipo === 'Personalizado' && condicao_pagamento.descricao) {
                APP.api('/api/condicoes-salvas', { method: 'POST', body: { descricao: condicao_pagamento.descricao } });
            }
            APP.toast(id ? 'Proposta atualizada!' : `${res.numero} criada!`, 'success');
            APP.navigate('proposta_view', { id: id || res.id });
        } else {
            APP.toast(res?.error || 'Erro ao salvar', 'danger');
        }
    },

    // CNPJ Lookup
    async lookupCNPJ(cnpj) {
        if (!cnpj || cnpj.replace(/\D/g, '').length < 11) return;
        const cnpjLimpo = cnpj.replace(/\D/g, '');

        try {
            // First check local
            const local = await APP.api(`/api/cadastros?search=${cnpjLimpo}`);
            if (local && local.items.length > 0) {
                const c = local.items[0];
                document.querySelector('[name=cadastro_id]').value = c.id;
                document.getElementById('cadastro-nome').textContent = `${c.razao_social} — ${c.endereco_cidade || ''}/${c.endereco_uf || ''}`;
                document.getElementById('cadastro-info').style.display = 'block';
                if (c.endereco_uf && document.querySelector('[name=uf_destino]')) {
                    document.querySelector('[name=uf_destino]').value = c.endereco_uf;
                    this.checkSPIsento(c.endereco_uf);
                }
                this.showCadastroSummary(c.endereco_uf, c.regime_tributario);
                return;
            }

            // Receita Federal API
            if (cnpjLimpo.length === 14) {
                APP.toast('Consultando Receita Federal...');
                const data = await APP.api(`/api/consulta-cnpj/${cnpjLimpo}`);
                if (!data) {
                    APP.toast('Erro ao consultar CNPJ — tente novamente', 'danger');
                    return;
                }
                if (data.error) {
                    APP.toast(data.error || 'CNPJ nao encontrado na Receita', 'warning');
                    return;
                }
                // Auto-create cadastro
                let newCadastro = await APP.api('/api/cadastros', {
                    method: 'POST',
                    body: { cnpj_cpf: cnpj, tipo_pessoa: 'PJ', ...data }
                });
                // Handle duplicate - use existing record
                if (newCadastro && newCadastro.error && newCadastro.id) {
                    newCadastro = { id: newCadastro.id };
                    data.razao_social = data.razao_social || cnpj;
                }
                if (newCadastro && newCadastro.id) {
                    document.querySelector('[name=cadastro_id]').value = newCadastro.id;
                    document.getElementById('cadastro-nome').textContent = `${data.razao_social} — ${data.endereco_cidade}/${data.endereco_uf} (NOVO)`;
                    document.getElementById('cadastro-info').style.display = 'block';
                    if (data.endereco_uf && document.querySelector('[name=uf_destino]')) {
                        document.querySelector('[name=uf_destino]').value = data.endereco_uf;
                        this.checkSPIsento(data.endereco_uf);
                    }
                    this.showCadastroSummary(data.endereco_uf, data.regime_tributario);
                    APP.toast('Cadastro criado automaticamente!', 'success');
                } else {
                    APP.toast('Erro ao criar cadastro a partir do CNPJ', 'danger');
                }
            }
        } catch (e) {
            console.error('lookupCNPJ error:', e);
            APP.toast('Erro ao consultar CNPJ — verifique sua conexao', 'danger');
        }
    },

    // Busca de cliente por nome com autocomplete
    _buscaTimer: null,
    async buscaClienteNome(valor) {
        clearTimeout(this._buscaTimer);
        const resultsEl = document.getElementById('cliente-nome-results');
        if (!resultsEl) return;

        const q = (valor || '').trim();
        if (q.length < 2) {
            resultsEl.style.display = 'none';
            return;
        }

        // Debounce 300ms pra não spammar a API
        this._buscaTimer = setTimeout(async () => {
            const data = await APP.api(`/api/cadastros?search=${encodeURIComponent(q)}&per_page=8`);
            if (!data || !data.items || data.items.length === 0) {
                resultsEl.innerHTML = `<div style="padding:12px;color:var(--text-secondary);font-size:13px">Nenhum cadastro encontrado para "${q}"</div>`;
                resultsEl.style.display = 'block';
                return;
            }

            resultsEl.innerHTML = data.items.map(c => `
                <div class="autocomplete-item" onclick="FORMS.selecionarClienteNome(${c.id})"
                     style="padding:10px 14px;cursor:pointer;border-bottom:1px solid var(--border);transition:background .15s"
                     onmouseover="this.style.background='var(--bg-alt)'" onmouseout="this.style.background='transparent'">
                    <div style="font-weight:600;font-size:14px">${c.razao_social || c.nome_fantasia || ''}</div>
                    <div style="font-size:12px;color:var(--text-secondary)">
                        ${c.cnpj_cpf || ''} ${c.endereco_cidade ? `— ${c.endereco_cidade}/${c.endereco_uf}` : ''}
                    </div>
                </div>
            `).join('');
            resultsEl.style.display = 'block';
        }, 300);
    },

    async selecionarClienteNome(id) {
        const resultsEl = document.getElementById('cliente-nome-results');
        if (resultsEl) resultsEl.style.display = 'none';

        const c = await APP.api(`/api/cadastros/${id}`);
        if (!c) return;

        // Preencher campos
        document.querySelector('[name=cadastro_id]').value = c.id;
        document.getElementById('cadastro-nome').textContent = `${c.razao_social} — ${c.endereco_cidade || ''}/${c.endereco_uf || ''}`;
        document.getElementById('cadastro-info').style.display = 'block';
        const buscaInput = document.getElementById('cliente-nome-busca');
        if (buscaInput) buscaInput.value = c.razao_social || c.nome_fantasia || '';
        const cnpjInput = document.querySelector('[name=cnpj_cpf]');
        if (cnpjInput && c.cnpj_cpf) cnpjInput.value = c.cnpj_cpf;

        // Preencher UF destino se existir
        if (c.endereco_uf && document.querySelector('[name=uf_destino]')) {
            document.querySelector('[name=uf_destino]').value = c.endereco_uf;
            this.checkSPIsento(c.endereco_uf);
        }
        this.showCadastroSummary(c.endereco_uf, c.regime_tributario);
    },

    showCadastroSummary(uf, regime) {
        const summaryEl = document.getElementById('cadastro-summary');
        if (!summaryEl) return;
        const icmsRate = this.getICMSRate('SP', uf || 'SP');
        const icmsLabel = uf === 'SP' ? 'intra-SP' : (icmsRate === 12 ? 'S/SE' : (icmsRate === 7 ? 'N/NE/CO/ES' : uf || ''));
        summaryEl.innerHTML = `<div class="cadastro-summary-bar">
            <span>${LI("map-pin",14)} ${uf || '?'}</span>
            <span>${LI("file-text",14)} ${regime || 'Não informado'}</span>
            <span>${LI("coins",14)} ICMS: ${icmsRate}% (${icmsLabel})</span>
            <span>${LI("receipt",14)} PIS/COFINS: 9,25%</span>
        </div>`;
        summaryEl.style.display = 'block';
    },

    // ===== CADASTRO FORM =====
    async renderCadastroForm(params = {}) {
        const el = document.getElementById('page-content');
        let cadastro = null;
        if (params.id) {
            cadastro = await APP.api(`/api/cadastros/${params.id}`);
        }

        const segmentos = ['Reformador','Fabricante','Reciclagem / Sucata','Distribuidor / Revenda','Concessionária','Indústria','Pessoa Física','Outro'];

        el.innerHTML = `
        <div style="margin-bottom:16px">
            <button class="btn btn-outline btn-sm" onclick="APP.navigate('cadastros')">← Voltar</button>
            <span style="font-size:18px;font-weight:700;margin-left:8px">${cadastro ? 'Editar cadastro' : 'Novo cadastro'}</span>
        </div>
        <form id="cadastro-form" onsubmit="FORMS.saveCadastro(event,${params.id||'null'})" oninput="APP.markFormDirty()">
            <div class="card">
                <div class="form-row">
                    <div class="form-group">
                        <label>Tipo</label>
                        <div class="toggle-group">
                            <button type="button" class="toggle-btn ${(cadastro?.tipo_pessoa||'PJ')==='PJ'?'active':''}" onclick="document.querySelector('[name=tipo_pessoa]').value='PJ';this.parentElement.querySelectorAll('.toggle-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active')">PJ</button>
                            <button type="button" class="toggle-btn ${cadastro?.tipo_pessoa==='PF'?'active':''}" onclick="document.querySelector('[name=tipo_pessoa]').value='PF';this.parentElement.querySelectorAll('.toggle-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active')">PF</button>
                        </div>
                        <input type="hidden" name="tipo_pessoa" value="${cadastro?.tipo_pessoa||'PJ'}">
                    </div>
                    <div class="form-group">
                        <label>CNPJ/CPF</label>
                        <input type="text" name="cnpj_cpf" class="form-control" value="${cadastro?.cnpj_cpf||''}" required ${cadastro?'readonly':''}>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label>Razão Social</label><input type="text" name="razao_social" class="form-control" value="${cadastro?.razao_social||''}" required></div>
                    <div class="form-group"><label>Nome Fantasia</label><input type="text" name="nome_fantasia" class="form-control" value="${cadastro?.nome_fantasia||''}"></div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label>Cidade</label><input type="text" name="endereco_cidade" class="form-control" value="${cadastro?.endereco_cidade||''}"></div>
                    <div class="form-group"><label>UF</label><select name="endereco_uf" class="form-control">
                        <option value="">-</option>
                        ${this.UFS.map(uf => `<option value="${uf}" ${cadastro?.endereco_uf===uf?'selected':''}>${uf}</option>`).join('')}
                    </select></div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label>Contato</label><input type="text" name="contato_nome" class="form-control" value="${cadastro?.contato_nome||''}"></div>
                    <div class="form-group"><label>WhatsApp</label><input type="text" name="contato_whatsapp" class="form-control" value="${cadastro?.contato_whatsapp||''}"></div>
                </div>
                <div class="form-group">
                    <label>Segmento</label>
                    <select name="segmento" class="form-control">
                        <option value="">Selecione...</option>
                        ${segmentos.map(s => `<option value="${s}" ${cadastro?.segmento===s?'selected':''}>${s}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Regime Tributário</label>
                    <select name="regime_tributario" class="form-control">
                        <option value="">Selecione...</option>
                        ${this.REGIMES_TRIBUTARIOS.map(r => `<option value="${r}" ${cadastro?.regime_tributario===r?'selected':''}>${r}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Limite de faturamento (R$)</label>
                    <input type="number" name="limite_faturamento" class="form-control" step="0.01" value="${cadastro?.limite_faturamento||''}">
                </div>
                <div class="form-group">
                    <label>Observações</label>
                    <textarea name="observacoes" class="form-control">${cadastro?.observacoes||''}</textarea>
                </div>
            </div>
            <button type="submit" class="btn btn-primary btn-block">${cadastro ? LI("check",14)+' Salvar' : LI("check",14)+' Cadastrar'}</button>
        </form>`;
    },

    async saveCadastro(e, id) {
        e.preventDefault();
        const form = document.getElementById('cadastro-form');
        const body = {};
        form.querySelectorAll('input[name], select[name], textarea[name]').forEach(el => {
            if (el.value) body[el.name] = el.value;
        });

        APP.setSubmitting(form, true);
        let res;
        try {
            if (id) {
                res = await APP.api(`/api/cadastros/${id}`, { method: 'PUT', body });
            } else {
                res = await APP.api('/api/cadastros', { method: 'POST', body });
            }
        } finally {
            APP.setSubmitting(form, false);
        }

        if (res && (res.ok || res.id)) {
            APP.clearFormDirty();
            APP.toast('Salvo!', 'success');
            APP.navigate('cadastro_view', { id: id || res.id });
        } else {
            APP.toast(res?.error || 'Erro', 'danger');
        }
    },

    // ===== OV FORM (direct) =====
    async renderOVForm(params = {}) {
        // Reuse proposta form logic simplified
        APP.navigate('proposta_form', { tipo: 'VENDA', ...params });
    },

    // ===== OC FORM (direct) =====
    async renderOCForm(params = {}) {
        APP.navigate('proposta_form', { tipo: 'COMPRA', ...params });
    },

    // ===== NOTA FORM =====
    renderNotaForm() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `<div class="modal">
            <div class="modal-header"><span class="modal-title">Nova Nota</span><button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button></div>
            <form onsubmit="FORMS.saveNota(event)">
                <div class="form-group"><label>Título</label><input type="text" name="titulo" class="form-control"></div>
                <div class="form-group"><label>Conteúdo</label><textarea name="conteudo" class="form-control" rows="4"></textarea></div>
                <button type="submit" class="btn btn-primary btn-block">Salvar</button>
            </form>
        </div>`;
        document.body.appendChild(modal);
    },

    async saveNota(e) {
        e.preventDefault();
        const form = e.target;
        const titulo = form.querySelector('[name=titulo]').value;
        const conteudo = form.querySelector('[name=conteudo]').value;
        const modal = form.closest('.modal-overlay');
        if (modal) modal.remove();
        await APP.api('/api/notas', { method: 'POST', body: { titulo, conteudo }});
        APP.toast('Nota salva!', 'success');
        APP.renderNotas();
    },

    // ===== FOLLOW-UP FORM =====
    renderFollowupForm() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `<div class="modal">
            <div class="modal-header"><span class="modal-title">Novo Follow-up</span><button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button></div>
            <form onsubmit="FORMS.saveFollowup(event)">
                <div class="form-group"><label>Ação</label><input type="text" name="acao" class="form-control" placeholder="Ligar sobre proposta..." required></div>
                <div class="form-group"><label>Data/Hora</label><input type="datetime-local" name="data_hora" class="form-control" required></div>
                <button type="submit" class="btn btn-primary btn-block">Salvar</button>
            </form>
        </div>`;
        document.body.appendChild(modal);
    },

    async saveFollowup(e) {
        e.preventDefault();
        const form = e.target;
        const acao = form.querySelector('[name=acao]').value;
        const data_hora = form.querySelector('[name=data_hora]').value;
        const modal = form.closest('.modal-overlay');
        if (modal) modal.remove();
        await APP.api('/api/followups', { method: 'POST', body: { acao, data_hora }});
        APP.toast('Follow-up criado!', 'success');
        APP.renderFollowups();
    },

    onPotenciaChange(index, potencia) {
        if (!this.items[index].campos_especificos) this.items[index].campos_especificos = {};
        this.items[index].campos_especificos.potencia = potencia;
        // Potência é um dado técnico do trafo, NÃO altera quantidade nem unidade.
        // Quantidade = quantos trafos (1, 2, 3...), Unidade = UNIDADE.
        // O R$/kVA é calculado automaticamente em calcPrecoUnidade.
        this.calcPrecoUnidade(index);
    },

    toggleIntermediario() {
        const sec = document.getElementById('intermediario-section');
        if (sec) sec.style.display = sec.style.display === 'none' ? 'block' : 'none';
    },

    async searchIntermediario(query) {
        if (query.length < 2) { document.getElementById('intermediario-results').style.display = 'none'; return; }
        const data = await APP.api(`/api/cadastros?search=${encodeURIComponent(query)}&per_page=5`);
        const el = document.getElementById('intermediario-results');
        if (!data || !data.items || !data.items.length) { el.style.display = 'none'; return; }
        el.style.display = 'block';
        el.innerHTML = data.items.map(c =>
            `<div class="search-result-item" style="padding:8px;cursor:pointer;border-bottom:1px solid var(--border)"
                onclick="FORMS.selectIntermediario(${c.id},'${(c.razao_social||c.nome_fantasia||'').replace(/'/g,"\\'")}')">
                <strong>${c.razao_social || c.nome_fantasia}</strong>
                <div style="font-size:11px;color:var(--text-muted)">${c.cnpj_cpf || ''} · ${c.endereco_cidade||''}/${c.endereco_uf||''}</div>
            </div>`
        ).join('');
    },

    selectIntermediario(id, nome) {
        document.querySelector('[name=intermediario_id]').value = id;
        document.getElementById('intermediario-search').value = nome;
        document.getElementById('intermediario-results').style.display = 'none';
    },

    calcComissaoIntermediario() {
        const bruto = parseFloat(document.querySelector('[name=valor_bruto_venda]')?.value || 0);
        const liquido = parseFloat(document.querySelector('[name=valor_liquido_venda]')?.value || 0);
        const el = document.getElementById('comissao-intermediario-calc');
        if (!el) return;
        if (bruto > 0 && liquido > 0) {
            const comissao = bruto - liquido;
            const pct = ((comissao / bruto) * 100).toFixed(1);
            el.innerHTML = `<div style="padding:8px;background:rgba(99,102,241,0.1);border-radius:8px;border:1px solid rgba(99,102,241,0.2)">
                <strong style="color:var(--accent)">Comissão intermediário: R$ ${APP.formatMoney(comissao)}</strong> (${pct}% do valor bruto)
            </div>`;
        } else {
            el.innerHTML = '';
        }
    },

    calcPrecoKVA(index) {
        const unidade = document.querySelector(`.item-unidade[data-index="${index}"]`)?.value || 'UNIDADE';
        const potencia = parseFloat(this.items[index]?.campos_especificos?.potencia || 0);

        if (unidade === 'KVA') {
            // Campo alternativo = preço por unidade → calcular R$/KVA
            const precoUnidade = parseFloat(document.querySelector(`.item-preco-unidade[data-index="${index}"]`)?.value || 0);
            if (precoUnidade > 0 && potencia > 0) {
                const precoKVA = precoUnidade / potencia;
                const valorInput = document.querySelector(`.item-valor[data-index="${index}"]`);
                if (valorInput) { valorInput.value = precoKVA.toFixed(2); }
                this.calcItemTotal(index, true);
                const convEl = document.getElementById(`preco-conv-${index}`);
                if (convEl) convEl.innerHTML = `R$ ${APP.formatMoney(precoUnidade)} ÷ ${potencia} kVA = <strong>R$ ${precoKVA.toFixed(2)}/kVA</strong>`;
            }
        } else {
            // Campo alternativo = R$/KVA → calcular preço por unidade
            const precoKVA = parseFloat(document.querySelector(`.item-preco-unidade[data-index="${index}"]`)?.value || 0);
            if (precoKVA > 0 && potencia > 0) {
                const precoUnidade = precoKVA * potencia;
                const valorInput = document.querySelector(`.item-valor[data-index="${index}"]`);
                if (valorInput) { valorInput.value = precoUnidade.toFixed(2); }
                this.calcItemTotal(index, true);
                const convEl = document.getElementById(`preco-conv-${index}`);
                if (convEl) convEl.innerHTML = `R$ ${APP.formatMoney(precoKVA)}/kVA × ${potencia} kVA = <strong>R$ ${APP.formatMoney(precoUnidade)}/un</strong>`;
            }
        }
    },

    calcPrecoUnidade(index) {
        const categoria = document.querySelector(`.item-categoria[data-index="${index}"]`)?.value;
        if (!['Transformador Usado','Transformador Novo'].includes(categoria)) return;

        const unidade = document.querySelector(`.item-unidade[data-index="${index}"]`)?.value || 'UNIDADE';
        const valorPrincipal = parseFloat(document.querySelector(`.item-valor[data-index="${index}"]`)?.value || 0);
        const qtd = parseFloat(document.querySelector(`.item-quantidade[data-index="${index}"]`)?.value || 0);
        const potencia = parseFloat(this.items[index]?.campos_especificos?.potencia || 0);
        const convEl = document.getElementById(`preco-conv-${index}`);
        const kvaInfoEl = document.getElementById(`preco-kva-info-${index}`);

        if (unidade === 'KVA') {
            // Valor principal é R$/KVA → calcular preço por unidade
            if (valorPrincipal > 0 && potencia > 0) {
                const precoUnidade = valorPrincipal * potencia;
                const precoUnidadeInput = document.querySelector(`.item-preco-unidade[data-index="${index}"]`);
                if (precoUnidadeInput) { precoUnidadeInput.value = precoUnidade.toFixed(2); }
                if (convEl) convEl.innerHTML = `${potencia} kVA × R$ ${APP.formatMoney(valorPrincipal)}/kVA = <strong>R$ ${APP.formatMoney(precoUnidade)}/un</strong>`;
            }
            if (kvaInfoEl) kvaInfoEl.style.display = 'none';
        } else if (unidade === 'UNIDADE') {
            // Valor principal é R$/unidade → calcular R$/KVA
            if (valorPrincipal > 0 && potencia > 0) {
                const precoKVA = valorPrincipal / potencia;
                const precoUnidadeInput = document.querySelector(`.item-preco-unidade[data-index="${index}"]`);
                if (precoUnidadeInput) { precoUnidadeInput.value = precoKVA.toFixed(2); }
                if (convEl) convEl.innerHTML = `R$ ${APP.formatMoney(valorPrincipal)} ÷ ${potencia} kVA = <strong>R$ ${APP.formatMoney(precoKVA)}/kVA</strong>`;
            }
            // Mostrar info R$/KVA embaixo do total
            if (kvaInfoEl && valorPrincipal > 0 && potencia > 0) {
                const precoKVA = valorPrincipal / potencia;
                kvaInfoEl.style.display = 'flex';
                kvaInfoEl.innerHTML = `⚡ Trafo ${potencia} kVA vendido a <strong style="color:var(--primary);margin:0 4px">R$ ${APP.formatMoney(precoKVA)}/kVA</strong>`;
            } else if (kvaInfoEl) {
                kvaInfoEl.style.display = 'none';
            }
        } else if (unidade === 'KG') {
            // Valor principal é R$/KG → calcular R$/KVA se tiver peso e potência
            const pesoUnit = parseFloat(document.querySelector(`.item-peso[data-index="${index}"]`)?.value || 0);
            if (valorPrincipal > 0 && potencia > 0 && pesoUnit > 0) {
                const precoUnidade = valorPrincipal * pesoUnit;
                const precoKVA = precoUnidade / potencia;
                if (convEl) convEl.innerHTML = `R$ ${APP.formatMoney(valorPrincipal)}/kg × ${pesoUnit} kg = R$ ${APP.formatMoney(precoUnidade)}/un = <strong>R$ ${APP.formatMoney(precoKVA)}/kVA</strong>`;
                if (kvaInfoEl) {
                    kvaInfoEl.style.display = 'flex';
                    kvaInfoEl.innerHTML = `⚡ Trafo ${potencia} kVA vendido a <strong style="color:var(--primary);margin:0 4px">R$ ${APP.formatMoney(precoKVA)}/kVA</strong> (R$ ${APP.formatMoney(precoUnidade)}/un)`;
                }
            } else if (kvaInfoEl) {
                kvaInfoEl.style.display = 'none';
            }
        }
    },

    onCondicaoChange(tipo) {
        const container = document.getElementById('parcelas-preview');
        if (!container) return;
        const isVenda = document.querySelector('[name=tipo]')?.value === 'VENDA';

        if (tipo === 'À vista') {
            const total = this._getPropostaTotal();
            const descPct = this._descontoAVista || 5;
            const descValor = total * descPct / 100;
            const totalComDesconto = total - descValor;
            if (isVenda && total > 0) {
                container.innerHTML = `
                <div style="margin-top:8px;border:1px solid var(--success);border-radius:8px;overflow:hidden;background:rgba(34,197,94,0.05)">
                    <div style="padding:10px 12px;font-size:13px;font-weight:600;color:var(--success);background:rgba(34,197,94,0.1);display:flex;align-items:center;gap:6px">
                        ${LI("coins",16)} Pagamento à Vista
                    </div>
                    <div style="padding:10px 12px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;text-align:center">
                        <div>
                            <div style="font-size:11px;color:var(--text-secondary)">Valor cheio</div>
                            <div style="font-size:16px;font-weight:700">R$ ${APP.formatMoney(total)}</div>
                        </div>
                        <div>
                            <div style="font-size:11px;color:var(--text-secondary)">Desconto (${descPct}%)</div>
                            <div style="font-size:16px;font-weight:700;color:var(--success)">- R$ ${APP.formatMoney(descValor)}</div>
                        </div>
                        <div>
                            <div style="font-size:11px;color:var(--text-secondary)">Valor à vista</div>
                            <div style="font-size:16px;font-weight:700;color:var(--accent)">R$ ${APP.formatMoney(totalComDesconto)}</div>
                        </div>
                    </div>
                    <div style="padding:8px 12px;font-size:11px;color:var(--text-muted);border-top:1px solid var(--border);text-align:center">
                        ✓ Sem custo financeiro — líquido ABMT: <strong>R$ ${APP.formatMoney(totalComDesconto)}</strong> · ⚠ Uso interno
                    </div>
                </div>`;
            } else {
                container.innerHTML = `<div class="alert alert-info">${LI("coins",16)} Pagamento à vista${total > 0 ? ` — <strong>R$ ${APP.formatMoney(total)}</strong>` : ''}</div>`;
            }
            if (isVenda) this._jurosCalculado = { juros_total: 0, valor_liquido_abmt: totalComDesconto, taxa_aplicada: 0, desconto_avista: descPct };
            return;
        }
        if (tipo === 'Personalizado') {
            container.innerHTML = `<div class="card" style="margin-top:8px;padding:12px">
                <div id="condicoes-salvas-list" style="margin-bottom:8px"></div>
                <div class="form-group" style="margin-bottom:0">
                    <label>Descreva a condição personalizada</label>
                    <input type="text" name="condicao_personalizada" class="form-control"
                        placeholder="Ex: 50% antecipado + 50% na entrega" value="${this._savedCondDesc || ''}">
                </div>
            </div>`;
            if (isVenda) this._jurosCalculado = null;
            APP.api('/api/condicoes-salvas').then(data => {
                if (data && data.length > 0) {
                    const list = document.getElementById('condicoes-salvas-list');
                    if (list) {
                        list.innerHTML = '<label style="font-size:11px;color:var(--text-secondary);margin-bottom:4px;display:block">Condições salvas:</label>' +
                            '<div style="display:flex;flex-wrap:wrap;gap:6px">' +
                            data.map(c => `<button type="button" class="btn btn-outline btn-sm" style="font-size:11px" onclick="document.querySelector(\'[name=condicao_personalizada]\').value=\'${c.descricao.replace(/'/g,"\\'")}\'">${c.descricao}</button>`).join('') +
                            '</div>';
                    }
                }
            });
            return;
        }

        // Parse days from condition string (e.g., "30/60/90 dias" -> [30, 60, 90])
        const dias = tipo.replace(' dias','').split('/').map(Number).filter(n => !isNaN(n));
        // Data base: usa o campo de faturamento ou hoje
        const dataBaseInput = document.querySelector('[name=data_base_faturamento]')?.value;
        const hoje = dataBaseInput ? new Date(dataBaseInput + 'T00:00:00') : new Date();
        const total = this._getPropostaTotal();
        const valorParcelaSemJuros = dias.length > 0 && total > 0 ? total / dias.length : 0;

        // Juros compostos (mesma lógica da planilha Excel)
        const taxa = (this._taxaJurosMensal || 2.8) / 100; // ex: 0.028
        let totalComJuros = 0;
        const parcelas = dias.map((d, i) => {
            const meses = d / 30; // 30d = 1 mês, 60d = 2 meses, etc.
            const parcelaComJuros = valorParcelaSemJuros * Math.pow(1 + taxa, meses);
            totalComJuros += parcelaComJuros;
            const dt = new Date(hoje);
            dt.setDate(dt.getDate() + d);
            return { dias: d, meses, semJuros: valorParcelaSemJuros, comJuros: parcelaComJuros, data: dt };
        });
        const jurosTotal = totalComJuros - total;
        const liquidoABMT = total - jurosTotal;

        // Store for saving (only VENDA)
        if (isVenda) {
            this._jurosCalculado = { juros_total: Math.round(jurosTotal * 100) / 100, valor_liquido_abmt: Math.round(liquidoABMT * 100) / 100, taxa_aplicada: this._taxaJurosMensal || 2.8 };
        }

        let html = `<div class="parcelas-table" style="margin-top:8px;border:1px solid var(--border);border-radius:8px;overflow:hidden">
            <div style="background:var(--bg-tertiary);padding:8px 12px;font-weight:600;font-size:13px;display:flex;justify-content:space-between">
                <span>${LI("calendar",14)} Previsão de Pagamentos</span>
                <span>${dias.length} parcela${dias.length>1?'s':''}</span>
            </div>`;

        // Header row for interest table (only show if VENDA and has value)
        if (isVenda && total > 0) {
            html += `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;padding:6px 12px;border-top:1px solid var(--border);font-size:10px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;background:var(--bg-secondary)">
                <span>Parcela</span><span style="text-align:right">Sem juros</span><span style="text-align:right">Com juros</span>
            </div>`;
        }

        parcelas.forEach((p, i) => {
            if (isVenda && total > 0) {
                html += `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;align-items:center;padding:8px 12px;border-top:1px solid var(--border);font-size:13px">
                    <div>
                        <span style="color:var(--accent);font-weight:600">${i+1}/${dias.length}</span>
                        <span style="margin-left:6px">${p.data.toLocaleDateString('pt-BR')}</span>
                        <span style="color:var(--text-muted);font-size:11px;margin-left:4px">(${p.dias}d)</span>
                    </div>
                    <span style="text-align:right;color:var(--text-secondary)">${APP.formatMoney(p.semJuros)}</span>
                    <span style="text-align:right;font-weight:600;color:var(--warning)">${APP.formatMoney(p.comJuros)}</span>
                </div>`;
            } else {
                html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-top:1px solid var(--border);font-size:13px">
                    <div>
                        <span style="color:var(--accent);font-weight:600">${i+1}/${dias.length}</span>
                        <span style="margin-left:8px">${p.data.toLocaleDateString('pt-BR')}</span>
                        <span style="color:var(--text-muted);font-size:11px;margin-left:4px">(${p.dias}d)</span>
                    </div>
                    <span style="font-weight:600">${p.semJuros > 0 ? 'R$ ' + APP.formatMoney(p.semJuros) : '-'}</span>
                </div>`;
            }
        });

        if (total > 0) {
            html += `<div style="display:flex;justify-content:space-between;padding:8px 12px;border-top:2px solid var(--border);font-weight:700;font-size:13px;background:var(--bg-tertiary)">
                <span>Total (valor da proposta)</span>
                <span style="color:var(--success)">R$ ${APP.formatMoney(total)}</span>
            </div>`;
        }

        // Painel de custo financeiro — só pra VENDA e com valor
        if (isVenda && total > 0 && jurosTotal > 0) {
            const pctJuros = (jurosTotal / total * 100).toFixed(1);
            html += `</div>
            <div style="margin-top:8px;border:1px solid var(--warning);border-radius:8px;overflow:hidden;background:rgba(255,193,7,0.05)">
                <div style="padding:10px 12px;font-size:13px;font-weight:600;color:var(--warning);background:rgba(255,193,7,0.1);display:flex;align-items:center;gap:6px">
                    ${LI("alert-triangle",16)} Custo Financeiro do Prazo <span style="font-size:11px;font-weight:400;color:var(--text-secondary)">(taxa: ${(this._taxaJurosMensal||2.8).toFixed(1)}% a.m.)</span>
                </div>
                <div style="padding:10px 12px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;text-align:center">
                    <div>
                        <div style="font-size:11px;color:var(--text-secondary)">Total com juros</div>
                        <div style="font-size:16px;font-weight:700;color:var(--warning)">R$ ${APP.formatMoney(totalComJuros)}</div>
                    </div>
                    <div>
                        <div style="font-size:11px;color:var(--text-secondary)">Juros (${pctJuros}%)</div>
                        <div style="font-size:16px;font-weight:700;color:var(--danger)">- R$ ${APP.formatMoney(jurosTotal)}</div>
                    </div>
                    <div>
                        <div style="font-size:11px;color:var(--text-secondary)">Líquido ABMT</div>
                        <div style="font-size:16px;font-weight:700;color:var(--success)">R$ ${APP.formatMoney(liquidoABMT)}</div>
                    </div>
                </div>
                <div style="padding:6px 12px;font-size:11px;color:var(--text-muted);border-top:1px solid var(--border);text-align:center">
                    ⚠ Uso interno — não aparece no PDF do cliente
                </div>
            </div>`;
        } else {
            html += '</div>';
        }

        container.innerHTML = html;
    },

    _recalcJurosParaSalvar(tipo, condicaoTipo, items) {
        // Recalculate interest at save time using the ACTUAL items total
        // This fixes the bug where juros was calculated on a partial total
        // if the user changed items after selecting payment condition
        if (tipo !== 'VENDA' || !condicaoTipo || condicaoTipo === 'Personalizado') {
            return { juros_total: 0, valor_liquido_abmt: 0, taxa_juros_aplicada: 0 };
        }
        if (condicaoTipo === 'À vista') {
            const totalAV = this._getPropostaTotal();
            const descPct = this._descontoAVista || 5;
            const totalComDesconto = Math.round((totalAV - (totalAV * descPct / 100)) * 100) / 100;
            return { juros_total: 0, valor_liquido_abmt: totalComDesconto, taxa_juros_aplicada: 0 };
        }
        // Use _getPropostaTotal for accurate total (handles comma decimals, embalagem, etc)
        const total = this._getPropostaTotal();
        if (total <= 0) return { juros_total: 0, valor_liquido_abmt: 0, taxa_juros_aplicada: 0 };

        const dias = condicaoTipo.replace(' dias','').split('/').map(Number).filter(n => !isNaN(n));
        if (dias.length === 0) return { juros_total: 0, valor_liquido_abmt: 0, taxa_juros_aplicada: 0 };

        const taxa = (this._taxaJurosMensal || 2.8) / 100;
        const valorParcela = total / dias.length;
        let totalComJuros = 0;
        dias.forEach(d => {
            totalComJuros += valorParcela * Math.pow(1 + taxa, d / 30);
        });
        const jurosTotal = Math.round((totalComJuros - total) * 100) / 100;
        const liquidoABMT = Math.round((total - jurosTotal) * 100) / 100;
        return {
            juros_total: jurosTotal,
            valor_liquido_abmt: liquidoABMT,
            taxa_juros_aplicada: this._taxaJurosMensal || 2.8
        };
    },

    _getPropostaTotal() {
        // 1. Use cached total from updateItemsTotals (most reliable — same value shown in VALOR TOTAL)
        if (this._cachedTotal > 0) return this._cachedTotal;

        // 2. Calculate from DOM inputs
        let domTotal = 0;
        document.querySelectorAll('.item-quantidade').forEach((el) => {
            const i = parseInt(el.dataset.index);
            const qtd = parseFloat(el.value || 0);
            const valStr = document.querySelector(`.item-valor[data-index="${i}"]`)?.value || '0';
            const val = parseFloat(valStr.replace(',', '.')) || 0;
            // When unit is KVA, val = price per kVA → multiply by potência
            const unidade = document.querySelector(`.item-unidade[data-index="${i}"]`)?.value;
            const potencia = parseFloat(this.items[i]?.campos_especificos?.potencia || 0);
            if (unidade === 'KVA' && potencia > 0) {
                domTotal += qtd * potencia * val;
            } else {
                domTotal += qtd * val;
            }
            const embCusto = this.items[i]?.campos_especificos?.embalagem_custo_total || 0;
            domTotal += embCusto;
        });
        if (domTotal > 0) return domTotal;

        // 3. Calculate from this.items array (pre-loaded data from API)
        if (this.items?.length > 0) {
            const itemsTotal = this.items.reduce((sum, it) => {
                const vt = parseFloat(it.valor_total) || 0;
                if (vt > 0) return sum + vt;
                const q = parseFloat(it.quantidade) || 0;
                const v = parseFloat(it.valor_unitario) || 0;
                const emb = it.campos_especificos?.embalagem_custo_total || 0;
                return sum + (q * v) + emb;
            }, 0);
            if (itemsTotal > 0) return itemsTotal;
        }

        // 4. Last resort: parse from VALOR TOTAL text display
        const totalsEl = document.getElementById('items-totals');
        if (totalsEl) {
            const text = totalsEl.textContent;
            const valorMatch = text.match(/VALOR\s*TOTAL[:\s]*R?\$?\s*([\d.]+,\d{2})/i);
            if (valorMatch) {
                return parseFloat(valorMatch[1].replace(/\./g, '').replace(',', '.'));
            }
        }
        return 0;
    },

    // ===== PROPOSTA RÁPIDA =====
    async renderPropostaRapida(params = {}) {
        const el = document.getElementById('page-content');
        const tipo = params.tipo || 'VENDA';

        // Carregar lista de clientes pra autocomplete
        const cadastrosData = await APP.api('/api/cadastros?per_page=100&status=Ativo');
        const cadastros = cadastrosData ? cadastrosData.items : [];

        el.innerHTML = `
        ${APP.pageHeader(LI('zap',20)+' Proposta Rápida', 'meu_dia')}
        <form id="proposta-rapida-form" onsubmit="FORMS.submitPropostaRapida(event)">
            <div class="card">
                <div class="card-header"><h3 style="margin:0">Dados básicos</h3></div>
                <div class="form-body" style="padding:16px">
                    <div class="form-group">
                        <label>Cliente *</label>
                        <input type="text" name="cliente_busca" id="pr-cliente-busca" placeholder="Digite para buscar..."
                            autocomplete="off" oninput="FORMS._prBuscarCliente(this.value)" required>
                        <input type="hidden" name="cadastro_id" id="pr-cadastro-id">
                        <div id="pr-cliente-sugestoes" style="display:none" class="search-results"></div>
                    </div>
                    <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                        <div class="form-group">
                            <label>Tipo</label>
                            <select name="tipo">
                                <option value="VENDA" ${tipo==='VENDA'?'selected':''}>Venda</option>
                                <option value="COMPRA" ${tipo==='COMPRA'?'selected':''}>Compra</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>UF Destino</label>
                            <select name="uf_destino" id="pr-uf-destino">
                                <option value="">Selecione</option>
                                ${this.UFS.map(u => `<option value="${u}">${u}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card" style="margin-top:16px">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h3 style="margin:0">Item</h3>
                </div>
                <div class="form-body" style="padding:16px">
                    <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                        <div class="form-group">
                            <label>Categoria *</label>
                            <select name="categoria" required>
                                <option value="">Selecione</option>
                                ${this.CATEGORIAS.map(c => `<option value="${c}">${c}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Unidade</label>
                            <select name="unidade">
                                ${this.UNIDADES.map(u => `<option value="${u}">${u}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
                        <div class="form-group">
                            <label>Quantidade *</label>
                            <input type="number" name="quantidade" value="1" min="1" step="any" required>
                        </div>
                        <div class="form-group">
                            <label>Valor unitário (R$) *</label>
                            <input type="number" name="valor_unitario" step="0.01" min="0" required>
                        </div>
                        <div class="form-group">
                            <label>Peso unitário (kg)</label>
                            <input type="number" name="peso_unitario" step="0.01" min="0" value="0">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Descrição complementar</label>
                        <input type="text" name="descricao_complementar" placeholder="Ex: marca, potência, estado...">
                    </div>
                </div>
            </div>

            <div class="card" style="margin-top:16px">
                <div class="card-header"><h3 style="margin:0">Condição</h3></div>
                <div class="form-body" style="padding:16px">
                    <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                        <div class="form-group">
                            <label>Forma de Pagamento</label>
                            <select name="forma_pagamento">
                                ${this.FORMAS_PAGAMENTO.map(f => `<option value="${f}">${f}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Condição</label>
                            <select name="condicao_pagamento">
                                ${this.CONDICOES_RAPIDAS.map(c => `<option value="${c}">${c}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Observação</label>
                        <textarea name="observacao" rows="2" placeholder="Opcional"></textarea>
                    </div>
                </div>
            </div>

            <div style="margin-top:16px;display:flex;gap:8px">
                <button type="submit" class="btn btn-primary" id="pr-submit-btn">Criar Proposta</button>
                <button type="button" class="btn btn-outline" onclick="APP.navigate('meu_dia')">Cancelar</button>
            </div>
        </form>`;

        // Cache da lista pra autocomplete
        this._prCadastros = cadastros;
    },

    _prBuscarCliente(q) {
        const container = document.getElementById('pr-cliente-sugestoes');
        if (!q || q.length < 2) { container.style.display = 'none'; return; }
        const ql = q.toLowerCase();
        const matches = (this._prCadastros || []).filter(c =>
            (c.razao_social || '').toLowerCase().includes(ql) ||
            (c.nome_fantasia || '').toLowerCase().includes(ql) ||
            (c.cnpj_cpf || '').includes(q)
        ).slice(0, 8);

        if (!matches.length) { container.style.display = 'none'; return; }
        container.innerHTML = matches.map(c => `
            <div class="search-item" onclick="FORMS._prSelecionarCliente(${c.id},'${(c.razao_social||'').replace(/'/g,"\\'")}','${c.uf||''}')">
                <strong>${c.razao_social}</strong>
                <small class="text-muted">${c.cnpj_cpf || ''} ${c.uf ? '· '+c.uf : ''}</small>
            </div>
        `).join('');
        container.style.display = 'block';
    },

    _prSelecionarCliente(id, nome, uf) {
        document.getElementById('pr-cadastro-id').value = id;
        document.getElementById('pr-cliente-busca').value = nome;
        document.getElementById('pr-cliente-sugestoes').style.display = 'none';
        if (uf) {
            const sel = document.getElementById('pr-uf-destino');
            if (sel) sel.value = uf;
        }
    },

    async submitPropostaRapida(e) {
        e.preventDefault();
        const form = e.target;
        const btn = document.getElementById('pr-submit-btn');
        btn.disabled = true;
        btn.textContent = 'Criando...';

        const cadastro_id = document.getElementById('pr-cadastro-id').value;
        if (!cadastro_id) {
            APP.toast('Selecione um cliente da lista', 'warning');
            btn.disabled = false; btn.textContent = 'Criar Proposta';
            return;
        }

        const fd = new FormData(form);
        const qtd = parseFloat(fd.get('quantidade')) || 1;
        const vu = parseFloat(fd.get('valor_unitario')) || 0;
        const pu = parseFloat(fd.get('peso_unitario')) || 0;

        const payload = {
            cadastro_id: parseInt(cadastro_id),
            tipo: fd.get('tipo'),
            uf_destino: fd.get('uf_destino') || '',
            forma_pagamento: fd.get('forma_pagamento'),
            condicao_pagamento: fd.get('condicao_pagamento'),
            observacao: fd.get('observacao') || '',
            items: [{
                categoria: fd.get('categoria'),
                quantidade: qtd,
                unidade: fd.get('unidade'),
                valor_unitario: vu,
                valor_total: qtd * vu,
                peso_unitario: pu,
                peso_total: pu * qtd,
                descricao_complementar: fd.get('descricao_complementar') || '',
                campos_especificos: ''
            }]
        };

        const res = await APP.api('/api/propostas', {
            method: 'POST',
            body: payload
        });

        if (res && res.ok) {
            APP.toast('Proposta criada: ' + res.numero, 'success');
            APP.navigate('proposta_view', { id: res.id });
        } else {
            APP.toast(res?.error || 'Erro ao criar proposta', 'danger');
            btn.disabled = false; btn.textContent = 'Criar Proposta';
        }
    }
};
