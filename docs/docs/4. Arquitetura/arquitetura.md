---
title: Arquitetura do sistema
sidebar_position: 4
---

# Arquitetura da Solução (Hackathon QI Tech)

## 1. Decisões de Design

- **Modularidade:** cada função principal (onboarding, antifraude, score, matching, ledger, notificações) foi isolada como módulo de negócio.  
- **Jobs RPA (Crons):** automatizam as principais tarefas recorrentes (fraude, score, matching, cobrança, notificações).  
- **Banco de Dados Único (PostgreSQL):** modelo minimalista, mas robusto, já documentado separadamente.  
- **Ledger de dupla entrada:** garante rastreabilidade e consistência em todas as operações financeiras.  
- **Camada de API Gateway:** concentra autenticação, rate limit e exposição de endpoints REST.  
- **Frontend leve:** formulários e dashboard para visualização do fluxo end-to-end.  

---

## 2. Vantagens da Arquitetura

- Simples de implementar em poucos dias de hackathon.  
- Modular, facilitando apresentação didática (cada parte é clara e isolada).  
- Robusta para auditoria (ledger + logs + snapshots).  
- Permite evolução natural para microserviços, se o produto crescer.  
- Jobs independentes garantem automação máxima e refletem o conceito de RPA.  

---

## 3. Diagrama de Arquitetura

![Arquitetura da Solução](/img/arquitetura_qitech_hackathon.png)

> O diagrama mostra os blocos principais: Frontend, API Gateway, módulos de negócio, jobs RPA e banco de dados.

---

## 4. Fluxo dos Dados

1. Usuário acessa o **Frontend (React)** e envia requisições à **API**.  
2. A **API Gateway** valida, autentica e encaminha para os módulos (Onboarding, Antifraude, Score, Matching, Ledger, Notificações).  
3. Dados são persistidos no **PostgreSQL** (`users, loans, offers, matches, ledger, fraudes, scores`).  
4. **Workers/Jobs (crons)** automatizam antifraude, cálculo de score, matching de pedidos e ofertas, cobrança de parcelas e envio de notificações.  
5. O **Dashboard** exibe status e métricas em tempo real, consultando o backend.  
