# PIEE – AI Control Plane for Teams & Enterprises 🚀

PIEE is a centralized AI Control Plane that enables organizations to centrally route, govern, monitor, and optimize their AI usage across multiple providers through a single platform.

PIEE unifies AI routing, prompt infrastructure, usage logging, and governance into trackable, production-grade logic—reducing cost, risk, and operational complexity.

---

## ✨ Features

- ⚡ **Modern UI** with Radix UI and Tailwind CSS
- 🌙 **Dark Mode Support** using `next-themes`
- 📦 **Feature-rich Sections** including:
  - Hero section with gradient highlights
  - Feature cards with tooltips & hover interactions
  - Accordion-based FAQs
  - Responsive CTA and footer
- 📊 **Interactive UI Components**: HoverCards, Tabs, Accordion, Tooltips, Cards, Badges
- 💡 **Centralized Library** to manage your files
- 🔐 **Access Control** and visibility settings
- 🏷️ **Tagging System** for organization
- 📈 **Analytics** to track system performance
- 🧪 **Playground** to execute task directly
- 🔄 Fully **Responsive** and **Mobile-Optimized**

---

## 🧩 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) with Turbopack
- **Styling**: Tailwind CSS & CSS variables
- **UI Library**: [Radix UI](https://www.radix-ui.com/) + [Lucide Icons](https://lucide.dev/)
- **State Management**: React Hooks
- **Theme Management**: [next-themes](https://github.com/pacocoursey/next-themes)
- **Animation & Motion**: [motion](https://motion.dev/) primitives
- **Data Platform**: [Supabase](https://supabase.com/) (Optional, for future integration)

---

## 📦 Installation & Setup

### Prerequisites
- **Node.js** (v18+ recommended)
- **Python** (v3.9+)
- **Bun** (for frontend package management)
- **Make** (optional, for easy commands)
- **Docker** (optional, for containerized run)

### Method 1: Quick Start (Makefile)

We provide a `Makefile` to automate the setup process.

1.  **Clone the repo:**
    ```bash
    git clone https://github.com/piee-admin/piee-docker.git
    cd piee-docker
    ```

2.  **Install Dependencies:**
    ```bash
    make install
    ```
    This command will:
    - Install frontend dependencies using `bun`.
    - Create a Python virtual environment in `backend/venv`.
    - Install backend dependencies from `requirements.txt`.

3.  **Run Development Servers:**
    You need to run the backend and frontend in separate terminals.

    **Terminal 1 (Backend):**
    ```bash
    make dev-backend
    ```
    *Starts the FastAPI server at http://localhost:8000*

    **Terminal 2 (Frontend):**
    ```bash
    make dev-frontend
    ```
    *Starts the Next.js dev server at http://localhost:3000*

4.  **Open the App:**
    Visit [http://localhost:3000](http://localhost:3000) to access the dashboard.

### Method 2: Docker (Recommended for Production)

Run the entire stack (Frontend + Backend + Database) using Docker Compose.

1.  **Start Services:**
    ```bash
    make docker-up
    ```
    *Or manually: `docker-compose up -d`*

2.  **Access Services:**
    - Frontend: http://localhost:3000
    - Backend API: http://localhost:8000
    - API Docs: http://localhost:8000/docs

3.  **Stop Services:**
    ```bash
    make docker-down
    ```

### Manual Setup (No Make)

If you prefer manual setup:

**Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
# In project root
bun install
bun dev
```

**📁 Project Structure**
```csharp
.
├── app/                # Next.js App directory
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/         # Reusable UI components
│   ├── ui/             # Shadcn-based UI elements
│   ├── motion-primitives/
│   └── waitlist.tsx
├── public/             # Static assets
├── tailwind.config.ts
├── postcss.config.js
└── README.md           # You are here!
```
**📜 Scripts**
| Script          | Description                    |
| --------------- | ------------------------------ |
| `bun run dev`   | Run the dev server (Turbopack) |
| `bun run build` | Build the app                  |
| `bun run start` | Start the production server    |
| `bun run lint`  | Run ESLint for code quality    |

**🛠️ Dependencies**
<details>
<summary>Click to view all dependencies</summary>

### Core
- `next@15.5.3`
- `react@19.1.1`
- `react-dom@19.1.1`
- `tailwindcss@4.1.13`
- `next-themes@0.4.6`

---

### UI / Styling
- `@radix-ui/*` (all primitives)
- `lucide-react`
- `clsx`
- `class-variance-authority`
- `tailwind-merge`
- `tw-animate-css`

---

### Utilities
- `react-hook-form`
- `zod`
- `cmdk`
- `sonner`
- `motion`
- `embla-carousel-react`
- `@supabase/supabase-js`
- `react-day-picker`
- `recharts`
- `input-otp`

---

### Dev Dependencies
- `eslint`, `eslint-config-next`, `@types/*`
- `postcss`, `autoprefixer`
- `typescript`

</details>

**📣 Want to Contribute?**

See our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to get started. Let’s build something great together.

## 📄 License

This project is licensed under the [MIT License](LICENSE).

**💜 Special Thanks**