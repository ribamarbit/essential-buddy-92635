# Concierge de Compras - Aplicativo de Lista de Compras Inteligente

## Sobre o Projeto

O **Concierge de Compras** é um aplicativo web de gerenciamento de compras inteligente que ajuda os usuários a:
- Cadastrar e acompanhar itens essenciais do dia a dia
- Gerenciar listas de compras de forma eficiente
- Escanear notas fiscais para importar produtos automaticamente
- Receber alertas quando itens estão acabando

## Informações do Projeto

**URL do Projeto**: https://lovable.dev/projects/c5693b3c-8e25-494e-8a8f-67e1d45d9d5f

## Como editar este código?

Existem várias formas de editar sua aplicação:

### Usando o Lovable

Simplesmente acesse o [Projeto Lovable](https://lovable.dev/projects/c5693b3c-8e25-494e-8a8f-67e1d45d9d5f) e comece a usar os prompts.

As alterações feitas via Lovable serão commitadas automaticamente neste repositório.

### Usando sua IDE preferida

Se você deseja trabalhar localmente usando sua própria IDE, pode clonar este repositório e fazer push das alterações. As alterações enviadas também serão refletidas no Lovable.

O único requisito é ter Node.js e npm instalados - [instalar com nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Siga estes passos:

```sh
# Passo 1: Clone o repositório usando a URL Git do projeto.
git clone <SUA_URL_GIT>

# Passo 2: Navegue até o diretório do projeto.
cd <NOME_DO_SEU_PROJETO>

# Passo 3: Instale as dependências necessárias.
npm i

# Passo 4: Inicie o servidor de desenvolvimento com recarregamento automático e preview instantâneo.
npm run dev
```

### Editar arquivo diretamente no GitHub

- Navegue até o(s) arquivo(s) desejado(s).
- Clique no botão "Edit" (ícone de lápis) no canto superior direito da visualização do arquivo.
- Faça suas alterações e commit as mudanças.

### Usar GitHub Codespaces

- Navegue até a página principal do seu repositório.
- Clique no botão "Code" (botão verde) próximo ao canto superior direito.
- Selecione a aba "Codespaces".
- Clique em "New codespace" para iniciar um novo ambiente Codespace.
- Edite os arquivos diretamente no Codespace e faça commit e push das suas alterações quando terminar.

## Quais tecnologias são usadas neste projeto?

Este projeto é construído com:

- **Vite** - Ferramenta de build rápida para desenvolvimento web moderno
- **TypeScript** - JavaScript tipado para maior segurança e produtividade
- **React** - Biblioteca para construção de interfaces de usuário
- **shadcn-ui** - Componentes de UI reutilizáveis e acessíveis
- **Tailwind CSS** - Framework CSS utilitário para estilização rápida
- **Supabase** - Backend como serviço para autenticação e banco de dados

## Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis da aplicação
│   ├── ui/             # Componentes de UI do shadcn
│   ├── header.tsx      # Cabeçalho da aplicação
│   ├── shopping-list.tsx   # Lista de compras
│   ├── item-card.tsx   # Card de item essencial
│   └── ...
├── pages/              # Páginas da aplicação
│   ├── Dashboard.tsx   # Página principal com itens essenciais
│   ├── Login.tsx       # Página de autenticação
│   ├── AddItems.tsx    # Cadastro de itens essenciais
│   └── ...
├── hooks/              # Hooks customizados
├── utils/              # Funções utilitárias
└── integrations/       # Integrações (Supabase)
```

## Funcionalidades Principais

### 1. Dashboard
- Visualização de itens essenciais com contagem regressiva de dias
- Estatísticas de consumo
- Alertas de itens acabando

### 2. Cadastrar Itens
- Adicionar itens essenciais predefinidos
- Criar itens personalizados
- Scanner de notas fiscais

### 3. Catálogo de Produtos
- Gerenciar produtos disponíveis
- Adicionar produtos à lista de compras

### 4. Lista de Compras
- Visualizar itens a comprar
- Compartilhar lista
- Finalizar compras

### 5. Acessibilidade
- Leitor de tela
- Alto contraste
- Ajuste de fonte
- Redução de animações

## Como implantar este projeto?

Simplesmente abra o [Lovable](https://lovable.dev/projects/c5693b3c-8e25-494e-8a8f-67e1d45d9d5f) e clique em Compartilhar -> Publicar.

## Posso conectar um domínio personalizado ao meu projeto Lovable?

Sim, você pode!

Para conectar um domínio, navegue até Projeto > Configurações > Domínios e clique em Conectar Domínio.

Leia mais aqui: [Configurando um domínio personalizado](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Credenciais de Demo

Para testar a aplicação, use:
- **Email**: demo@concierge.com
- **Senha**: Demo@123456

## Licença

Este projeto foi criado usando a plataforma Lovable.
