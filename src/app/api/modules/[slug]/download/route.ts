import { NextResponse } from "next/server";
import { getModule } from "@/data/modules";
import { canAccessModule, getCurrentUser } from "@/lib/user-auth";
// Exercise download — access is checked server-side on every request.
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const mod = getModule(slug);
  if (!mod) return NextResponse.json({ error: "Module not found" }, { status: 404 });
  const user = await getCurrentUser();
  if (!canAccessModule(user, slug)) {
    return NextResponse.json({ error: "This exercise is locked. Start the free trial or buy access to download it." }, { status: 403 });
  }
  return new NextResponse(mod.exercise, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="learnairight-${slug}-exercise.md"`,
    },
  });
}
