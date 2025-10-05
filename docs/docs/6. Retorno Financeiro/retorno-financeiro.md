# QI-EDU — Modelo de Monetização e Viabilidade Financeira

## 1. Estrutura de Receitas

A plataforma opera com quatro fontes de receita distintas: taxas one-time na originação e matching, receita recorrente de custódia e micro-spread sobre o fluxo de juros. O modelo foi calibrado para um ticket médio de R$ 5.000, com as seguintes tarifas:

| Componente                | Base de Cálculo        | Valor (ticket R$ 5k) |
| :------------------------ | :--------------------- | :------------------- |
| Originação                | 1,5% do principal      | R$ 75                |
| Marketplace / Matching    | 0,5% do principal      | R$ 25                |
| Custódia                  | 0,10% a.m. (1,2% a.a.) | R$ 60/ano            |
| Spread sobre juros        | 0,5% a.a.              | R$ 25/ano            |
| **Receita total (ano 1)** | —                      | **R$ 185**           |

Do lado dos custos, o `processing operacional` representa **1,0%** do principal (`R$ 50 por empréstimo`), enquanto a provisão para inadimplência varia conforme a `Default Rate (DR)` observada. O custo fixo operacional do piloto está estimado em **R$ 30.000 anuais**.

## 2. Análise de Sensibilidade ao Default Rate

A viabilidade econômica do modelo depende diretamente do controle da inadimplência. A tabela abaixo demonstra o impacto de diferentes níveis de DR na margem de contribuição unitária:

|   DR | Provisão | Custo Total | Receita | Contribuição |       Breakeven |
| ---: | -------: | ----------: | ------: | -----------: | --------------: |
| 1,0% |    R$ 50 |      R$ 100 |  R$ 185 |        R$ 85 | 353 empréstimos |
| 2,0% |   R$ 100 |      R$ 150 |  R$ 185 |        R$ 35 | 858 empréstimos |
| 5,0% |   R$ 250 |      R$ 300 |  R$ 185 |      -R$ 115 |        Inviável |

Com DR de 2%, são necessários 858 empréstimos para cobrir o custo fixo anual. A cada ponto percentual de aumento na inadimplência, a contribuição unitária cai R$ 50, elevando substancialmente o volume necessário para breakeven. Acima de 3,7% de DR, o modelo se torna estruturalmente deficitário nas tarifas atuais.

## 3. Vantagens Competitivas (Implementadas)

### Score Preditivo com Análise de Risco Contextual

O principal diferencial técnico da plataforma é o motor de credit scoring que processa variáveis acadêmicas em tempo real, combinado com um sistema de análise de risco que avalia cada operação antes da aprovação. O algoritmo analisa:

- **Dados acadêmicos:** Notas, frequência, histórico de bolsas, engajamento institucional
- **Contexto da operação:** Ritmo de tentativas, padrão de uso, dispositivo, localização, histórico de interações
- **Variáveis comportamentais:** Consistência de informações, histórico de solicitações, sinais de comportamento suspeito

O sistema de análise de risco classifica cada operação em níveis (baixo/médio/alto) e recomenda ações: aprovação automática, verificação adicional, recusa ou bloqueio temporário. Esta abordagem permite identificar bons pagadores que seriam rejeitados por modelos convencionais, ao mesmo tempo que barra operações suspeitas antes da originação, reduzindo chargebacks e perdas operacionais.

### Integração com Sistemas Acadêmicos (API)

A arquitetura implementada permite integração direta com sistemas das instituições de ensino via API REST. O fluxo atual:

1. Estudante solicita empréstimo na plataforma
2. Sistema consulta API da faculdade em tempo real
3. Dados acadêmicos são processados pelo score preditivo
4. Decisão de crédito é tomada com base em informações atualizadas

Esta integração viabiliza monitoramento contínuo de indicadores de risco e permite que as instituições participem do modelo de co-pagamento de taxas, alinhando incentivos para retenção de alunos.

### Matching P2P Automatizado

O algoritmo de matching conecta automaticamente estudantes aprovados com investidores disponíveis, considerando:

- Perfil de risco do estudante (score)
- Preferências de risco do investidor (Conservador/Moderado/Arrojado)
- Ticket e prazo do empréstimo
- Disponibilidade de capital

O sistema elimina fricção operacional e reduz o time to disbursement, melhorando a experiência tanto para estudantes quanto para investidores.

### Fluxo de Pagamento Integrado

