# Doce Aracaju

Landing page de e-commerce para doceria típica de Aracaju, Sergipe. Desenvolvida com React, TypeScript, Tailwind CSS e Framer Motion.

## Funcionalidades

- **Catálogo de Produtos**: 10 doces típicos de Aracaju com fotos, descrições e preços
- **Carrinho de Compras**: Sidebar interativa com gerenciamento de itens
- **Cálculo de Taxas**: Valor para Pix/Dinheiro e valor com taxa de 5% para cartão
- **Integração WhatsApp**: Envio de pedidos formatados diretamente para o WhatsApp
- **Painel Administrativo**: Login com usuário `admin` / senha `aju2026` com dashboard de pedidos
- **Design Responsivo**: Layout adaptável para mobile e desktop
- **Animações**: Transições suaves com Framer Motion

## Stack Tecnológico

- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React (ícones)
- Vite (build tool)

## Paleta de Cores

- **Rosa Principal**: #FF1493
- **Rosa Claro**: #FF69B4
- **Dourado**: #D4AF37
- **Fundo**: #FFF0F5
- **Texto**: #2D1B2E

## Como Executar

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build
```

## Estrutura de Pastas

```
src/
├── components/     # Componentes React
│   ├── Navigation.tsx
│   ├── Hero.tsx
│   ├── Cardapio.tsx
│   ├── Sobre.tsx
│   ├── CartSidebar.tsx
│   └── AdminPanel.tsx
├── hooks/          # Custom hooks
│   └── useCart.ts
├── data/           # Dados estáticos
│   └── doces.ts
├── types/          # Tipos TypeScript
│   └── index.ts
├── styles/         # CSS global
│   └── globals.css
└── App.tsx         # Componente principal
```

## Credenciais Admin

- **Usuário**: admin
- **Senha**: aju2026

## Número WhatsApp

- (79) 99146-6257

## Licença

MIT
