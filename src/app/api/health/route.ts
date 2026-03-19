import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? "1.0.0",
    env: {
      groqConfigured: !!process.env.GROQ_API_KEY,
      nodeEnv: process.env.NODE_ENV,
    },
  });
}
