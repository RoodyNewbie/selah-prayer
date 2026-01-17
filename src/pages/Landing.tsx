import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookHeart, Cross, LayoutGrid, Flame, Compass, ClipboardList, Heart, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { GlobalAudioButton } from '@/components/GlobalAudioButton';
import { AnimateOnScroll } from '@/components/landing/AnimateOnScroll';
import { HeroIllustration } from '@/components/landing/HeroIllustration';
import { useAuth } from '@/hooks/useAuth';

const frameworks = [
  {
    title: "The Lord's Prayer",
    description: "The traditional prayer structure based on the Lord's Prayer",
    phases: 6,
    icon: Cross,
  },
  {
    title: "ACTS Prayer",
    description: "Classic four-phase framework taught widely across denominations. Simple and memorable.",
    phases: 4,
    icon: LayoutGrid,
  },
  {
    title: "Daily Examen",
    description: "Reflective prayer practice from St. Ignatius of Loyola. Ideal for end-of-day prayer.",
    phases: 5,
    icon: Flame,
  },
];

const features = [
  {
    title: "Guided Prayer Flow",
    description: "Step through each phase with prompts that help you articulate what's on your heart.",
    icon: Compass,
  },
  {
    title: "Prayer Requests",
    description: "Capture what's weighing on you and revisit it in your prayers.",
    icon: ClipboardList,
  },
  {
    title: "Stones of Remembrance",
    description: "Mark answered prayers and build a record of God's faithfulness.",
    icon: Heart,
  },
  {
    title: "Daily Scripture",
    description: "Start each session grounded in the Word.",
    icon: BookOpen,
  },
];

export default function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate('/home', { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground font-body">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky Navigation */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-background/95 backdrop-blur-sm shadow-soft' : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookHeart className="h-7 w-7 text-primary" />
            <span className="font-display text-xl font-semibold">Selah</span>
          </div>
          <div className="flex items-center gap-2">
            <GlobalAudioButton />
            <ThemeToggle />
            <Link
              to="/auth"
              className="text-muted-foreground hover:text-foreground transition-colors font-body text-sm px-2"
            >
              Log In
            </Link>
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link to="/auth?signup=true">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 md:px-8 pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <AnimateOnScroll>
              <div className="text-center md:text-left">
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight mb-6">
                  A guided space for deeper prayer
                </h1>
                <p className="text-muted-foreground text-lg md:text-xl mb-8 max-w-lg mx-auto md:mx-0">
                  Selah helps you structure your prayers with time-tested frameworks — so you never feel lost for words.
                </p>
                <div className="flex justify-center md:justify-start">
                  <Button asChild size="lg" className="text-base px-8">
                    <Link to="/auth?signup=true">Start Praying — It's Free</Link>
                  </Button>
                </div>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll delay={200}>
              <HeroIllustration className="hidden md:block" />
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Problem/Empathy Section */}
      <section className="px-4 md:px-8 py-16 md:py-24 bg-muted/30">
        <div className="max-w-2xl mx-auto text-center">
          <AnimateOnScroll>
            <h2 className="font-display text-3xl md:text-4xl font-semibold mb-8">
              Prayer doesn't have to feel scattered
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll delay={100}>
            <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
              Whether you're new to faith or have been walking with God for years, prayer can sometimes feel... hard to start. You sit down to pray and your mind goes blank. Or you have a thousand things to say but no idea how to organize them.
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll delay={200}>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Selah gives your prayers structure — gentle guidance through proven frameworks that help your thoughts flow from praise to petition, confession to gratitude.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Frameworks Section */}
      <section className="px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <AnimateOnScroll>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-center mb-12">
              Pray with intention using time-tested frameworks
            </h2>
          </AnimateOnScroll>
          <div className="grid md:grid-cols-3 gap-6">
            {frameworks.map((framework, index) => (
              <AnimateOnScroll key={framework.title} delay={index * 100}>
                <Card className="p-6 h-full hover:shadow-lifted transition-shadow duration-300 bg-card">
                  <framework.icon className="h-10 w-10 text-primary mb-4" />
                  <h3 className="font-display text-xl font-semibold mb-2">{framework.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{framework.description}</p>
                  <span className="text-xs text-primary font-medium">{framework.phases} phases</span>
                </Card>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 md:px-8 py-16 md:py-24 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <AnimateOnScroll>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-center mb-12">
              Everything you need. Nothing you don't.
            </h2>
          </AnimateOnScroll>
          <div className="grid sm:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <AnimateOnScroll key={feature.title} delay={index * 100}>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold mb-1">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <AnimateOnScroll>
            <h2 className="font-display text-3xl md:text-4xl font-semibold mb-8">
              Built for real prayer, not performance
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll delay={100}>
            <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
              I originally built Selah for myself. I wanted help structuring more articulate prayers using frameworks rooted in early church tradition. I never planned to share it.
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll delay={200}>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              But when my wife saw it, she got excited. She shared it with our Bible study group, and they loved it too. That's when I realized — maybe this could help others.
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll delay={300}>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Selah isn't trying to be everything. It's just a quiet place to meet with God.
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll delay={400}>
            <p className="font-display text-lg italic text-primary">— Roody, creator of Selah</p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Scripture Quote Section */}
      <section className="px-4 md:px-8 py-20 md:py-28 bg-muted/30">
        <div className="max-w-3xl mx-auto text-center">
          <AnimateOnScroll>
            <blockquote className="font-display text-2xl md:text-3xl lg:text-4xl italic text-foreground/90 mb-6">
              "Draw near to God, and he will draw near to you."
            </blockquote>
          </AnimateOnScroll>
          <AnimateOnScroll delay={100}>
            <cite className="text-muted-foreground text-lg">— James 4:8</cite>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <AnimateOnScroll>
            <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4">Ready to begin?</h2>
          </AnimateOnScroll>
          <AnimateOnScroll delay={100}>
            <p className="text-muted-foreground text-lg mb-8">
              Join others who are building a deeper prayer habit.
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll delay={200}>
            <Button asChild size="lg" className="text-base px-8">
              <Link to="/auth?signup=true">Get Started Free</Link>
            </Button>
          </AnimateOnScroll>
          <AnimateOnScroll delay={300}>
            <p className="text-muted-foreground text-sm mt-4">
              Free forever. Optional supporter upgrade available.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 md:px-8 py-8 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">© 2025 Selah</p>
          <div className="flex items-center gap-6">
            <Link
              to="/privacy"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/contact"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Contact
            </Link>
            <Link
              to="/auth"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Log In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
