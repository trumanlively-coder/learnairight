import Link from "next/link";
export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-20">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-zinc-400 flex flex-col md:flex-row gap-6 justify-between">
        <div>
          <p className="text-white font-bold">LearnAIRight</p>
          <p className="mt-1 max-w-md">AI fluency for teams and independent professionals. Workflow-first training that turns scattered AI use into repeatable, measurable workflows — with human review where it matters.</p>
          <p className="mt-2 text-xs">Independent guide — not affiliated with or endorsed by xAI/Grok.</p>
        </div>
        <div className="flex gap-8">
          <div className="space-y-1 flex flex-col">
            <span className="text-white font-semibold">Site</span>
            <Link href="/tips">AI Tips</Link>
            <Link href="/stories">Success Stories</Link>
            <Link href="/modules">Training Modules</Link>
            <Link href="/premium">Premium</Link>
          </div>
          <div className="space-y-1 flex flex-col">
            <span className="text-white font-semibold">Business</span>
            <Link href="/pricing">Sponsor with us</Link>
            <Link href="/about">About</Link>
            <Link href="/admin/sponsors">Admin: Sponsors</Link>
            <Link href="/admin/subscribers">Admin: Subscribers</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
