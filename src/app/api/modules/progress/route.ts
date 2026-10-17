import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/user-auth";
import { saveFirstWinProgress } from "@/lib/users";
// Save Module 1 first-win checklist progress + the user's own prompt, per account.
// Anonymous progress lives only in the browser (localStorage) until signup.
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Create a free account to save your progress and prompt.", needsAuth: true }, { status: 401 });
  const { steps = [], prompt = "" } = await req.json().catch(() => ({}));
  if (typeof prompt !== "string" || prompt.length > 2000) return NextResponse.json({ error: "Prompt is too long (max 2000 characters)." }, { status: 400 });
  const updated = saveFirstWinProgress(user, steps, prompt);
  return NextResponse.json({ ok: true, firstWin: updated.firstWin });
}
