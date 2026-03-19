# 🤖 Generative UI Chatbot

> **Describe what you need → AI generates a live, interactive React component**

A production-ready AI chatbot that streams interactive UI components on demand — powered by **Groq**, **LangGraph**, **LangChain**, and **Vercel AI SDK**.

---

## ✨ What It Does

| You type... | AI generates... |
|---|---|
| "Create a todo list for my startup launch" | Drag-drop todo list with AI prioritization |
| "Show the weather in Tokyo" | Live weather widget with 5-day forecast |
| "Build a kanban board for my app project" | Drag-drop kanban with priority cards |
| "Set a 25-minute Pomodoro timer" | Animated countdown timer |
| "Show me a bar chart of monthly sales" | Interactive chart with custom data |
| "Calculate compound interest at 7% for 10 years" | Calculator with expression history |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Browser (Next.js Client)                     │
│                                                                       │
│  ┌─────────────┐    SSE Stream    ┌──────────────────────────────┐  │
│  │  ChatInput  │ ──────────────►  │       ChatInterface           │  │
│  │  (textarea) │                  │  (message list + scroll)      │  │
│  └─────────────┘                  └──────────────┬───────────────┘  │
│                                                   │                   │
│                                   ┌──────────────▼───────────────┐  │
│                                   │      MessageBubble            │  │
│                                   │  (text | generated UI)        │  │
│                                   └──────────────┬───────────────┘  │
│                                                   │                   │
│                                   ┌──────────────▼───────────────┐  │
│                                   │   GeneratedUIRenderer         │  │
│                                   │  dynamic import + lazy load   │  │
│                                   └──────────────┬───────────────┘  │
│                                                   │                   │
│            ┌──────────┬──────────┬───────────────┼────────────────┐ │
│            │ TodoList │ Kanban   │ WeatherWidget  │ ChartWidget    │ │
│            │ (dnd-kit)│ (dnd-kit)│ (LangChain)   │ (canvas)       │ │
│            └──────────┴──────────┴───────────────┴────────────────┘ │
└──────────────────────────────────────────┬──────────────────────────┘
                                           │ POST /api/chat (SSE)
                                           │
┌──────────────────────────────────────────▼──────────────────────────┐
│                         Next.js API Route (Node.js)                  │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                     LangGraph State Machine                     │ │
│  │                                                                  │ │
│  │  ┌─────────────┐   ┌──────────────┐   ┌─────────────────────┐ │ │
│  │  │detectIntent │──►│ executeTools │──►│  generateUIData      │ │ │
│  │  │  (Node 1)   │   │  (Node 2)    │   │  (Node 3)            │ │ │
│  │  │             │   │              │   │                       │ │ │
│  │  │ llama-3.1-  │   │ LangChain    │   │ llama-3.3-70b        │ │ │
│  │  │ 8b-instant  │   │ DynTools     │   │ generates JSON        │ │ │
│  │  └─────────────┘   └──────────────┘   └──────────┬──────────┘ │ │
│  │                                                    │             │ │
│  │                                        ┌───────────▼──────────┐ │ │
│  │                                        │   postProcess         │ │ │
│  │                                        │   (Node 4, cond.)     │ │ │
│  │                                        │   AI reprioritization │ │ │
│  │                                        └──────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    LangChain Tools                             │   │
│  │  weatherTool │ calculatorTool │ prioritizationTool │ dateTool  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│                          ▼ Groq API (LPU)                            │
└──────────────────────────────────────────────────────────────────────┘
```

### Component Breakdown

| Layer | Technology | Why |
|---|---|---|
| **UI Framework** | Next.js 14 + React 18 | Server Components, streaming, App Router |
| **Streaming** | Vercel AI SDK + SSE | Real-time token/event streaming to browser |
| **AI Orchestration** | LangGraph | Stateful multi-node graph: intent → tools → UI data |
| **Tool System** | LangChain DynamicStructuredTool | Typed, Zod-validated tools for weather/calc/dates |
| **LLM Provider** | Groq (llama-3.3-70b + 8b-instant) | Ultra-fast inference via LPU hardware |
| **Drag & Drop** | @dnd-kit | Accessible, performant DnD for todos & kanban |
| **Type Safety** | TypeScript + Zod | End-to-end types, runtime validation of AI output |
| **Styling** | Tailwind CSS + CSS custom properties | Design token system, dark theme |
| **Containerization** | Docker multi-stage | Lean ~200MB production image |

### Data Flow

```
User types query
      │
      ▼