A plataforma implementa integração com gateway de pagamento via API, automatizando:

- Desembolso do valor aprovado para o estudante
- Cobrança de taxas (originação, marketplace, custódia)
- Registro de transações no banco de dados
- Atualização de status em tempo real

Esta automação reduz custos operacionais e garante rastreabilidade completa do fluxo financeiro.

### Arquitetura Técnica Escalável

A solução foi desenvolvida com stack moderna e escalável:

- **Backend:** Node.js/Express com autenticação JWT
- **Frontend:** Next.js com React para interfaces responsivas
- **Banco de dados:** PostgreSQL com migrations e seeds estruturados
- **APIs:** Arquitetura RESTful com separação clara de responsabilidades

Esta base técnica permite evolução rápida do produto e adição de novas funcionalidades sem refatoração estrutural.

## 4. Premissas de Viabilidade

O modelo financeiro proposto é viável sob duas condições simultâneas:

**DR ≤ 2%** — O score preditivo com análise de risco contextual, combinado com dados acadêmicos em tempo real, deve manter a inadimplência dentro deste limite. O sistema de análise de risco adiciona uma camada de proteção que reduz operações suspeitas e chargebacks, algo inexistente em plataformas concorrentes.

**Parcerias institucionais** — A operação depende de acordos com 1 a 3 faculdades no piloto, garantindo fluxo de originação e integração via API. O co-pagamento de taxas com as instituições pode ser necessário para reduzir resistência inicial dos alunos.

## 5. Estratégia de Pricing

**Piloto (0-6 meses)** — Tarifas conforme tabela inicial. Possível desconto promocional na originação para os primeiros 100-200 empréstimos (redução para 1,0%).

**Pós-piloto** — Se DR ≤ 2%, manter tarifas e priorizar upsell de analytics B2B. Se DR > 3%, aplicar correção de +0,25 a 0,5 p.p. nas taxas ou exigir garantias parciais (retenção de repasses, seguro).

## 6. Diferenciais vs. Concorrência

| Aspecto                      | QI-EDU                                                       | Concorrentes Tradicionais   | Plataformas P2P Informais |
| :--------------------------- | :----------------------------------------------------------- | :-------------------------- | :------------------------ |
| **Score de crédito**         | Variáveis acadêmicas + análise contextual                    | Apenas histórico de crédito | Sem score estruturado     |
| **Análise de risco**         | Sistema contextual pré-operação (ritmo, padrão, dispositivo) | Análise manual pós-fraude   | Inexistente               |
| **Integração institucional** | API em tempo real                                            | Sem integração              | Sem integração            |
| **Matching**                 | Algoritmo automatizado                                       | N/A (crédito direto)        | Manual ou semi-manual     |
| **Transparência**            | Dashboard completo para ambos os lados                       | Opaca para investidores     | Variável                  |
| **Compliance**               | Estrutura de custódia regulada (roadmap)                     | Regulado                    | Não regulado              |

O principal diferencial competitivo está na combinação de score preditivo acadêmico com análise de risco contextual em tempo real, algo inexistente no mercado atual de crédito estudantil. Enquanto bancos tradicionais rejeitam estudantes sem histórico de crédito e plataformas P2P informais operam sem proteção contra operações suspeitas, a QI-EDU oferece uma solução que equilibra inclusão financeira com gestão de risco operacional.

## 7. Métricas de Acompanhamento

As seguintes métricas serão monitoradas semanalmente durante o piloto:

- Default Rate (DR) por coorte
- Taxa de operações com risco alto/médio (risk assessment rate)
- Taxa de bloqueio/verificação adicional
- Número de empréstimos originados
- Revenue per loan (ano 1)
- Contribution margin unitária
- Assets Under Management (AUM)
- Match rate e time to disbursement
- Taxa de conversão (aplicação → aprovação → desembolso)
- NPS de estudantes e investidores

## 8. Riscos Operacionais e Mitigação

| Risco                                            | Mitigação                                                                                                                 |
| :----------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------ |
| DR acima de 2%                                   | Refinamento contínuo do score com novos dados; ajuste de pesos das variáveis acadêmicas; introdução de garantias parciais |
| Operações suspeitas não detectadas               | Refinamento dos parâmetros de análise contextual; machine learning para novos padrões; verificação biométrica (roadmap)   |
| Falsos positivos (usuários legítimos bloqueados) | Calibração dos thresholds de risco; processo de revisão manual ágil; comunicação clara sobre verificações adicionais      |
| Resistência a taxas                              | Co-pagamento institucional; parcelamento da originação; promoções de adoção                                               |
| Baixa liquidez de investidores                   | Incentivos a early adopters; transparência de performance; estrutura de buyback                                           |
| Instabilidade de APIs externas                   | Fallback para dados em cache; SLA com instituições parceiras; redundância de provedores                                   |

