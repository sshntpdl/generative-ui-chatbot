import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { z } from "zod";
import { toolsByName } from "@/lib/langchain/tools";
import type { GeneratedUIType, GraphState } from "@/types";

const IntentSchema = z.object({
  uiType: z.enum(["todo-list","weather-widget","calculator","calendar","data-table","chart","kanban-board","timer","product-grid","product-detail","cart","order-tracking","text"]),
  confidence: z.number().min(0).max(1),
  requiredTools: z.array(z.string()),
  reasoning: z.string(),
});
type Intent = z.infer<typeof IntentSchema>;

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set");
  return new ChatGroq({ apiKey, model: "llama-3.3-70b-versatile", temperature: 0.1 });
}
function getGroqClientFast() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set");
  return new ChatGroq({ apiKey, model: "llama-3.1-8b-instant", temperature: 0.1 });
}

export async function detectIntentNode(state: GraphState): Promise<Partial<GraphState>> {
  const model = getGroqClientFast();
  const systemPrompt = `You are an AI UI Router. Analyze user queries and determine the best UI component.

UI Components:
- todo-list: task lists, todos, action items with deadlines
- weather-widget: weather, forecast, temperature queries
- calculator: math, calculations, unit conversions
- calendar: scheduling, events, meetings, reminders
- data-table: structured data, comparisons, tabular content
- chart: visualizations, graphs, trends, analytics
- kanban-board: project management, workflow, sprint planning
- timer: countdowns, Pomodoro, time tracking
- product-grid: product search, browsing, shopping results, "show me X products", "search for X", "find X under $Y"
- product-detail: single product deep-dive, "tell me about X product", "show details of X"
- cart: shopping cart, basket, "my cart", "add to cart", "checkout"
- order-tracking: order status, delivery tracking, "track my order", "where is my order"
- text: general chat, explanations, questions

Required tools by type:
- weather-widget: get_weather
- calculator: calculate
- todo-list: prioritize_todos, get_datetime_info
- calendar: get_datetime_info
- All ecommerce types: no tools needed (generate mock data)
- text: no tools

Respond ONLY with valid JSON:
{"uiType":"<type>","confidence":0.9,"requiredTools":["tool1"],"reasoning":"brief reason"}`;

  try {
    const response = await model.invoke([new SystemMessage(systemPrompt), new HumanMessage(state.currentQuery)]);
    const content = response.content as string;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON");
    const parsed = IntentSchema.parse(JSON.parse(jsonMatch[0]));
    return { detectedIntent: parsed.uiType as GeneratedUIType, toolResults: { _intent: parsed } };
  } catch {
    return { detectedIntent: "text", toolResults: {} };
  }
}

export async function executeToolsNode(state: GraphState): Promise<Partial<GraphState>> {
  const intent = state.toolResults["_intent"] as Intent | undefined;
  if (!intent?.requiredTools?.length) return {};
  const toolResults: Record<string, unknown> = { ...state.toolResults };
  for (const toolName of intent.requiredTools) {
    const tool = toolsByName[toolName];
    if (!tool) continue;
    try {
      let input: Record<string, unknown> = {};
      if (toolName === "get_weather") {
        const m = state.currentQuery.match(/weather (?:in |for )?([a-zA-Z\s,]+)/i);
        input = { city: m?.[1]?.trim() ?? "New York" };
      } else if (toolName === "calculate") {
        const m = state.currentQuery.match(/(?:calculate|compute|what is|=)\s*([\d\s+\-*/().^%]+)/i);
        input = { expression: m?.[1]?.trim() ?? "0", context: state.currentQuery };
      } else if (toolName === "prioritize_todos") {
        input = { todos: [] };
      } else if (toolName === "get_datetime_info") {
        input = { query: state.currentQuery };
      }
      const result = await tool.invoke(input);
      toolResults[toolName] = JSON.parse(result as string);
    } catch (err) { toolResults[`${toolName}_error`] = String(err); }
  }
  return { toolResults };
}

