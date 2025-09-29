---
title: Fluxos de automação (RPA)
sidebar_position: 5
---

# Documentação - Fluxos de Automação (Hackathon QI Tech)

## 1. Fluxos de Automação

| Fluxo                   | Tabelas Usadas              | Descrição |
|--------------------------|-----------------------------|-----------|
| **Onboarding Automático** | users, frauds              | Cadastro do usuário, validação de CPF/idade, envio de OTP, registro de falhas em antifraude. |
| **Antifraude Automático** | frauds, users              | Job lê sinais, calcula score de fraude e atualiza snapshot do usuário. |
| **Score de Crédito Dinâmico** | scores, users, ledger    | Job calcula score baseado em KYC, fraudes e histórico de pagamentos. |
| **Matching P2P Automático** | loans, offers, matches    | Job casa pedidos com ofertas compatíveis e registra matches. |
| **Liberação & Contratos** | loans, ledger              | API gera contrato (JSON), ledger registra liberação (SISTEMA → TOMADOR). |
| **Cobrança Automática** | ledger, frauds              | Job verifica parcelas, registra pagamentos no ledger, gera eventos de atraso. |
| **Notificações Automáticas** | users, frauds, ledger     | Job envia notificações (e-mail/SMS fake) e registra logs de envio. |

---

## 2. Benefício Geral dos Fluxos

- Reduz ao máximo processos manuais.  
- Dá clareza de que a plataforma **funciona sozinha**.  
- Permite mostrar na demo uma jornada 100% automática:  
  **cadastro → antifraude → score → matching → contrato → pagamento → cobrança → notificação**.  

---

## 3. Justificativa dos Fluxos de Automação

- **Onboarding Automático:** evita filas manuais e demonstra simplicidade.  
- **Antifraude Automático:** reforça segurança, requisito crítico do desafio.  
- **Score Dinâmico:** garante transparência e democratização do crédito.  
- **Matching P2P:** reduz burocracia e mostra tecnologia conectando pessoas diretamente.  
- **Liberação & Contratos:** ledger garante consistência e elimina erros humanos.  
- **Cobrança Automática:** dá robustez ao sistema, cuidando do pós-liberação.  
- **Notificações Automáticas:** melhoram experiência do usuário e tornam o sistema proativo.  

**Resumo:** estes fluxos cobrem a jornada completa do crédito e refletem a missão da QI Tech de simplificar processos financeiros com tecnologia.