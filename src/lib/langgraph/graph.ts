import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { z } from "zod";
import { allTools, toolsByName } from "@/lib/langchain/tools";
import type { GeneratedUIType, GraphState } from "@/types";

// ─── Intent Classification Schema ─────────────────────────────────────────────

const IntentSchema = z.object({
  uiType: z.enum([
    "todo-list",
    "weather-widget",
    "calculator",
    "calendar",
    "data-table",
    "chart",
    "kanban-board",
    "timer",
    "text",
  ]),
  confidence: z.number().min(0).max(1),
  requiredTools: z.array(z.string()),
  reasoning: z.string(),
});

type Intent = z.infer<typeof IntentSchema>;

// ─── Groq Client ──────────────────────────────────────────────────────────────

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set");
  return new ChatGroq({
    apiKey,
    model: "llama-3.3-70b-versatile",   // replaces decommissioned llama-3.1-70b-versatile
    temperature: 0.1,
  });
}

function getGroqClientFast() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set");
  return new ChatGroq({
    apiKey,
    model: "llama-3.1-8b-instant",      // still active — no change needed
    temperature: 0.1,
  });
}

// ─── Node: Intent Detection ───────────────────────────────────────────────────

export async function detectIntentNode(
  state: GraphState
): Promise<Partial<GraphState>> {
  const model = getGroqClientFast();

  const systemPrompt = `You are an AI UI Router. Analyze user queries and determine the best UI component to generate.

UI Components available:
- todo-list: For task lists, todos, action items, checklists with deadlines
- weather-widget: For weather queries, forecasts, temperature
- calculator: For math, calculations, computations, unit conversions
- calendar: For scheduling, events, meetings, reminders, date planning
- data-table: For displaying structured data, comparisons, spreadsheet-like content
- chart: For visualizations, graphs, trends, analytics, statistics
- kanban-board: For project management, workflow stages, sprint planning
- timer: For countdowns, timers, pomodoro sessions, time tracking
- text: For general chat, explanations, questions without visual UI

Required tools:
- todo-list: May need "prioritize_todos" and "get_datetime_info"
- weather-widget: Needs "get_weather"
- calculator: Needs "calculate"
- calendar: Needs "get_datetime_info"
- kanban-board: May need "prioritize_todos"
- text: No tools needed

Respond ONLY with valid JSON matching this schema:
{
  "uiType": "<component_type>",
  "confidence": <0.0-1.0>,
  "requiredTools": ["tool1", "tool2"],
  "reasoning": "<brief explanation>"
}`;

  try {
    const response = await model.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(state.currentQuery),
    ]);

    const content = response.content as string;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");

    const parsed = IntentSchema.parse(JSON.parse(jsonMatch[0]));

    return {
      detectedIntent: parsed.uiType as GeneratedUIType,
      toolResults: { _intent: parsed },
    };
  } catch {
    return {
      detectedIntent: "text",
      toolResults: {},
    };
  }
}

// ─── Node: Tool Execution ─────────────────────────────────────────────────────

export async function executeToolsNode(
  state: GraphState
): Promise<Partial<GraphState>> {
  const intent = state.toolResults["_intent"] as Intent | undefined;
  if (!intent?.requiredTools?.length) return {};

  const toolResults: Record<string, unknown> = { ...state.toolResults };

  for (const toolName of intent.requiredTools) {
    const tool = toolsByName[toolName];
    if (!tool) continue;

    try {
      let toolInput: Record<string, unknown> = {};

      // Build tool input based on query context
      if (toolName === "get_weather") {
        const cityMatch = state.currentQuery.match(
          /weather (?:in |for )?([a-zA-Z\s,]+)/i
        );
        toolInput = { city: cityMatch?.[1]?.trim() ?? "London" };
      } else if (toolName === "calculate") {
        const exprMatch = state.currentQuery.match(
          /(?:calculate|compute|what is|=)\s*([\d\s+\-*/().^%]+)/i
        );
        toolInput = {
          expression: exprMatch?.[1]?.trim() ?? "0",
          context: state.currentQuery,
        };
      } else if (toolName === "prioritize_todos") {
        // Will be populated by the UI generation node
        toolInput = { todos: [] };
      } else if (toolName === "get_datetime_info") {
        toolInput = { query: state.currentQuery };
      }

      const result = await tool.invoke(toolInput);
      toolResults[toolName] = JSON.parse(result as string);
    } catch (err) {
      toolResults[`${toolName}_error`] = String(err);
    }
  }

  return { toolResults };
}

// ─── Node: UI Data Generation ─────────────────────────────────────────────────

