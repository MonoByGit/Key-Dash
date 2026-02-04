# AI API Dashboard

Een strak, modern dashboard om je AI API keys en verbruik te beheren voor Anthropic, DeepSeek, Minimax, OpenAI en meer.

## Features

- **Provider Management** - Voeg providers toe, bewerk of verwijder ze
- **Key Management** - Beheer meerdere API keys per provider
- **Usage Tracking** - Monitor kosten, tokens en requests
- **Encrypted Storage** - API keys worden veilig versleuteld opgeslagen
- **Modern UI** - Strak, dark-themed design

## Tech Stack

- **Framework**: Next.js 14
- **Database**: PostgreSQL (via Prisma ORM)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (lokaal of Railway)

### Installation

1. Clone de repository
2. Installeer dependencies:

```bash
npm install
```

3. Kopieer `.env.example` naar `.env` en vul je database URL in:

```bash
cp .env.example .env
```

4. Genereer Prisma client en push de database schema:

```bash
npm run db:generate
npm run db:push
```

5. Seed de standaard providers:

```bash
npm run db:seed
```

6. Start de development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in je browser.

## Deployment op Railway

### Stap 1: Railway Project Aanmaken

1. Ga naar [Railway](https://railway.app) en log in
2. Klik op "New Project"
3. Kies "Deploy from GitHub repo" of upload je code

### Stap 2: PostgreSQL Database Toevoegen

1. In je Railway project, klik op "New Service"
2. Kies "Database" → "PostgreSQL"
3. Wacht tot de database is geïnstalleerd

### Stap 3: Environment Variables

1. Klik op "Variables" in je Railway project
2. Voeg de volgende variabelen toe:

```
DATABASE_URL="postgresql://postgres:password@hostname:5432/railway?schema=public"
ENCRYPTION_KEY="een-lange-willekeurige-string-hier"
```

De `DATABASE_URL` wordt automatisch ingevuld door Railway bij de PostgreSQL service.

### Stap 4: Deploy

1. Railway zal automatisch builden en deployen
2. Na deployment is je dashboard beschikbaar op de Railway URL

### Handleiding Railway + PostgreSQL

Zie de [Railway docs](https://docs.railway.deploy/) voor meer informatie over deployment.

## Providers Toevoegen

Het dashboard komt met vooringestelde providers:
- Anthropic
- OpenAI
- DeepSeek
- Minimax

Je kunt zelf extra providers toevoegen via het "Providers" tabblad met:
- Naam en icoon
- API endpoint URL
- Authenticatie type (Bearer, API Key, etc.)
- Pricing per 1M tokens

## API Keys Toevoegen

1. Klik op "Nieuwe Key"
2. Geef de key een naam en optioneel label
3. Selecteer de provider
4. Plak je API key
5. Klik op "Toevoegen"

Je keys worden versleuteld opgeslagen en zijn veilig.

## Project Structuur

```
ai-api-dashboard/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data voor providers
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── globals.css    # Tailwind styles
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Dashboard page
│   └── lib/
│       ├── encryption.ts  # Encryptie utilities
│       └── prisma.ts      # Prisma client
├── package.json
└── README.md
```

## License

MIT
