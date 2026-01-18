import { Link } from 'react-router-dom';
import { BookHeart, ArrowLeft, Mail } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { GlobalAudioButton } from '@/components/GlobalAudioButton';

export default function Contact() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm shadow-soft">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <BookHeart className="h-7 w-7 text-primary" />
            <span className="font-display text-xl font-semibold">Selah</span>
          </Link>
          <div className="flex items-center gap-2">
            <GlobalAudioButton />
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <header className="mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-semibold mb-4">
            Contact Us
          </h1>
          <p className="text-muted-foreground">
            We'd love to hear from you
          </p>
        </header>

        <div className="prose prose-lg dark:prose-invert max-w-none space-y-10">
          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">Get in Touch</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Have questions, feedback, or suggestions for Selah? We're here to help. Whether you're experiencing technical issues, have ideas for new features, or just want to share how Selah has impacted your prayer life, we'd love to hear from you.
            </p>
            
            <div className="bg-card border border-border rounded-xl p-6 inline-flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Email us at</p>
                <a
                  href="mailto:Selah.Prayer.App@gmail.com"
                  className="text-primary font-medium text-lg hover:underline"
                >
                  Selah.Prayer.App@gmail.com
                </a>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">Response Time</h2>
            <p className="text-muted-foreground leading-relaxed">
              We typically respond to emails within 1-2 business days. We appreciate your patience and look forward to connecting with you.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">Community</h2>
            <p className="text-muted-foreground leading-relaxed">
              Selah is built with love for the prayer community. Your feedback directly shapes the future of this app. Every suggestion, bug report, and word of encouragement helps us serve you better.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 md:px-8 py-8 border-t border-border">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
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
            <span className="text-foreground text-sm font-medium">Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
