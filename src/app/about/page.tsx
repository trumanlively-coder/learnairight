export default function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <p className="text-amber-400 font-bold tracking-widest text-xs">ABOUT LEARNAIRIGHT</p>
      <h1 className="mt-3 text-5xl font-black">AI fluency, treated as a business skill.</h1>
      <div className="mt-6 space-y-4 text-zinc-300 leading-relaxed">
        <p>LearnAIRight is workflow-first training for teams and independent professionals. The premise is direct: most teams are already using AI — untrained, inconsistently, and at times with client or internal data pasted into public chatbots. That scattered use creates rework, uneven quality, and avoidable risk. It also leaves real leverage on the table.</p>
        <p>The response is not more hype or a longer tool list. It is a standard way of working: define the task, brief it properly, template what repeats, automate only what has proved reliable, and measure whether output quality and cycle time actually improve.</p>
        <h2 className="pt-4 text-2xl font-bold text-white">The method</h2>
        <p><b className="text-white">Diagnose → Brief → Template → Automate → Deepen.</b> Diagnose where AI is already being used and where the risk and rework sit. Brief work to a consistent standard. Template recurring tasks so quality does not depend on who prompted. Automate only proven steps, with human checkpoints and stop rules. Deepen through shared playbooks and measured outcomes.</p>
        <h2 className="pt-4 text-2xl font-bold text-white">Who it serves</h2>
        <p>Teams that need consistent, reviewable output across people — and independent professionals using AI as a multiplier on an existing craft, not a substitute for it. The free foundations module is the entry point: a manager can assess depth, a practitioner can establish a first standard, and a team can decide whether a structured rollout is warranted.</p>
        <h2 className="pt-4 text-2xl font-bold text-white">Standards</h2>
        <p>LearnAIRight does not publish fabricated results. Success stories are curated from external, attributed sources and labelled as such; they are not presented as LearnAIRight customer outcomes. Guidance is workflow-first and conservative where risk is real: human approval for consequential output, verification for facts, and no automation without a checkpoint that can catch a wrong result.</p>
        <p>What LearnAIRight is not: a prompt-of-the-day feed, a guarantee of productivity gains, or a replacement for professional judgement on money, legal, health, safety, or client commitments.</p>
      </div>
      <div className="mt-8 grid sm:grid-cols-3 gap-4">
        {[["Built for practitioners","Training structured around live tasks, review standards, and repeatable workflows — not tool tourism."],["Workflow-first","Briefs, templates, checkpoints, and stop rules before automation. Reliability first, scale second."],["Measured outcomes","Track revision count, time-to-acceptable-draft, checkpoint catches, and cost per outcome."]].map(([t,d])=>(
          <div key={t} className="rounded-3xl border border-white/10 p-5"><h3 className="font-bold">{t}</h3><p className="mt-1 text-sm text-zinc-400">{d}</p></div>
        ))}
      </div>
    </div>
  );
}
