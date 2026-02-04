# Key Dash - AI API Dashboard

Een strak, modern dashboard om je AI API keys en verbruik te beheren voor Anthropic, OpenAI, DeepSeek, Minimax, Google AI, Azure en meer.

## Features

- **Multi-provider ondersteuning** - Anthropic, OpenAI, DeepSeek, Minimax, Google AI, Azure OpenAI
- **Kosten tracking** - Automatische kostenberekening per provider en key
- **Usage monitoring** - Track requests, input/output tokens per API key
- **Archive functionaliteit** - Archiveer keys om tracking te pauzeren maar stats te behouden
- **API Proxy** - Gebruik Key Dash als proxy voor het tracken van API usage
- **Responsive design** - Werkt op desktop en mobile
- **Donker thema** - Subtiele cyberpunk-kleuren voor een moderne uitstraling

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL (via Prisma ORM)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React

## Quick Start

### Installatie

```bash
# Installeer dependencies
npm install

# Genereer Prisma client en push database schema
npm run db:generate
npm run db:push

# Seed de standaard providers
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in je browser.

### Environment Variables

```env
DATABASE_URL="postgresql://..."
ADMIN_EMAIL="jouw@email.com"
ADMIN_PASSWORD="jouw-wachtwoord"
SESSION_SECRET="een-lange-willekeurige-string"
```

## Deployment op Railway

1. Push naar GitHub
2. Maak een nieuw project aan op Railway
3. Voeg PostgreSQL toe als database service
4. Stel environment variables in
5. Railway deployed automatisch

Na deployment is je dashboard beschikbaar op je Railway URL.

## Gebruik

### Nieuwe API Key toevoegen

1. Ga naar "Sleutels" tab
2. Klik op "Sleutel Toevoegen"
3. Selecteer provider, geef naam/label op en plak de API key

### Usage tracken via proxy

```bash
curl -X POST "https://key-dash.domain.com/api/proxy/openai/chat/completions" \
  -H "Authorization: Bearer jouw-api-key" \
  -H "Content-Type: application/json" \
  -H "X-Key-Dash-Key: jouw-key-dash-key-id" \
  -d '{"model": "gpt-4", "messages": [...]}'
```

### Keys archiveren

1. Ga naar "Overzicht" of "Sleutels"
2. Klik op het archive icoon naast de key
3. Key wordt gearchiveerd en niet meer gebruikt in proxy
4. Stats blijven behouden - je kunt de key later herstellen

## API Endpoints

### Keys
| Methode | Endpoint | Beschrijving |
|---------|----------|--------------|
| GET | `/api/keys` | Alle keys ophalen |
| POST | `/api/keys` | Nieuwe key toevoegen |
| DELETE | `/api/keys/[id]` | Key verwijderen |
| POST | `/api/keys/[id]/archive` | Key archiveren |
| POST | `/api/keys/[id]/restore` | Key herstellen |

### Providers
| Methode | Endpoint | Beschrijving |
|---------|----------|--------------|
| GET | `/api/providers` | Alle providers ophalen |
| POST | `/api/providers` | Provider toevoegen |

### Proxy
| Methode | Endpoint | Beschrijving |
|---------|----------|--------------|
| * | `/api/proxy/[provider]/[...path]` | Proxy request met tracking |

## Project Structuur

```
ai-api-dashboard/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data voor providers
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   ├── keys/      # Key management endpoints
│   │   │   ├── providers/ # Provider endpoints
│   │   │   └── proxy/     # API proxy
│   │   ├── globals.css   # Tailwind styles
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Dashboard
│   │   └── login/        # Login page
│   └── lib/
│       ├── prisma.ts     # Prisma client
│       └── encryption.ts  # Encryptie utilities
├── package.json
└── README.md
```

## Providers

Het dashboard komt met vooringestelde providers:

| Provider | Display Name | Endpoint |
|----------|--------------|----------|
| anthropic | Anthropic | api.anthropic.com |
| openai | OpenAI | api.openai.com/v1 |
| deepseek | DeepSeek | api.deepseek.com |
| minimax | Minimax | api.minimax.chat/v1 |
| google | Google AI | generativelanguage.googleapis.com |
| azure | Azure OpenAI | openai.azure.com |

Je kunt zelf extra providers toevoegen via het "Aanbieders" tabblad.

## License

MIT
