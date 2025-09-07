import { NextResponse } from 'next/server';

export async function GET() {
  console.log("Test API route called");
  return NextResponse.json({ 
    message: "API is working",
    env: {
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "SET" : "MISSING",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "SET" : "MISSING",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || "NOT SET"
    }
  });
}