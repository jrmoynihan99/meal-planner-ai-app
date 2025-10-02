# Dialed

**Dialed** is an AI-powered meal planning web app that transforms food preferences and calorie/protein targets into **portion-accurate daily plans and complete weekly schedules**.  
Built with **Next.js + TypeScript**, it combines GPT meal generation with a custom solver for precise nutrition.

---

## ✨ Features

- Guided ingredient questionnaire → AI-generated meals with recipes + images
- Approve/edit meals to build a personal library
- Automatic portioning with a linear programming solver (GLPK.js)
- Unique daily meal plans with **portion locking** for consistency
- Weekly planner with drag-and-drop scheduling + meal time snapping
- Instant meal swaps and auto-regenerated grocery lists
- Clean, modern UI with animations and responsive design

---

## 🛠️ Tech Stack

- **Frontend**: React, Next.js, TypeScript, Tailwind CSS, shadcn/ui, Zustand, @dnd-kit, Framer Motion
- **Backend & Optimization**: Next.js API Routes, OpenAI API, GLPK.js (Linear Programming)
- **Tools & Services**: Vercel, GitHub, ESLint, Vitest/Jest (planned), Storybook (planned)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, pnpm, or yarn

### Installation

```bash
git clone https://github.com/jrmoynihan99/meal-planner-ai-app
cd meal-planner-ai-app
npm install
```

### Run Locally (Dev Mode)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

---

## 📖 Case Study

Want to see how it was designed and engineered?  
Check out the [Dialed Case Study](https://jasonmoynihan.com/projects/dialed).

---

## 🧑‍💻 About

Dialed was built by **Jason Moynihan** as an exploration into how AI + optimization can remove friction from healthy eating while keeping plans realistic.
