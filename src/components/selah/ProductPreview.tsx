import { useState } from "react";
import { Sun, Feather, ClipboardList, Heart, BookOpen } from "lucide-react";

const tabs = [
  { id: "today", label: "Today", icon: Sun },
  { id: "pray", label: "Pray", icon: Feather },
  { id: "requests", label: "Requests", icon: ClipboardList },
  { id: "answered", label: "Answered", icon: Heart },
  { id: "journal", label: "Journal", icon: BookOpen },
] as const;

type TabId = (typeof tabs)[number]["id"];

export const ProductPreview = () => {
  const [active, setActive] = useState<TabId>("today");

  return (
    <div className="relative">
      <div className="absolute -inset-12 bg-lantern blur-3xl opacity-50 pointer-events-none" />
      <div className="relative rounded-[2rem] border hairline bg-card-soft backdrop-blur-xl shadow-soft p-3 sm:p-4">
        <div className="flex flex-wrap gap-1.5 p-1.5 rounded-2xl bg-background/40 border hairline">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = active === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                  isActive
                    ? "bg-gold text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-parchment"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="whitespace-nowrap">{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 grid md:grid-cols-5 gap-3">
          <aside className="md:col-span-2 rounded-2xl border hairline bg-background/40 p-5">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-3">
              This week
            </div>
            <ul className="space-y-3">
              {[
                { d: "Mon", t: "Stillness before the day" },
                { d: "Wed", t: "Patience with my family" },
                { d: "Thu", t: "A prayer for clarity" },
                { d: "Sat", t: "Gratitude — small mercies" },
              ].map((e, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-foreground/80 hover:text-parchment cursor-default transition-colors"
                >
                  <span className="font-serif text-primary/80 w-9 shrink-0">{e.d}</span>
                  <span className="font-serif italic leading-snug">{e.t}</span>
                </li>
              ))}
            </ul>
          </aside>

          <main className="md:col-span-3 rounded-2xl border hairline bg-background/30 p-6 min-h-[260px]">
            {active === "today" && (
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-primary/80 mb-2">Today</p>
                <h4 className="font-serif text-parchment text-xl mb-4">A prayer for stillness</h4>
                <p className="font-serif italic text-foreground/85 leading-relaxed">
                  "Father, quiet the corners of my mind that will not rest. Teach me to wait without
                  fear, to listen without rushing, to trust You with the day You have given."
                </p>
              </div>
            )}
            {active === "pray" && (
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-primary/80 mb-2">Guided session</p>
                <h4 className="font-serif text-parchment text-xl mb-4">Praise · Will · Needs · Forgive · Protect · Worship</h4>
                <p className="text-foreground/85 leading-relaxed">
                  Move gently through each phase of the Lord's Prayer with prompts and Scripture.
                  Selah remembers what you carried in so you can return to it later.
                </p>
              </div>
            )}
            {active === "requests" && (
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-primary/80 mb-2">Requests</p>
                <h4 className="font-serif text-parchment text-xl mb-4">What you're carrying</h4>
                <ul className="space-y-2 text-foreground/85 leading-relaxed">
                  <li>· Healing for Mom's recovery</li>
                  <li>· Wisdom in the new role at work</li>
                  <li>· Peace in our home this week</li>
                </ul>
              </div>
            )}
            {active === "answered" && (
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-primary/80 mb-2">Stones of remembrance</p>
                <h4 className="font-serif text-parchment text-xl mb-4">He answered</h4>
                <p className="font-serif italic text-foreground/85 leading-relaxed">
                  "Lord, I cannot see how this resolves." — Today I see a little more. Thank You
                  for being patient with me while I learn to trust.
                </p>
              </div>
            )}
            {active === "journal" && (
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-primary/80 mb-2">Entry</p>
                <h4 className="font-serif text-parchment text-xl mb-4">Tuesday evening</h4>
                <p className="text-foreground/85 leading-relaxed">
                  Today felt heavy in a way I couldn't name. I am writing it down so I don't carry
                  it alone. I want to remember this, even the unfinished parts — especially those.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
