# 🚀 Guia de Configuração - Painel Admin + MongoDB

## 📋 Sumário
1. [Criar conta MongoDB Atlas](#1-criar-conta-mongodb-atlas)
2. [Configurar cluster e banco](#2-configurar-cluster-e-banco)
3. [Instalar dependências do backend](#3-instalar-dependências-do-backend)
4. [Configurar variáveis de ambiente](#4-configurar-variáveis-de-ambiente)
5. [Iniciar o servidor](#5-iniciar-o-servidor)
6. [Acessar o painel admin](#6-acessar-o-painel-admin)
7. [Funcionalidades do Admin](#7-funcionalidades-do-admin)

---

## 1. Criar conta MongoDB Atlas

1. Acesse: **https://www.mongodb.com/atlas**
2. Clique em **"Try Free"** ou **"Start Free"**
3. Cadastre-se com email ou Google/GitHub
4. Complete o questionário (pode marcar qualquer opção)

---

## 2. Configurar cluster e banco

### Criar Cluster:
1. No dashboard do Atlas, clique **"Build a Database"**
2. Escolha **M0 (Free Tier)**
3. Selecione a região **"São Paulo (sa-east-1)"** (mais próxima)
4. Nomeie o cluster: `doceria-cluster`
5. Clique **"Create Deployment"**

### Configurar Acesso:
1. Em **Database Access**, clique **"Add New Database User"**
2. Método: **Password**
3. Username: `doceria-admin`
4. Password: gere uma senha forte e **guarde-a** (você vai precisar)
5. Role: **"Read and write to any database"**
6. Clique **"Add User"**

### Configurar Network Access:
1. Em **Network Access**, clique **"Add IP Address"**
2. Clique **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ Em produção, restrinja apenas ao IP do seu servidor
3. Confirme

### Obter String de Conexão:
1. Volte ao **Database** → clique **"Connect"** no seu cluster
2. Escolha **"Drivers"** (MongoDB Drivers)
3. Selecione **Node.js** e versão **4.1 or later**
4. Copie a string que aparece, deve ser assim:
   ```
   mongodb+srv://doceria-admin:<password>@doceria-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **Substitua** `<password>` pela senha que você criou

---

## 3. Instalar dependências do backend

Abra o terminal na pasta `server`:

```bash
cd doceria-aracaju/server
npm install
```

Se der erro de permissão no PowerShell:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 4. Configurar variáveis de ambiente

1. Na pasta `server`, renomeie o arquivo `.env.example` para `.env`:
   ```bash
   ren .env.example .env
   ```

2. Abra o arquivo `.env` e cole sua string de conexão:
   ```env
   MONGODB_URI=mongodb+srv://doceria-admin:SUA_SENHA_AQUI@doceria-cluster.xxxxx.mongodb.net/doceria-aracaju?retryWrites=true&w=majority
   PORT=5000
   JWT_SECRET=chave_secreta_qualquer_123
   ```

3. **Salve o arquivo**

---

## 5. Iniciar o servidor

```bash
npm start
```

Você deve ver:
```
✅ MongoDB conectado
🚀 Servidor rodando na porta 5000
📊 Painel Admin: http://localhost:5000/admin
```

Para desenvolvimento (com auto-reload):
```bash
npm run dev
```

---

## 6. Acessar o painel admin

1. Abra o navegador: **http://localhost:5000/admin**

2. Faça login com:
   - **Usuário:** `admin`
   - **Senha:** `aju2026`

---

## 7. Funcionalidades do Admin

### 📊 Dashboard
- Total de pedidos
- Receita acumulada
- Pedidos pendentes/entregues
- Últimos pedidos em tempo real

### 📦 Pedidos
- Listar todos os pedidos
- Filtrar por status (Pendente, Preparando, Pronto, Entregue)
- Mudar status do pedido (dropdown)
- Ver detalhes: cliente, telefone, itens, total

### 🧁 Cardápio (CRUD Completo)
- **Adicionar** novo doce (botão "+ Adicionar Doce")
- **Editar** doce existente (botão "Editar")
- **Remover** doce (botão "Remover")
- Campos: Nome, Descrição, Preço, Categoria, Imagem, Badge

---

## 🔄 Integrar Frontend com Backend

Para o cardápio usar dados do MongoDB (em vez do localStorage), edite `admin.js`:

1. Descomente as funções de API no final do arquivo
2. Substitua `loadCardapio()` por `fetchDoces()`
3. Substitua `saveDoce()` por `saveDoceAPI()`

---

## 📁 Estrutura do Projeto

```
doceria-aracaju/
├── server/                    # Backend Node.js
│   ├── models/               # Schemas MongoDB
│   │   ├── Doce.js
│   │   └── Pedido.js
│   ├── routes/               # Rotas API
│   │   ├── doces.js         # CRUD doces
│   │   └── pedidos.js       # CRUD pedidos
│   ├── admin/                # Painel Admin
│   │   ├── index.html       # Interface
│   │   └── admin.js         # Lógica
│   ├── server.js            # Servidor Express
│   ├── package.json
│   └── .env                 # Configurações (não commitar)
│
└── src/                      # Frontend React (existente)
    └── ...
```

---

## 🔧 API Endpoints Disponíveis

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/doces` | Listar doces ativos |
| GET | `/api/doces/admin` | Listar todos (admin) |
| GET | `/api/doces/:id` | Buscar um doce |
| POST | `/api/doces` | Criar doce |
| PUT | `/api/doces/:id` | Atualizar doce |
| DELETE | `/api/doces/:id` | Remover (soft delete) |
| GET | `/api/pedidos` | Listar pedidos |
| POST | `/api/pedidos` | Criar pedido |
| PUT | `/api/pedidos/:id/status` | Atualizar status |
| GET | `/api/pedidos/stats/dashboard` | Estatísticas |

---

## ❌ Solução de Problemas

### Erro: "Cannot connect to MongoDB"
- Verifique se a senha na URL está correta (sem caracteres especiais não codificados)
- Confirme se o IP (0.0.0.0/0) está liberado no Network Access
- Verifique sua conexão com internet

### Erro: "Port 5000 already in use"
```bash
# Mude a porta no .env:
PORT=5001
```

### Erro de CORS
O CORS já está configurado no servidor. Se persistir, verifique se está acessando via `localhost`, não `file://`.

---

## 📝 Próximos Passos

1. ✅ Criar conta MongoDB Atlas
2. ✅ Copiar string de conexão
3. ✅ Instalar dependências (`npm install`)
4. ✅ Configurar `.env`
5. ✅ Iniciar servidor (`npm start`)
6. ✅ Acessar `http://localhost:5000/admin`

**Pronto! Seu painel admin com MongoDB está configurado! 🎉**
