import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  Compass,
  Cross,
  Feather,
  Flame,
  Heart,
  History,
  LayoutGrid,
  Lock,
  Pause,
  PenLine,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Lantern } from "@/components/selah/Lantern";
import { Nav } from "@/components/selah/Nav";
import { JournalMockup } from "@/components/selah/JournalMockup";
import { ProductPreview } from "@/components/selah/ProductPreview";
import { useAuth } from "@/hooks/useAuth";

const features = [
  {
    icon: Compass,
    title: "Guided Prayer Flow",
    body: "Step through each phase with prompts that help you articulate what's on your heart.",
  },
  {
    icon: ClipboardList,
    title: "Prayer Requests",
    body: "Capture what's weighing on you and revisit it in your prayers, day after day.",
  },
  {
    icon: Heart,
    title: "Stones of Remembrance",
    body: "Mark answered prayers and build a quiet record of God's faithfulness over time.",
  },
  {
    icon: BookOpen,
    title: "Daily Scripture",
    body: "Begin each session anchored in the Word with verses that meet you where you are.",
  },
  {
    icon: Feather,
    title: "Journal",
    body: "Write reflections, dreams, and the words God is putting on your heart this season.",
  },
  {
    icon: History,
    title: "Prayer History",
    body: "Look back through past sessions and notice the patterns of how God has answered.",
  },
];

const frameworks = [
  {
    icon: Cross,
    title: "The Lord's Prayer",
    phases: 6,
    body: "The traditional prayer structure based on the Lord's Prayer.",
  },
  {
    icon: LayoutGrid,
    title: "ACTS",
    phases: 4,
    body: "Adoration, Confession, Thanksgiving, Supplication. Simple and memorable.",
  },
  {
    icon: Flame,
    title: "Daily Examen",
    phases: 5,
    body: "Reflective prayer practice from St. Ignatius. Ideal for end-of-day prayer.",
  },
];

const steps = [
  {
    icon: Pause,
    title: "Choose a framework",
    body: "Pick the prayer structure that fits this season — Lord's Prayer, ACTS, or Examen.",
  },
  {
    icon: PenLine,
    title: "Pray through each phase",
    body: "Move gently through guided prompts, Scripture, and space to write what's on your heart.",
  },
  {
    icon: RotateCcw,
    title: "Mark answered prayers and revisit",
    body: "Save Stones of Remembrance and return to past prayers to trace God's faithfulness.",
  },
];

