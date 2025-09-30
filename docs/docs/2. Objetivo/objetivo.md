---
title: Objetivo
sidebar_position: 2
---

# Objetivo Geral

Desenvolvimento de uma Plataforma de Infraestrutura Lending as a Service (LaaS) Peer-to-Peer (P2P) para Crédito Educacional, denominada **QI-EDU**. O propósito central é conectar Investidores (Credores) a Alunos (Tomadores), automatizando a concessão de crédito de forma segura, escalável e com risco de crédito mitigado, com ênfase na rastreabilidade e repasse seguro dos fundos para a instituição de ensino.

# Objetivos Específicos

Os objetivos específicos detalham as funcionalidades principais da solução, demonstrando sua viabilidade técnica e os benefícios para alunos e investidores:

1. **Garantia de Governança e Uso (Sistema de Custódia):**  
   Gerenciamento seguro dos recursos do empréstimo em uma **Carteira de Custódia (Escrow Virtual)**, com rastreabilidade contábil garantida por um **Ledger de Dupla Entrada**. Os recursos são liberados exclusivamente para a faculdade, eliminando risco de desvio e simplificando o fluxo de conciliação B2B. Isso garante segurança para investidores e transparência para as instituições.

2. **Análise de Risco Justa e Inteligente (Score Preditivo):**  
   Motor de **Score de Crédito proprietário** que utiliza desempenho acadêmico (notas e frequência) como principal input, combinado com histórico de pagamentos e sinais de risco. Permite a concessão de crédito mais justa, oferecendo taxas competitivas para talentos de baixo risco que seriam ignorados pelos modelos tradicionais (SPC/Serasa), ampliando o acesso ao financiamento estudantil.

3. **Proteção Proativa contra Evasão (Antifraude Comportamental):**  
   Monitoramento contínuo de alertas de risco da faculdade (via API B2B), como trancamento de matrícula ou alto índice de faltas, gerando um ``fraud_score`` comportamental. Em casos de alto risco, o sistema bloqueia automaticamente o repasse da próxima mensalidade da Custódia, protegendo o capital do investidor e garantindo que apenas alunos ativos recebam o crédito.

4. **Automação e Escalabilidade na Liquidação (Infraestrutura P2P):**  
   Motor da Infraestrutura P2P realiza o **matching automatizado** entre ofertas de investidores e pedidos de empréstimo, permitindo fracionamento e mitigação do risco. Além disso, gerencia todo o fluxo da **Liquidação Programada da mensalidade**, assegurando a transferência automática e direta da carteira de custódia para a conta de recebimento da faculdade, de forma escalável e confiável.
