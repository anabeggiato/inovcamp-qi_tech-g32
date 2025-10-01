# Monetização — QI‑EDU

QI‑EDU gera receita a partir de: (a) tarifas one‑time na abertura do empréstimo (origination e marketplace), (b) taxa recorrente de custódia, (c) micro‑spread sobre juros e (d) serviços B2B/analytics. O risco determinante do modelo é a inadimplência (Default Rate — DR). O piloto tem por objetivo validar se o score preditivo e integrações reduzem DR para ≤ 2%, condição necessária para viabilidade financeira nas premissas iniciais.

---

## 1. Premissas e tarifas do piloto

| Item                                    |             Regra / taxa | Valor (ticket = R$ 5.000) |
| --------------------------------------- | -----------------------: | ------------------------: |
| Ticket médio                            |                        — |              **R$ 5.000** |
| Origination (one‑time)                  |        1,5% do principal |                 **R$ 75** |
| Marketplace / Matching (one‑time)       |        0,5% do principal |                 **R$ 25** |
| Custody (recorrente)                    |  0,10% / mês (1,2% a.a.) |           **R$ 60 / ano** |
| Interest spread (micro‑spread)          |                0,5% a.a. |           **R$ 25 / ano** |
| Processing (custo operacional por loan) |        1,0% do principal |                 **R$ 50** |
| Collection (em atraso)                  | R$ 50 + 3% sobre parcela |                         — |
| Fixed Opex anual (piloto)               |                        — |             **R$ 30.000** |
| Baseline Default Rate (DR)              |   Assunção para cenários |                  **2,0%** |

Observação: tarifas calibradas para facilitar adoção no piloto. Ajustes posteriores devem ser baseados em dados reais de DR e CAC.

---

## 2. Definições chave

- **Ticket**: valor médio do empréstimo (R$ 5.000).
- **Origination**: taxa única de abertura do contrato.
- **Marketplace / Matching**: taxa única pela operação de conectar empréstimo a investidores.
- **Custody**: taxa recorrente pela gestão e segregação de ativos sob custódia.
- **Spread**: diferença retida pela plataforma sobre o fluxo de juros.
- **Processing**: custos operacionais diretos por contrato.
- **Provisioning / Provisão por default**: perda esperada por inadimplência = DR × Ticket.
- **Contribution**: margem unitária disponível para cobrir o Opex fixo = receita por loan − custo por loan.
- **Breakeven loans**: número de loans necessários para cobrir o Fixed Opex anual.

---

## 3. Fórmulas (unit economics)

- **Revenue_per_loan_first_year** = Origination + Marketplace + Custody_annual + Spread_annual
- **Cost_per_loan_year** = Processing + Provisioning (DR × Ticket) + Collection_costs (se ocorrerem)
- **Contribution_per_loan** = Revenue_per_loan_first_year − Cost_per_loan_year
- **Breakeven_loans** = Fixed_Opex_annual / Contribution_per_loan (válido quando Contribution_per_loan > 0)

Exemplo numérico (premissas acima):

- Revenue = R$75 + R$25 + R$60 + R$25 = **R$185** (1º ano)
- Cost = R$50 + (DR × R$5.000)

---

## 4. Cenários (impacto do DR)

|              DR | Provision (DR × R$5.000) | Cost (Processing + Provision) | Revenue | Contribution |                        Breakeven (≈) |
| --------------: | -----------------------: | ----------------------------: | ------: | -----------: | -----------------------------------: |
|            1,0% |                    R$ 50 |                        R$ 100 |  R$ 185 |    **R$ 85** |                        **353 loans** |
| 2,0% (baseline) |                   R$ 100 |                        R$ 150 |  R$ 185 |    **R$ 35** |                        **858 loans** |
|            5,0% |                   R$ 250 |                        R$ 300 |  R$ 185 |  **−R$ 115** | **Inviável** (contribuição negativa) |

Interpretação: pequenas alterações em DR impactam de forma significativa a contribuição unitária e, consequentemente, o número de operações necessário para cobrir custos fixos.

---

## 4.1 Simulação explicativa (caso exemplificativo)

**Premissa do caso:**

- Coorte: **200 loans**
- Ticket médio: **R$5.000**
- Tarifas piloto: **Revenue por loan = R$185**
- Custo fixo por loan: **Processing = R$50**
- Opex fixo anual: **R$30.000**

