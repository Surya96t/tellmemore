# TellMeMore

**AI Chat Interface for Multiple LLM Providers**

Chat with OpenAI GPT-4, Google Gemini, and Groq LLaMA models side-by-side. Compare AI responses in real-time with a modern, secure, and user-friendly interface.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.118-009688)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-yellow)](https://www.python.org/)

---

## 🚀 Features

### Dual Chat Interface
- **Side-by-side model comparison** - Compare responses from different LLMs simultaneously
- **Streaming responses** - Real-time streaming with smooth animations
- **Markdown rendering** - Full markdown support with code syntax highlighting
- **Chat history** - Persistent chat sessions with search and organization

### Supported Models

#### OpenAI
- GPT-4 Optimized (`gpt-4o`) - **Default**
- GPT-4 Mini (`gpt-4o-mini`)
- GPT-4 Turbo (`gpt-4-turbo`)
- GPT-3.5 Turbo (`gpt-3.5-turbo`)

#### Google Gemini
- Gemini 2.0 Flash (`gemini-2.0-flash-exp`) - **Default**
- Gemini 1.5 Pro (`gemini-1.5-pro`)
- Gemini 1.5 Flash (`gemini-1.5-flash`)

#### Groq (LLaMA3)
- LLaMA 3.3 70B (`llama-3.3-70b-versatile`) - **Default**
- LLaMA 3.1 70B (`llama-3.1-70b-versatile`)
- LLaMA 3.1 8B (`llama-3.1-8b-instant`)

### Session Management
- Create, rename, delete sessions
- Global search (Cmd/Ctrl+K)
- Keyboard shortcuts
- Auto-generated session titles

### Prompts Library
- System prompts for common tasks
- Custom prompt creation
- Search and filtering
- One-click prompt usage

### Quota Management
- 100,000 token daily limit
- Real-time usage tracking
- Warning system (90%, 95%, 100%)
- Visual progress bar

### Modern UI/UX
- Dark/Light theme support
- Responsive design (mobile-friendly)
- Command palette (Cmd/Ctrl+K)
- Keyboard navigation
- Optimistic UI (instant feedback)

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ and npm/pnpm/yarn
- **Python** 3.11+
- **PostgreSQL** 14+
- **Git**

### API Keys Required

You'll need API keys from:
- [Clerk](https://clerk.com/) - Authentication
- [OpenAI](https://platform.openai.com/) - GPT models
- [Google AI Studio](https://makersuite.google.com/) - Gemini models
- [Groq](https://console.groq.com/) - LLaMA models

---

## 🛠️ Installation & Setup

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/tellmemore.git
cd tellmemore
```

### 2. Set Up Environment Variables

**Backend-da:**
```bash
cd Backend-da
cp .env.example .env
# Edit .env with your database URL, Clerk keys, and JWT secret
```

**Backend-llm:**
```bash
cd Backend-llm
cp .env.example .env
# Edit .env with your OpenAI, Google, and Groq API keys
```

**Frontend-next:**
```bash
cd frontend-next
cp .env.local.example .env.local
# Edit .env.local with your Clerk keys and backend URLs
```

### 3. Install Dependencies

**Backend-da:**
```bash
cd Backend-da
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements-pinned.txt
```

**Backend-llm:**
```bash
cd Backend-llm
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements-pinned.txt
```

**Frontend-next:**
```bash
cd frontend-next
npm install
```

---

## 🚀 Running the Project

Start all three services in separate terminals:

**Terminal 1 - Backend-da:**
```bash
cd Backend-da
source venv/bin/activate
uvicorn app:app --reload --port 8000
```

**Terminal 2 - Backend-llm:**
```bash
cd Backend-llm
source venv/bin/activate
uvicorn api.main:app --reload --port 8001
```

**Terminal 3 - Frontend-next:**
```bash
cd frontend-next
npm run dev
```

Open `http://localhost:3000` in your browser and start chatting!

---

## 📁 Project Structure

```
tellmemore/
├── Backend-da/              # User/Session management (FastAPI + PostgreSQL)
│   ├── backendApp/          # API routes, models, schemas
│   ├── requirements-pinned.txt  # Python dependencies with versions
│   └── app.py               # Main FastAPI application
├── Backend-llm/             # LLM provider interface (FastAPI)
│   ├── api/                 # LLM endpoints and services
│   ├── services/            # Provider-specific logic (OpenAI, Gemini, Groq)
│   ├── requirements-pinned.txt  # Python dependencies with versions
│   └── main.py              # Main FastAPI application
├── frontend-next/           # Next.js 16 frontend
│   ├── app/                 # Next.js app router pages
│   ├── components/          # React components
│   ├── lib/                 # Utilities, API client, hooks
│   ├── docs/                # Frontend-specific documentation
│   └── package.json         # Node.js dependencies
├── docs/                    # Project-wide documentation
│   ├── README.md            # Documentation index
│   ├── frontend-next-migration-plan.md
│   ├── MIGRATION-SUMMARY.md
│   └── CLERK_INTEGRATION_STATUS.md
└── README.md                # This file
```

---

## 🔧 Development

For development guidelines, testing, and contribution information, see:
- **Documentation:** [`docs/README.md`](docs/README.md)
- **Frontend Docs:** [`frontend-next/docs/`](frontend-next/docs/)
- **Backend API (Data):** [`Backend-da/backend_api_endpoints.md`](Backend-da/backend_api_endpoints.md)
- **Backend API (LLM):** [`Backend-llm/backend_llm_api_endpoints.md`](Backend-llm/backend_llm_api_endpoints.md)

---

## 🔐 Required Environment Variables

### Backend-da (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/tellmemore
CLERK_SECRET_KEY=sk_test_...
CLERK_ISSUER_URL=https://your-domain.clerk.accounts.dev
SECRET_KEY=your_jwt_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Backend-llm (.env)
```env
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=AI...
GROQ_API_KEY=gsk_...
```

### Frontend-next (.env.local)
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_BACKEND_DA_URL=http://localhost:8000
NEXT_BACKEND_LLM_URL=http://localhost:8001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📚 Documentation

- **Project Documentation:** [`docs/README.md`](docs/README.md)
- **Migration Guide:** [`docs/frontend-next-migration-plan.md`](docs/frontend-next-migration-plan.md)
- **Quick Reference:** [`docs/MIGRATION-SUMMARY.md`](docs/MIGRATION-SUMMARY.md)
- **Chat UI Fixes:** [`frontend-next/docs/CHAT_UI_FIXES_README.md`](frontend-next/docs/CHAT_UI_FIXES_README.md)
- **Backend API (Data):** [`Backend-da/backend_api_endpoints.md`](Backend-da/backend_api_endpoints.md)
- **Backend API (LLM):** [`Backend-llm/backend_llm_api_endpoints.md`](Backend-llm/backend_llm_api_endpoints.md)
- **Clerk Integration:** [`docs/CLERK_INTEGRATION_STATUS.md`](docs/CLERK_INTEGRATION_STATUS.md)

---

## 🚢 Deployment

### Production Checklist

- [ ] Set up production PostgreSQL database
- [ ] Configure production environment variables
- [ ] Set up Clerk production instance
- [ ] Deploy Backend-da to cloud (AWS, GCP, Azure)
- [ ] Deploy Backend-llm to cloud
- [ ] Deploy Frontend-next to Vercel/Netlify
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Configure domain and SSL
- [ ] Set up monitoring (Sentry, Vercel Analytics)
- [ ] Enable rate limiting
- [ ] Set up backup/disaster recovery

### Recommended Deployment Stack

- **Frontend:** Vercel (Next.js optimized)
- **Backend:** AWS EC2, Google Cloud Run, or Railway
- **Database:** AWS RDS PostgreSQL or Supabase
- **Monitoring:** Sentry + Vercel Analytics
- **CI/CD:** GitHub Actions

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- **Python:** PEP8, type hints, docstrings
- **TypeScript:** ESLint + Prettier, strict mode
- **Commits:** Conventional Commits format
- **Tests:** Write tests for all new features

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [FastAPI](https://fastapi.tiangolo.com/) - Python web framework
- [Clerk](https://clerk.com/) - Authentication
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [React Query](https://tanstack.com/query) - Server state management
- [OpenAI](https://openai.com/) - GPT models
- [Google AI](https://ai.google/) - Gemini models
- [Groq](https://groq.com/) - LLaMA models

---

## 📧 Support

- **Documentation:** [docs/README.md](docs/README.md)
- **Issues:** [GitHub Issues](https://github.com/yourusername/tellmemore/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/tellmemore/discussions)

---

**Built with ❤️ by the TellMeMore Team**
