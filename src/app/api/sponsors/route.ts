import { NextResponse } from "next/server";
import { addSponsor, readSponsors } from "@/lib/sponsors";
import { isAdminAuthenticated, isAdminConfigured } from "@/lib/admin-auth";

// POST stays public: it is the sponsor inquiry form on /pricing.
// It only creates a pending_approval request; it never returns the list.
export async function POST(req: Request) {
  const b = await req.json();
  if (!b.business || !b.contact || !b.email) return NextResponse.json({ error: "business, contact and email required" }, { status: 400 });
  addSponsor({ business: b.business, contact: b.contact, email: b.email, website: b.website || "", tier: b.tier || "Not sure yet", message: b.message || "" });
  return NextResponse.json({ ok: true });
}

// GET lists sponsor requests incl. contact emails — admin only.
export async function GET() {
  if (!isAdminConfigured()) return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ sponsors: readSponsors() });
}
