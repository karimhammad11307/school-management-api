# 🖥️ School Management Client (Frontend)

Single-Page Application (SPA) dashboard for the School Management System, built with **React 18**, **TypeScript**, **Vite**, and **Tailwind CSS**.

> 📌 **Looking for the full system overview?** See the [Root README](../README.md) or the comprehensive [Architecture Guide](../PROJECT_GUIDE.md).

---

## ⚡ Quick Start

### 1. Configure Environment
```bash
cp .env.example .env
```
Default setting:
```ini
VITE_API_BASE_URL=http://localhost:3000
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Launch Development Server
```bash
npm run dev
```

The application will start at:
👉 **`http://localhost:5173`**

---

## 🛠 Available Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `npm run dev` | `vite` | Start local Vite development server |
| `npm run build` | `tsc && vite build` | Type-check and compile production bundle to `dist/` |
| `npm run preview` | `vite preview` | Locally preview the production build |

---

## 🧭 Application Views

- **/login**: Authentication screen featuring 1-click quick-fill buttons for all 4 demo personas (`Admin`, `Operator`, `Teacher`, `Student`).
- **/teachers**: Directory of faculty members with assigned class counts and search filtering.
- **/classes**: Classrooms table displaying teacher assignments, capacity limits, and visual seat occupancy progress bars.
- **/students**: Student roster with classroom filter and creation modal showing real-time remaining seat counts.
- **/imports**: Dedicated CSV import screen for administrators featuring single-click file upload and interactive status tables.