POST /api/chat (SSE stream opens)
      │
      ▼
LangGraph Node 1: detectIntent
  → Groq llama-3.1-8b-instant classifies UI type + required tools
      │
      ▼
LangGraph Node 2: executeTools (conditional)
  → LangChain tools run: weather API, calculator, date parser, prioritizer
      │
      ▼
LangGraph Node 3: generateUIData
  → Groq llama-3.3-70b generates structured JSON for the UI component
      │
      ▼
LangGraph Node 4: postProcess (todo-list only)
  → AI prioritization tool re-ranks tasks by urgency + impact matrix
      │
      ▼
SSE stream emits { type: "ui-component", componentType, componentData }
      │
      ▼
Browser: MessageBubble → GeneratedUIRenderer → dynamic import component
      │
      ▼
Interactive React component renders with full state management
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Groq API key (free at [console.groq.com](https://console.groq.com))

### Local Development

```bash
# 1. Clone and install
git clone <repo>
cd generative-ui-chatbot
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local and add your GROQ_API_KEY

# 3. Run dev server
npm run dev
# → http://localhost:3000
```

### Docker (Production)

```bash
# 1. Set your API key
echo "GROQ_API_KEY=your_key_here" > .env

# 2. Build and start
docker compose up --build -d

# 3. View logs
docker compose logs -f app

# 4. Health check
curl http://localhost:3000/api/health
```

### Docker (Development with hot-reload)

```bash
docker compose --profile dev up app-dev
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts         # SSE streaming endpoint
│   │   └── health/route.ts       # Health check
│   ├── globals.css               # Design tokens + animations
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── chat/
│   │   ├── ChatInterface.tsx     # Main layout + orchestration
│   │   ├── ChatInput.tsx         # Textarea + send/stop controls
│   │   ├── MessageBubble.tsx     # Message renderer (text + UI)
│   │   ├── GeneratedUIRenderer.tsx  # Dynamic lazy loader
│   │   └── WelcomeScreen.tsx     # Empty state + suggestions
│   └── generated/
│       ├── TodoList.tsx          # Drag-drop todos + AI reprioritize
│       ├── KanbanBoard.tsx       # Drag-drop kanban columns
│       ├── WeatherWidget.tsx     # Weather + 5-day forecast
│       ├── CalculatorWidget.tsx  # Expression calculator
│       ├── CalendarWidget.tsx    # Event calendar
│       ├── ChartWidget.tsx       # Bar/line/pie charts (canvas)
│       ├── TimerWidget.tsx       # Countdown/stopwatch/pomodoro
│       └── DataTable.tsx         # Sortable data table
├── hooks/
│   └── useChat.ts               # SSE streaming + state management
├── lib/
│   ├── langchain/tools.ts       # Weather, calculator, date, priority tools
│   ├── langgraph/graph.ts       # 4-node orchestration graph
│   └── utils.ts                 # Shared utilities
└── types/index.ts               # All TypeScript types
```

---

## 🔑 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | ✅ | Groq API key for LLM inference |
| `NEXT_PUBLIC_APP_URL` | ❌ | Public app URL (default: `http://localhost:3000`) |
| `LANGCHAIN_TRACING_V2` | ❌ | Enable LangSmith tracing |
| `LANGCHAIN_API_KEY` | ❌ | LangSmith API key |
| `LANGCHAIN_PROJECT` | ❌ | LangSmith project name |

---

## 🧩 Adding New UI Components

1. **Add the type** to `src/types/index.ts` → `GeneratedUIType` union
2. **Create the component** in `src/components/generated/YourWidget.tsx`
3. **Register it** in `GeneratedUIRenderer.tsx` (dynamic import + switch case)
4. **Add intent** to LangGraph's `detectIntentNode` system prompt
5. **Add schema** to `generateUIDataNode` in `graph.ts`

---

## 🐳 Docker Details

| Image | Size (approx) | Notes |
|---|---|---|
| `deps` stage | 400MB | All node_modules |
| `builder` stage | 600MB | Build artifacts |
| `runner` (final) | ~180MB | Only standalone output |

The production image uses Next.js `output: 'standalone'` to minimize size.

---

## 📄 License

MIT