export async function generateUIDataNode(state: GraphState): Promise<Partial<GraphState>> {
  const model = getGroqClient();
  const intent = state.detectedIntent ?? "text";
  const toolData = JSON.stringify(state.toolResults, null, 2);
  const today = new Date().toISOString().split("T")[0];

  const schemas: Record<string, string> = {
    "todo-list": `{"title":"string","description":"string","todos":[{"id":"nanoid","text":"string","completed":false,"priority":"critical|high|medium|low","deadline":"ISO date or null","tags":["string"],"estimatedMinutes":number,"status":"pending","order":number}]}`,
    "weather-widget": `Use tool data directly as {"data": <tool_result>}`,
    "calculator": `{"title":"string","expression":"string","result":number,"history":[{"expression":"string","result":number}]}`,
    "calendar": `{"title":"string","events":[{"id":"string","title":"string","date":"YYYY-MM-DD","time":"HH:MM","duration":number,"color":"hex","description":"string"}],"initialDate":"YYYY-MM-DD"}`,
    "kanban-board": `{"title":"string","description":"string","columns":[{"id":"string","title":"string","color":"hex","cards":[{"id":"string","title":"string","description":"string","priority":"critical|high|medium|low","dueDate":"YYYY-MM-DD or null","tags":["string"]}]}]}`,
    "chart": `{"title":"string","chartType":"bar|line|pie","labels":["string"],"datasets":[{"label":"string","data":[number],"color":"hex"}],"description":"string"}`,
    "data-table": `{"title":"string","headers":["string"],"rows":[["string or number"]],"description":"string"}`,
    "timer": `{"title":"string","duration":number,"label":"string","type":"countdown|stopwatch|pomodoro"}`,
    "product-grid": `{"title":"string","query":"string","description":"string","products":[{"id":"string","name":"string","brand":"string","price":number,"originalPrice":number,"currency":"$","rating":4.5,"reviewCount":1234,"image":"emoji","category":"string","tags":["string"],"inStock":true,"stockCount":number,"description":"string","features":["string"],"badge":"Best Seller|New|Sale|Hot|null"}]}`,
    "product-detail": `{"product":{"id":"string","name":"string","brand":"string","price":number,"originalPrice":number,"currency":"$","rating":4.5,"reviewCount":1234,"image":"emoji","category":"string","tags":["string"],"inStock":true,"stockCount":number,"description":"string","features":["string"],"badge":"string","reviews":[{"author":"string","rating":5,"comment":"string","date":"string"}],"variants":[{"id":"string","label":"Color|Size|Storage","value":"string","inStock":true}]}}`,
    "cart": `{"title":"string","items":[{"product":{"id":"string","name":"string","brand":"string","price":number,"currency":"$","image":"emoji","category":"string","tags":[],"inStock":true,"rating":4,"reviewCount":100,"description":""},"quantity":number}],"discount":0.1}`,
    "order-tracking": `{"title":"string","orderId":"string","product":"string","status":"placed|confirmed|shipped|out-for-delivery|delivered","estimatedDelivery":"string","trackingNumber":"string","steps":[{"id":"placed|confirmed|shipped|out-for-delivery|delivered","label":"string","description":"string","timestamp":"string or null","completed":true,"active":false}]}`,
  };

  const ecommerceHints = `
For product images use relevant emojis: 📱💻🎧⌚🖥️👟👗📷🎮🏋️🎵📚✏️🧴💄🛒
For product grids: generate 4-8 realistic products matching the query. Include variety of prices, ratings, brands.
For product detail: include 3-4 reviews, 2-3 variant types (color/size/storage), and 5-6 key features.
For cart: include 2-4 realistic items with quantities.
For order tracking: make steps realistic — earlier steps completed, current step active, future steps incomplete.
`;

  const systemPrompt = `You are a UI data generator. Generate structured JSON for a ${intent} component.

Schema: ${schemas[intent] ?? "Respond conversationally in markdown"}

Today: ${today}
Tool data: ${toolData}
${intent.startsWith("product") || intent === "cart" || intent === "order-tracking" ? ecommerceHints : ""}

Rules:
- Return ONLY valid JSON (no markdown, no explanation) for UI types
- Be realistic and creative with data matching the user's query
- For ecommerce: generate compelling, realistic product data with varied prices
${intent === "text" ? "- Use markdown formatting for text responses" : ""}`;

  const response = await model.invoke([new SystemMessage(systemPrompt), new HumanMessage(state.currentQuery)]);
  const content = response.content as string;

  if (intent === "text") return { uiData: null, streamingText: content };

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON");
    return { uiData: JSON.parse(jsonMatch[0]) };
  } catch {
    return { uiData: null, streamingText: content };
  }
}

export async function postProcessNode(state: GraphState): Promise<Partial<GraphState>> {
  if (state.detectedIntent !== "todo-list" || !state.uiData) return {};
  const data = state.uiData as { todos?: Array<{ id: string; text: string; deadline?: string; tags?: string[] }> };
  if (!data.todos?.length) return {};
  try {
    const { prioritizationTool } = await import("@/lib/langchain/tools");
    const result = await prioritizationTool.invoke({ todos: data.todos });
    const priorityMap = JSON.parse(result as string) as Record<string, string>;
    return { uiData: { ...data, todos: data.todos.map((t, i) => ({ ...t, priority: priorityMap[t.id] ?? "medium", order: i, status: "pending", completed: false })) } };
  } catch { return {}; }
}

export interface GraphRunResult { uiType: GeneratedUIType; uiData: unknown; text: string }

export async function runGraph(query: string, _history: Array<{role:string;content:string}> = []): Promise<GraphRunResult> {
  let state: GraphState = { messages: [], currentQuery: query, detectedIntent: null, toolResults: {}, uiData: null, streamingText: "" };
  const intentResult = await detectIntentNode(state); state = { ...state, ...intentResult };
  const intent = state.toolResults["_intent"] as Intent | undefined;
  if (intent?.requiredTools?.length && intent.requiredTools[0] !== "") {
    state = { ...state, ...await executeToolsNode(state) };
  }
  state = { ...state, ...await generateUIDataNode(state) };
  if (state.detectedIntent === "todo-list") state = { ...state, ...await postProcessNode(state) };
  return { uiType: state.detectedIntent ?? "text", uiData: state.uiData, text: state.streamingText };
}