export async function generateUIDataNode(
  state: GraphState
): Promise<Partial<GraphState>> {
  const model = getGroqClient();
  const intent = state.detectedIntent ?? "text";
  const toolData = JSON.stringify(state.toolResults, null, 2);

  const uiSchemas: Record<string, string> = {
    "todo-list": `{
  "title": "string",
  "description": "string",
  "todos": [{
    "id": "string (uuid-like)",
    "text": "string",
    "completed": false,
    "priority": "critical|high|medium|low",
    "deadline": "ISO date string or null",
    "tags": ["string"],
    "estimatedMinutes": number,
    "status": "pending|in-progress|completed",
    "order": number
  }]
}`,
    "weather-widget": `Use the weather tool data directly`,
    calculator: `{
  "title": "string",
  "expression": "string",
  "result": number,
  "history": [{"expression": "string", "result": number}]
}`,
    calendar: `{
  "title": "string",
  "events": [{
    "id": "string",
    "title": "string",
    "date": "YYYY-MM-DD",
    "time": "HH:MM",
    "duration": number (minutes),
    "color": "hex color",
    "description": "string"
  }],
  "initialDate": "YYYY-MM-DD"
}`,
    "kanban-board": `{
  "title": "string",
  "description": "string",
  "columns": [{
    "id": "string",
    "title": "string",
    "color": "hex color",
    "cards": [{
      "id": "string",
      "title": "string",
      "description": "string",
      "priority": "critical|high|medium|low",
      "dueDate": "YYYY-MM-DD or null",
      "tags": ["string"]
    }]
  }]
}`,
    chart: `{
  "title": "string",
  "chartType": "bar|line|pie|area",
  "labels": ["string"],
  "datasets": [{
    "label": "string",
    "data": [number],
    "color": "hex"
  }],
  "description": "string"
}`,
    "data-table": `{
  "title": "string",
  "headers": ["string"],
  "rows": [["cell values"]],
  "description": "string"
}`,
    timer: `{
  "title": "string",
  "duration": number (seconds),
  "label": "string",
  "type": "countdown|stopwatch|pomodoro"
}`,
  };

  const schema = uiSchemas[intent] ?? "Respond conversationally";

  const systemPrompt = `You are a UI data generator. Given a user query, generate structured JSON data for a ${intent} component.

${intent === "text" ? "Respond with helpful, conversational markdown text." : `Generate ONLY valid JSON matching this schema:
${schema}

Tool data available: ${toolData}`}

Rules:
- Be creative and realistic with data
- For todos: generate 4-8 realistic tasks based on the user's request
- Dates should be relative to today: ${new Date().toISOString().split("T")[0]}
- Make content relevant and helpful
- ${intent !== "text" ? "Return ONLY the JSON object, no markdown, no explanation" : "Use markdown formatting"}`;

  const response = await model.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(state.currentQuery),
  ]);

  const content = response.content as string;

  if (intent === "text") {
    return { uiData: null, streamingText: content };
  }

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON");
    const parsed = JSON.parse(jsonMatch[0]);
    return { uiData: parsed };
  } catch {
    return { uiData: null, streamingText: content };
  }
}

// ─── Node: Post-process (AI prioritization for todos) ────────────────────────

export async function postProcessNode(
  state: GraphState
): Promise<Partial<GraphState>> {
  if (state.detectedIntent !== "todo-list" || !state.uiData) return {};

  const data = state.uiData as { todos?: Array<{ id: string; text: string; deadline?: string; tags?: string[] }> };
  if (!data.todos?.length) return {};

  try {
    const { prioritizationTool } = await import("@/lib/langchain/tools");
    const result = await prioritizationTool.invoke({ todos: data.todos });
    const priorityMap = JSON.parse(result as string) as Record<string, string>;

    const updatedTodos = data.todos.map((todo, index) => ({
      ...todo,
      priority: priorityMap[todo.id] ?? "medium",
      order: index,
      status: "pending" as const,
      completed: false,
    }));

    return {
      uiData: { ...data, todos: updatedTodos },
    };
  } catch {
    return {};
  }
}

// ─── Main Graph Executor ──────────────────────────────────────────────────────

export interface GraphRunResult {
  uiType: GeneratedUIType;
  uiData: unknown;
  text: string;
}

export async function runGraph(
  query: string,
  messageHistory: Array<{ role: string; content: string }> = []
): Promise<GraphRunResult> {
  let state: GraphState = {
    messages: [],
    currentQuery: query,
    detectedIntent: null,
    toolResults: {},
    uiData: null,
    streamingText: "",
  };

  // Node 1: Detect Intent
  const intentResult = await detectIntentNode(state);
  state = { ...state, ...intentResult };

  // Node 2: Execute Tools (conditional)
  const intent = state.toolResults["_intent"] as Intent | undefined;
  if (intent?.requiredTools?.length && intent.requiredTools[0] !== "") {
    const toolResult = await executeToolsNode(state);
    state = { ...state, ...toolResult };
  }

  // Node 3: Generate UI Data
  const uiResult = await generateUIDataNode(state);
  state = { ...state, ...uiResult };

  // Node 4: Post-process (AI prioritization)
  if (state.detectedIntent === "todo-list") {
    const ppResult = await postProcessNode(state);
    state = { ...state, ...ppResult };
  }

  return {
    uiType: state.detectedIntent ?? "text",
    uiData: state.uiData,
    text: state.streamingText,
  };
}
