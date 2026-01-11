# FitMyCV - AI Resume Adaptation Platform

Plataforma web para adaptar currículums automáticamente a ofertas de trabajo usando IA.

## Stack Tecnológico

### Frontend

- React 18 + TypeScript
- Vite
- React Router v6
- Zustand (State Management)
- Tailwind CSS
- Axios

### Backend

- FastAPI (Python 3.11+)
- SQLAlchemy + Alembic
- PostgreSQL
- Playwright (Web Scraping)
- python-docx + docxtpl
- JWT Authentication
- OAuth 2.0 (Google, GitHub)

## Estructura del Proyecto

```
fitmycv/
├── frontend/          # React App
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── services/
│   │   └── types/
│   └── package.json
├── backend/           # FastAPI App
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── core/
│   └── requirements.txt
├── docker-compose.yml
└── README.md
```

## Desarrollo Local

### Con Docker (Recomendado)

```bash
# Iniciar todos los servicios
docker-compose up

# Frontend: http://localhost:5173
# Backend: http://localhost:8000
# PostgreSQL: localhost:5432
```

### Sin Docker

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Variables de Entorno

Crear `.env` en la raíz del proyecto:

```env
# Database
DATABASE_URL=postgresql://fitmycv:fitmycv123@localhost:5432/fitmycv

# JWT
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# OAuth Google
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback

# OAuth GitHub
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_REDIRECT_URI=http://localhost:8000/api/github/callback

# AI Provider (TBD)
AI_API_KEY=your-ai-api-key
```

## Características

- ✅ Autenticación con JWT + OAuth (Google, GitHub)
- ✅ Conexión con repositorios de GitHub
- ✅ Análisis automático de tecnologías en repositorios
- ✅ Upload de CV en formato .docx
- ✅ Scraping de ofertas de trabajo con Playwright
- ✅ Adaptación inteligente usando IA
- ✅ Editor manual del CV adaptado
- ✅ Descarga en PDF y DOCX
- ✅ Dark Mode
- ✅ Historial de adaptaciones
- ✅ Dashboard con estadísticas

## Configuración de OAuth

### Google OAuth

Ver documentación en `OAUTH_SETUP.md`

### GitHub OAuth

Ver guía detallada en [GITHUB_SETUP.md](GITHUB_SETUP.md)

**Resumen rápido:**

1. Crea una OAuth App en https://github.com/settings/developers
2. Configura las credenciales en `backend/.env`
3. Reinicia el backend: `docker-compose restart backend`

## API Endpoints

### Autenticación

- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login con email/password
- `GET /api/auth/google` - Iniciar OAuth con Google
- `GET /api/auth/google/callback` - Callback de Google

### GitHub Integration

- `GET /api/github/connect` - Iniciar OAuth con GitHub
- `GET /api/github/callback` - Callback de GitHub
- `POST /api/github/sync-repos` - Sincronizar repositorios
- `GET /api/github/repos` - Listar repositorios
- `PUT /api/github/repos/{id}/toggle` - Seleccionar/deseleccionar repo
- `DELETE /api/github/disconnect` - Desconectar GitHub

### Usuarios

- `GET /api/users/me` - Obtener usuario actual

### CVs y Adaptaciones

- `POST /api/upload/resume` - Subir CV
- `POST /api/scrape/job` - Extraer datos de oferta
- `POST /api/optimize/adapt` - Adaptar CV a oferta
- `GET /api/adaptations` - Listar adaptaciones

## Licencia

MIT
