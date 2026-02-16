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

## 📦 Installation

1. **Clone the repo:**
   ```bash
   git clone https://github.com/piee-admin/piee-docker.git
   cd piee-docker
   ```

2. **Install all dependencies:**
   We provide a structured `Makefile` for easy setup.
   ```bash
   make install
   ```
   This will install frontend dependencies via `bun` and backend dependencies within a dedicated virtual environment (`backend/venv`).
   
3. **Run the development server:**
   ```csharp
   bun run dev
   ```
   
4. **Open http://localhost:3000 in your browser.**

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