Objetivo: demonstrar impacto do **Default Rate (DR)** na contribuição total e no progresso rumo ao breakeven.

|   DR | Contribuição por loan | Contribuição total (200 loans) | Cobertura do Fixed Opex (R$30.000) | Observação                                                               |
| ---: | --------------------: | -----------------------------: | ---------------------------------: | ------------------------------------------------------------------------ |
| 1,0% |                 R$ 85 |                      R$ 17.000 |                              56,7% | Faltam 153 loans para atingir breakeven (breakeven ≈ 353 loans)          |
| 2,0% |                 R$ 35 |                       R$ 7.000 |                              23,3% | Faltam 658 loans para atingir breakeven (breakeven ≈ 858 loans)          |
| 5,0% |               −R$ 115 |                     −R$ 23.000 |                                  — | Operação em prejuízo: cada loan reduz caixa — modelo inviável sem ajuste |

**Conclusão do caso:** com 200 loans, o cenário com DR ≤ 1% aproxima o projeto do breakeven, mas ainda exige escala. Cenário com DR = 2% requer volume substancialmente maior; DR elevados tornam a operação deficitária.

---

## 5. Condições de viabilidade

O modelo, nas tarifas propostas, é viável se o piloto confirmar simultaneamente:

1. **DR ≤ 2%** por meio do score preditivo e integrações; e
2. **Parcerias com 1–3 faculdades** que garantam volume e integração operacional.

Sem esses dois pontos, é necessário reescalar tarifas (custody/origination) ou introduzir garantias/seguros e mecanismos de mitigação de risco.

---

## 6. Estratégia de pricing e regras de piloto

- Piloto (0–6 meses): origination 1,5% cobrada ao aluno ou rateada com a faculdade; custody 0,10%/mês; marketplace 0,5% no fechamento.
- Promoção inicial: desconto em origination para as primeiras 100–200 operações (ex.: 1,0%).
- Pós‑pilot: se DR ≤ 2% → manter tarifas e priorizar upsell de analytics; se DR > 3% → aplicar correção de preço (+0,25–0,5 pp) ou exigir garantias.

---

## 7. Principais métricas a monitorar

- Default Rate (DR) — principal indicador de risco
- Nº de loans abertos (piloto)
- Revenue per loan (Year 1)
- Contribution per loan
- Breakeven loans (atualizado conforme DR)
- AUM sob custódia (R$)
- Match rate e time to disbursement

---

## 8. Riscos e medidas de mitigação

- Risco: DR elevado → Mitigação: aprimoramento de score (sinais acadêmicos e comportamentais), integrações com faculdades para verificação contínua, retenção parcial de repasses até confirmação de matrícula ativa, seguro ou garantias parciais.
- Risco: resistência a taxas → Mitigação: co‑pagamento com faculdades, parcelamento do origination, promoções de adoção.
- Risco: baixa oferta de investidores → Mitigação: incentivos a early adopters, transparência de performance, eventuais mecanismos de buyback.
- Risco: compliance/custódia → Mitigação: parceria com custodiante regulado, contratos e auditoria externa.

---

## 9. Roadmap comercial (90–180 dias)

1. Mês 0–1: fechar 1 faculdade piloto com integração mínima de alertas.
2. Mês 1–3: captar 10–30 investidores early adopters; abrir 150–300 loans piloto (ticket R$5k).
3. Mês 3–6: mensurar DR e AUM, ajustar fees; lançar analytics beta.
4. Mês 6–12: ampliar parcerias, otimizar pricing e preparar escala.

---

## 10. Próximas ações operacionais (prioridade)

1. Criar contrato padrão para cobrança de origination, custody e marketplace.
2. Implementar fluxo financeiro via escrow com lançamentos automáticos das fees.
3. Construir relatório financeiro por loan (revenue, provisioning, contribution).
4. Preparar dashboard inicial e metas do piloto (nº loans, DR target, AUM).
5. Material comercial para faculdades (business case: impacto em matrículas e retenção).

---

**Versão:** Oficial — Piloto (premissas 5k ticket).
**Observação:** ajustar premissas conforme dados efetivos de CAC e DR obtidos no piloto.
