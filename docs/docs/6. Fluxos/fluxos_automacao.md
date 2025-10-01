---
title: Fluxos de Automação
sidebar_position: 6
---

| Fluxo                           | Componentes/Tabelas Usadas | Descrição |
|--------------------------------|-----------------------------|-----------|
| **Onboarding Automático**       | users, frauds              | Durante o cadastro, o sistema valida CPF, idade e dados básicos; registra possíveis falhas em antifraude. |
| **Antifraude Contínuo**         | frauds, users              | Job lê sinais de risco (ex.: trancamento de matrícula) e atualiza o snapshot do usuário (`fraud_score`, `fraud_status`). |
| **Score Dinâmico**              | scores, users, academic_performance | Jobs periódicos recalculam o score com base em notas, frequência e histórico de pagamento. |
| **Matching P2P Automático**     | loans, offers, matches     | Worker conecta pedidos de empréstimo com ofertas de investimento compatíveis, registrando a relação no banco. |
| **Ledger de Dupla Entrada**     | ledger, loans, offers      | Todas as movimentações (liberação, pagamentos, repasses) são lançadas automaticamente no ledger. |
| **Liberação Automática**        | ledger, institutions       | Após contrato, o sistema agenda a liquidação e repassa valor para a faculdade (mockado no MVP). |
| **Cobrança Automática**         | ledger, users              | Verifica parcelas em aberto, registra pagamentos e gera eventos de atraso no ledger. |
| **Notificações Automáticas**    | users, ledger, frauds      | Envio de alertas (aprovado, risco, pagamento) para estudantes e investidores (mockados no MVP). |

---

## 2. Benefício Geral dos Fluxos

- **Minimizam processos manuais**, garantindo eficiência.  
- **Dão clareza de autonomia**: a plataforma funciona sozinha após input inicial do usuário.  
- **Mostram inovação na demo**: a jornada completa pode ser simulada de ponta a ponta.  

---

## 3. Justificativa dos Fluxos

- **Onboarding Automático:** garante inclusão rápida e elimina burocracia.  
- **Antifraude Contínuo:** reforça a segurança e protege investidores.  
- **Score Dinâmico:** ajusta o risco em tempo real conforme desempenho do aluno.  
- **Matching P2P Automático:** demonstra a inovação de conectar diretamente quem precisa de crédito e quem quer investir.  
- **Ledger Automático:** assegura rastreabilidade financeira.  
- **Cobrança e Liberação:** garantem fluxo confiável de capital.  
- **Notificações Automáticas:** aumentam transparência e melhoram experiência do usuário.  

**Resumo:** os fluxos de automação são o motor invisível da QI-EDU, transformando o cadastro inicial em uma experiência contínua, inteligente e confiável para todos os envolvidos.  
