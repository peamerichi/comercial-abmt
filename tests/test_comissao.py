"""
Testes da função calcular_comissao_item.
A mesma função é usada pelo sistema (app.py) para calcular comissões em OVs.
Os testes validam: fórmula base, ICMS por UF, isenção, PIS, perfis, categoria sem tabela, e valor zero.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import calcular_comissao_item


# Configs simulando o que vem do banco (formato real)
CONFIGS_BASE = {
    'comissao_vendas': '{"vendedor": {"Transformador Usado": 2.5, "Cobre": 1.0}, "gerente": {"Transformador Usado": 1.5, "Cobre": 0.5}, "diretor": {"Transformador Usado": 1.0}}',
    'icms_tabela': '{"SP": 18, "MG": 12, "RJ": 12, "BA": 7, "AM": 7}',
    'pis_percentual': '9.25'
}


def test_comissao_basica_vendedor_sp():
    """Vendedor, SP, não isento: base = 10000 * (1 - 9.25/100 - 18/100) = 7275. Com 2.5% = 181.88"""
    r = calcular_comissao_item(10000, 'Transformador Usado', 'vendedor', 'SP', False, 9.25, CONFIGS_BASE)
    assert r['comissao_percentual'] == 2.5
    assert r['icms_pct'] == 18
    assert r['pis_pct'] == 9.25
    assert r['base_liquida'] == 7275.0
    assert r['comissao_valor'] == 181.88


def test_comissao_gerente_sp():
    """Gerente tem tabela menor (1.5% vs 2.5%)"""
    r = calcular_comissao_item(10000, 'Transformador Usado', 'gerente', 'SP', False, 9.25, CONFIGS_BASE)
    assert r['comissao_percentual'] == 1.5
    assert r['comissao_valor'] == 109.12  # 7275 * 1.5%


def test_comissao_diretor_sp():
    """Diretor tem tabela ainda menor (1.0%)"""
    r = calcular_comissao_item(10000, 'Transformador Usado', 'diretor', 'SP', False, 9.25, CONFIGS_BASE)
    assert r['comissao_percentual'] == 1.0
    assert r['comissao_valor'] == 72.75


def test_icms_isento_sp():
    """Isento de ICMS em SP: ICMS = 0, base maior"""
    r = calcular_comissao_item(10000, 'Transformador Usado', 'vendedor', 'SP', True, 9.25, CONFIGS_BASE)
    assert r['icms_pct'] == 0
    assert r['base_liquida'] == 9075.0  # 10000 * (1 - 9.25/100)
    assert r['comissao_valor'] == 226.88  # 9075 * 2.5%


def test_icms_interestadual_mg():
    """MG: ICMS 12% (interestadual)"""
    r = calcular_comissao_item(10000, 'Transformador Usado', 'vendedor', 'MG', False, 9.25, CONFIGS_BASE)
    assert r['icms_pct'] == 12
    assert r['base_liquida'] == 7875.0  # 10000 * (1 - 9.25/100 - 12/100)
    assert r['comissao_valor'] == 196.88


def test_icms_interestadual_ba():
    """BA: ICMS 7% (N/NE)"""
    r = calcular_comissao_item(10000, 'Transformador Usado', 'vendedor', 'BA', False, 9.25, CONFIGS_BASE)
    assert r['icms_pct'] == 7
    assert r['base_liquida'] == 8375.0  # 10000 * (1 - 9.25/100 - 7/100)
    assert r['comissao_valor'] == 209.38


def test_categoria_sem_tabela():
    """Categoria não cadastrada na tabela de comissão: percentual = 0"""
    r = calcular_comissao_item(10000, 'Radiadores', 'vendedor', 'SP', False, 9.25, CONFIGS_BASE)
    assert r['comissao_percentual'] == 0
    assert r['comissao_valor'] == 0.0


def test_valor_zero():
    """Valor total zero: comissão zero, sem erro"""
    r = calcular_comissao_item(0, 'Transformador Usado', 'vendedor', 'SP', False, 9.25, CONFIGS_BASE)
    assert r['comissao_valor'] == 0.0
    assert r['base_liquida'] == 0.0


def test_uf_sem_icms_cadastrado():
    """UF não cadastrada na tabela ICMS: ICMS = 0"""
    r = calcular_comissao_item(10000, 'Cobre', 'vendedor', 'TO', False, 9.25, CONFIGS_BASE)
    assert r['icms_pct'] == 0
    assert r['base_liquida'] == 9075.0


if __name__ == '__main__':
    tests = [f for f in dir() if f.startswith('test_')]
    passed = 0
    failed = 0
    for name in sorted(tests):
        try:
            globals()[name]()
            print(f'  PASS  {name}')
            passed += 1
        except AssertionError as e:
            print(f'  FAIL  {name}: {e}')
            failed += 1
        except Exception as e:
            print(f'  ERROR {name}: {e}')
            failed += 1
    print(f'\n{passed} passed, {failed} failed, {passed+failed} total')
