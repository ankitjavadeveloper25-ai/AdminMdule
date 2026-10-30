# Winter ARC Pro — Administration Panel (React + TypeScript + Vite)

The **Winter ARC Pro Admin Panel** is a production-grade, independently buildable and deployable administration dashboard for managing user accounts, subscriptions, complimentary Pro access, and durable audit logs.

It communicates with the **Winter ARC Pro Spring Boot Backend** via secure REST APIs.

---

## Architecture & Technology Stack

- **Framework**: React 18 with TypeScript (strict mode)
- **Tooling**: Vite 5
- **Routing**: React Router 6 (protected route guards)
- **Styling**: Tailwind CSS with custom dark SaaS palette
- **Icons**: Lucide React
- **Authentication**: Stateless JWT Bearer tokens with server-side `ROLE_ADMIN` authority validation

---

## Directory Structure

```text
admin-panel/
├── public/                 # Static assets & favicon
├── src/
│   ├── api/                # API client with token injection & error handling
│   ├── components/         # Shared UI & Layout components
│   │   ├── auth/           # Route protection guards
│   │   ├── layout/         # Header, Sidebar, Layout container
│   │   └── ui/             # Badges, Modals, Skeletons
│   ├── context/            # AuthContext (session state, login, logout)
│   ├── features/           # Feature pages
│   │   ├── auth/           # Admin login page
│   │   ├── dashboard/      # Real-time metrics & telemetries
│   │   ├── users/          # Users directory & UserDetails manager
│   │   ├── subscriptions/  # Complimentary Pro grants manager
│   │   ├── payments/       # Webhook payment logs
│   │   ├── audit-logs/     # Durable administrative audit trail
│   │   └── settings/       # System & Ed25519 key info
│   ├── styles/             # Tailwind directives & global styling
│   ├── types/              # Comprehensive TypeScript interfaces
│   ├── App.tsx             # Route declarations
│   └── main.tsx            # Application entry point
├── .env.example            # Environment variables template
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Getting Started

### 1. Prerequisites
- Node.js `v20+` or `v24+`
- Running instance of `winter-arc-server` (default: `http://localhost:8080`)

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure `VITE_API_BASE_URL` points to your backend instance:
```env
VITE_API_BASE_URL=http://localhost:8080
```

### 3. Installation
```bash
npm install
```

### 4. Local Development
```bash
npm run dev
```
Access the application at `http://localhost:5173`.

### 5. Logging In
Use the bootstrapped administrator account:
- **Email**: `admin@winterarc.pro`
- **Password**: `Admin@WinterArc2026!`

---

## Production Build & Deployment

### 1. Build Static Bundle
```bash
npm run build
```
This runs TypeScript type checking (`tsc`) and compiles optimized static assets into `dist/`.

### 2. Preview Production Build
```bash
npm run preview
```

### 3. Nginx Single-Page Application (SPA) Deployment
When deploying to Nginx or a static host, ensure all routes fallback to `index.html`:
```nginx
server {
    listen 80;
    server_name admin.winterarc.pro;
    root /var/www/admin-panel/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## Security Best Practices

1. **Token Storage**: The JWT is stored in `localStorage` and sent via `Authorization: Bearer <token>`.
2. **Server-Side Enforcement**: All `/api/admin/**` endpoints strictly require `ROLE_ADMIN` on the backend. Frontend route guards are for UX only.
3. **No Secrets Exposed**: Never store JWT secrets, database passwords, or Ed25519 private keys in frontend `.env` files.