## 9. Roadmap de Execução

### Fase Atual (Hackathon - MVP Funcional)

**Implementado:**

- Sistema completo de originação e matching de empréstimos
- Score preditivo com variáveis acadêmicas e análise de risco contextual
- Análise de risco por operação (avalia ritmo, padrão, contexto) com classificação de níveis
- Integração via API com sistemas acadêmicos (mockado para demo)
- Integração via API com gateway de pagamento (mockado para demo)
- Dashboard funcional para estudantes (visualização de score, solicitação de empréstimo)
- Dashboard funcional para investidores (listagem de oportunidades, financiamento)
- Autenticação JWT e gestão de sessões
- Banco de dados PostgreSQL com migrations e seeds completos
- Fluxo end-to-end: solicitação → análise de risco → aprovação/verificação → matching → desembolso

### Próximos 90 Dias (Pós-Hackathon)

**Mês 0-1** — Substituir APIs mockadas por integrações reais com 1 faculdade piloto e 1 gateway de pagamento homologado. Desenvolvimento de contratos padrão e fluxo de escrow. Implementação de lançamento automático de tarifas.

**Mês 1-3** — Captação de 10-30 investidores early adopters. Originação de 150-300 empréstimos. Construção de dashboard financeiro por loan (revenue, provisioning, contribution). Material comercial para faculdades. Calibração dos parâmetros de análise de risco com dados reais.

**Mês 3-6** — Mensuração de DR e taxa de operações de risco alto/médio. Ajuste de fees baseado em dados reais. Lançamento beta de analytics para instituições. Preparação de estrutura de compliance e auditoria. Refinamento do algoritmo de score e análise contextual com machine learning.

### Próximos 180 Dias (Escala)

**Mês 6-9** — Expansão de parcerias para 3-5 instituições. Otimização de pricing. Desenvolvimento do sistema de tiers (Bronze/Prata/Ouro) para engajamento de investidores de maior ticket. Implementação de machine learning avançado para análise de risco contextual.

**Mês 9-12** — Lançamento público dos tiers com perks diferenciados. Estruturação de mercado secundário (MVP). Parceria com custodiante regulado. Preparação para rodada de investimento Série A.

## 10. Sistema de Tiers (Roadmap Futuro)

O sistema de tiers será implementado após validação do modelo base no piloto. Trata-se de um produto complementar opt-in para aumentar ticket médio e engajamento de investidores, sem alterar a estrutura de risco dos empréstimos.

### Estrutura Planejada

| Tier   | Threshold          | Perks                                                                                              |
| :----- | :----------------- | :------------------------------------------------------------------------------------------------- |
| Bronze | `R$ 5k – R$ 50k`   | Seleção de até 3 estudantes; dashboard básico                                                      |
| Prata  | `R$ 50k – R$ 250k` | Catálogo completo; relatórios trimestrais; 1 mentoria/ano                                          |
| Ouro   | `R$ 250k+`         | Co-criação de fundos temáticos; acesso prioritário ao mercado secundário; evento anual; tax report |

### Monetização Incremental

A receita adicional virá de: (a) taxa de adesão opcional ao tier, (b) assinatura para relatórios avançados e tax reports, (c) serviços B2B (estruturação de fundos, eventos corporativos). Meta de LTV incremental superior ao CAC incremental por tier.

## 11. Próximos Passos

1. Homologar integração com gateway de pagamento real (Stripe/Mercado Pago)
2. Fechar parceria com primeira instituição de ensino para integração via API
3. Finalizar contrato padrão com estrutura de fees e escrow
4. Expandir base de dados de fraudes com fontes públicas e privadas
5. Obter aprovação jurídica para termos de uso e estrutura de custódia
6. Preparar material comercial demonstrando redução de evasão para faculdades

---

**Versão:** MVP Hackathon — Premissas validadas com ticket R$ 5k e DR target de 2%.  
**Nota:** Todas as premissas serão ajustadas conforme dados efetivos de CAC, DR, taxa de operações de risco e performance observados no piloto. O sistema de análise de risco é mockado para demonstração e pode ser calibrado com dados reais na fase de produção.
