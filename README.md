# 🚀 QI-EDU — Plataforma de Crédito Educacional P2P

# Acesse aqui a documentação do projeto: https://anabeggiato.github.io/inovcamp-qi_tech-g32/


A **QI-EDU** é uma solução desenvolvida no Hackathon QI Tech 2025 que conecta **estudantes, investidores e instituições de ensino** por meio de uma plataforma de **crédito educacional peer-to-peer (P2P)**.  
Nosso diferencial está no **Score Preditivo**, que leva em conta notas, frequência e sinais de evasão para oferecer crédito mais justo e sustentável.

## 🌐 Status do Projeto

✅ **Frontend iniciado:** já conta com uma **Landing Page** e páginas base para:  
- Funcionamento da plataforma  
- Área para Estudantes  
- Área para Investidores  

📂 Estrutura atual:
```
/src/client
 └── src/app/
     ├── components/
     ├── funcionamento/
     ├── para-estudantes/
     ├── para-investidores/
     ├── favicon.ico
     ├── globals.css
     ├── layout.js
     └── page.js
```

---

## Tecnologias Utilizadas

- **Frontend:** [Next.js](https://nextjs.org/) + React  
- **Estilização:** CSS (arquivo `globals.css`)  
- **Backend (planejado):** Node.js + Express (API REST)  
- **Banco de Dados (planejado):** PostgreSQL + Redis  

---

## Como Rodar o Frontend

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou superior)  
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/) instalado  

### Passos
1. Clone o repositório:
   ```bash
   git clone https://github.com/anabeggiato/inovcamp-qi_tech-g32
   cd src/client
   ```

2. Instale as dependências:
   ```bash
   npm install
   # ou
   yarn install
   ```

3. Rode o servidor de desenvolvimento:
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

4. Abra no navegador:
   ```
   http://localhost:3000
   ```

---

## Próximos Passos
- Desenvolvimento do Backend.
- Conectar o frontend à API backend (Node.js/Express).  
- Implementar autenticação JWT.  
- Integrar banco de dados (PostgreSQL).  
- Adicionar fluxo de solicitação de crédito e dashboards.  
