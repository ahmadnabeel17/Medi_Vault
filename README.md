# MediVault

Secure, intelligent, and seamless health data management at your fingertips.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.local.example` to `.env.local` and add your keys:
```bash
cp .env.local.example .env.local
```

You will need to fill in:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OLLAMA_API_KEY`
- `OLLAMA_BASE_URL`

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
