#  School Management REST API (Backend)

Backend REST API for the School Management System, developed with **NestJS 12**, **TypeORM 0.3**, and **PostgreSQL 16**.

>  **Looking for the full system overview?** See the [Root README](../README.md) or the comprehensive [Architecture Guide](../PROJECT_GUIDE.md).

---

## ⚡ Quick Start

### 1. Start PostgreSQL
Ensure the PostgreSQL container is running from the root workspace:
```bash
docker compose up -d
```

### 2. Configure Environment
```bash
cp env.example .env
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Migrations & Seed Initial Data
```bash
npm run migration:run
npm run seed
```

### 5. Start Development Server
```bash
npm run start:dev
```

The API will be available at:
- Base API: `http://localhost:3000`
- Swagger Documentation: `http://localhost:3000/docs`
- Health Probe: `http://localhost:3000/health`

---

## 🛠 Available Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `npm run start:dev` | `nest start --watch` | Start server with hot-reloading |
| `npm run build` | `nest build` | Compile TypeScript to `dist/` |
| `npm run start:prod` | `node dist/main` | Run production build |
| `npm run migration:run` | `typeorm migration:run` | Apply pending database schema migrations |
| `npm run migration:revert` | `typeorm migration:revert` | Revert the latest migration batch |
| `npm run seed` | `tsx src/database/seeds/seed.ts` | Seed default admin, operator, teacher & student users |
| `npm run lint` | `oxlint --type-aware src/ test/` | Run high-speed Rust-based linter |
| `npm run test` | `vitest run` | Run unit tests |
| `npm run test:e2e` | `vitest run --config ./vitest.config.e2e.ts` | Run end-to-end integration tests |

---

##  Demo Personas

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@school.local` | `Admin123!` |
| **Operator** | `operator@school.local` | `Operator123!` |
| **Teacher** | `teacher@school.local` | `Teacher123!` |
| **Student** | `student@school.local` | `Student123!` |

---

##  CSV Import Processing

- **Upload Endpoint**: `POST /imports/upload` (accepts multipart file uploads of `teachers.csv`, `classes.csv`, `students.csv`).
- **Batch Run Endpoint**: `POST /imports/run` (processes files in `data/source/`).
- **Reports Directory**: `data/reports/` (persists structured JSON execution summaries).

For detailed documentation, refer to the [Root README](../README.md).