export default function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/home", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="theme-twilight min-h-screen flex flex-col items-center justify-center gap-3">
        <span className="lantern-glow inline-flex">
          <Lantern className="h-10 w-10" />
        </span>
        <div className="text-muted-foreground text-sm">Loading…</div>
      </div>
    );
  }

  return (
    <div id="top" className="theme-twilight min-h-screen text-foreground grain">
      <Nav />

      {/* HERO */}
      <section className="relative pt-36 sm:pt-44 pb-24 sm:pb-32">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-24 left-10 h-1 w-1 rounded-full bg-primary-glow/60 blur-[1px]" />
          <div className="absolute top-44 right-24 h-1.5 w-1.5 rounded-full bg-primary/40 blur-[1px]" />
          <div className="absolute top-72 left-1/3 h-1 w-1 rounded-full bg-primary-glow/40 blur-[1px]" />
        </div>

        <div className="mx-auto max-w-6xl px-6 grid lg:grid-cols-2 gap-14 lg:gap-10 items-center">
          <div className="reveal">
            <div className="inline-flex items-center gap-2 rounded-full border hairline bg-card-soft/60 backdrop-blur-md px-3.5 py-1.5 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-glow flex-shrink-0" />
              A quiet companion for prayer & journaling
            </div>

            <h1 className="mt-6 font-serif text-4xl sm:text-5xl lg:text-[3.6rem] leading-[1.05] text-parchment text-balance">
              Slow down. <span className="italic text-primary">Pray deeply.</span>
              <br className="hidden sm:block" /> Remember what God is doing.
            </h1>

            <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl text-pretty">
              Selah is a quiet prayer and journaling companion built to help you reflect, pray with
              intention, and trace the Lord's faithfulness over time.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/auth"
                className="group inline-flex items-center gap-2 bg-gold text-primary-foreground font-medium px-6 py-3.5 rounded-full shadow-glow hover:brightness-110 transition-all"
              >
                Enter Selah
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 border hairline text-parchment px-6 py-3.5 rounded-full hover:bg-card-soft transition-colors"
              >
                See how it works
              </a>
            </div>

            <p className="mt-6 text-xs text-muted-foreground/80 flex items-center gap-2">
              <Lock className="h-3 w-3" />
              Private by design. Built for reflection, not distraction.
            </p>
          </div>

          <div className="reveal reveal-delay-2">
            <div className="relative max-w-md mx-auto lg:max-w-none">
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 lantern-glow">
                <Lantern className="h-20 w-20" />
              </div>
              <JournalMockup />
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="relative py-24 sm:py-28">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl text-parchment text-balance leading-tight">
            Prayer gets scattered. Journals get lost.
            <br className="hidden sm:block" />
            <span className="italic text-primary"> Reflections fade.</span>
          </h2>
          <p className="mt-5 text-muted-foreground max-w-2xl mx-auto text-pretty">
            Selah gives your devotional life a quiet place to breathe — somewhere honest, simple,
            and yours.
          </p>

          <div className="mt-14 grid md:grid-cols-3 gap-5 text-left">
            {[
              { a: "Scattered prayers", b: "become intentional conversations." },
              { a: "Passing thoughts", b: "become remembered reflections." },
              { a: "Daily moments", b: "become a record of faithfulness." },
            ].map((c, i) => (
              <div
                key={i}
                className="rounded-2xl border hairline bg-card-soft backdrop-blur-md p-7 hover:border-primary/30 transition-colors"
              >
                <p className="font-serif text-xl text-parchment leading-snug">
                  {c.a}
                  <span className="block text-muted-foreground italic font-normal text-base mt-1.5">
                    {c.b}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative py-24 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.22em] text-primary/80 mb-4">What's inside</p>
            <h2 className="font-serif text-3xl sm:text-4xl text-parchment leading-tight text-balance">
              Quiet tools for an honest devotional life.
            </h2>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group rounded-2xl border hairline bg-card-soft backdrop-blur-md p-7 hover:border-primary/30 hover:-translate-y-0.5 transition-all"
                >
                  <div className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-background/60 border hairline text-primary group-hover:brightness-110 transition-all">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-serif text-xl text-parchment">{f.title}</h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed text-[15px]">{f.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FRAMEWORKS */}
      <section id="frameworks" className="relative py-24 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.22em] text-primary/80 mb-4">
              Frameworks
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl text-parchment leading-tight text-balance">
              Choose your prayer framework.
            </h2>
            <p className="mt-4 text-muted-foreground text-pretty">
              Three time-tested structures to give your prayers shape — switch between them
              whenever a season calls for something different.
            </p>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-5">
            {frameworks.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-2xl border hairline bg-card-soft backdrop-blur-md p-7 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-background/60 border hairline text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs uppercase tracking-[0.2em] text-primary/70">
                      {f.phases} phases
                    </span>
                  </div>
                  <h3 className="mt-5 font-serif text-2xl text-parchment">{f.title}</h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed text-[15px]">{f.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="relative py-24 sm:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-[0.22em] text-primary/80 mb-4">
              How Selah works
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl text-parchment leading-tight text-balance">
              Three small movements. Repeated gently, over time.
            </h2>
          </div>

          <div className="mt-14 grid md:grid-cols-3 gap-5 relative">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className="relative rounded-2xl border hairline bg-card-soft backdrop-blur-md p-7"
                >
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-gold text-primary-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-serif text-5xl text-primary/15">0{i + 1}</span>
                  </div>
                  <h3 className="mt-5 font-serif text-2xl text-parchment">{s.title}</h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed">{s.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SPIRITUAL POSITIONING */}
      <section className="relative py-28 sm:py-36">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="lantern-glow inline-flex mb-8">
            <Lantern className="h-12 w-12" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl leading-snug text-parchment text-balance">
            Selah is not here to replace prayer, Scripture, church, or spiritual discipline.
          </p>
          <p className="mt-5 font-serif italic text-xl sm:text-2xl text-primary/90 leading-snug text-balance">
            It is simply a lamp beside the path — a place to write, to remember, and to return.
          </p>
          <div className="mt-10 mx-auto h-px w-24 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <p className="mt-6 text-sm text-muted-foreground italic">
            "Your word is a lamp to my feet and a light to my path." — Psalm 119:105
          </p>
        </div>
      </section>

      {/* PRODUCT PREVIEW */}
      <section id="preview" className="relative py-24 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl mb-12">
            <p className="text-xs uppercase tracking-[0.22em] text-primary/80 mb-4">Inside Selah</p>
            <h2 className="font-serif text-3xl sm:text-4xl text-parchment leading-tight text-balance">
              A simple, sacred space — open whenever you need to come back.
            </h2>
          </div>
          <ProductPreview />
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-28 sm:py-36">
        <div className="mx-auto max-w-3xl px-6">
          <div className="relative rounded-[2rem] border hairline bg-card-soft backdrop-blur-xl p-10 sm:p-14 text-center overflow-hidden shadow-soft">
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-64 bg-lantern blur-3xl opacity-70 pointer-events-none" />
            <h2 className="relative font-serif text-3xl sm:text-5xl text-parchment leading-tight text-balance">
              Make room to remember.
            </h2>
            <p className="relative mt-5 text-muted-foreground max-w-xl mx-auto text-pretty">
              Begin building a private record of prayer, reflection, and God's faithfulness.
            </p>
            <div className="relative mt-8 flex justify-center">
              <Link
                to="/auth"
                className="group inline-flex items-center gap-2 bg-gold text-primary-foreground font-medium px-7 py-4 rounded-full shadow-glow hover:brightness-110 transition-all"
              >
                Start using Selah
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t hairline">
        <div className="mx-auto max-w-6xl px-6 py-12 grid sm:grid-cols-2 gap-8 items-start">
          <div>
            <div className="flex items-center gap-2.5">
              <Lantern className="h-7 w-7" />
              <span className="font-serif text-lg text-parchment">Selah</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground max-w-xs">
              A quiet place to pray, journal, and remember what God is doing.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-2 sm:justify-end text-sm text-muted-foreground">
            <Link to="/auth" className="hover:text-parchment transition-colors">Sign in</Link>
            <Link to="/privacy" className="hover:text-parchment transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-parchment transition-colors">Terms</Link>
            <Link to="/contact" className="hover:text-parchment transition-colors">Contact</Link>
          </div>
        </div>
        <div className="border-t hairline">
          <p className="mx-auto max-w-6xl px-6 py-5 text-xs text-muted-foreground/70">
            © {new Date().getFullYear()} Selah. Made with care.
          </p>
        </div>
      </footer>

      {/* Sparkles import kept to avoid tree-shake warnings on unused imports — used implicitly */}
      <span className="hidden">
        <Sparkles />
      </span>
    </div>
  );
}
