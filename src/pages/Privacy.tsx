import { Link } from 'react-router-dom';
import { ArrowLeft, BookHeart } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { GlobalAudioButton } from '@/components/GlobalAudioButton';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm shadow-soft">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
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
      <main className="px-4 md:px-8 py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          {/* Back Link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-body">Back to Home</span>
          </Link>

          {/* Header */}
          <header className="mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-semibold mb-4">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground font-body">
              Last updated: January 2025
            </p>
          </header>

          {/* Sections */}
          <div className="space-y-10 font-body">
            {/* Section 1 */}
            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Selah ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our prayer journal application.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Information We Collect</h2>
              
              <h3 className="font-display text-lg font-medium mb-2 text-foreground/90">Account Information</h3>
              <p className="text-muted-foreground mb-4">When you create an account, we collect:</p>
              <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-1 ml-4">
                <li>Email address</li>
                <li>Name (if provided or obtained through Google sign-in)</li>
                <li>Password (encrypted, if using email signup)</li>
              </ul>

              <h3 className="font-display text-lg font-medium mb-2 text-foreground/90">Prayer Content</h3>
              <p className="text-muted-foreground mb-4">When you use Selah, we store:</p>
              <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-1 ml-4">
                <li>Prayer entries and journal content you create</li>
                <li>Prayer requests you add</li>
                <li>Answered prayers you mark ("Stones of Remembrance")</li>
                <li>Your selected prayer framework preferences</li>
              </ul>

              <h3 className="font-display text-lg font-medium mb-2 text-foreground/90">Usage Information</h3>
              <p className="text-muted-foreground">We may collect basic usage data such as:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Last login date</li>
                <li>Prayer session timestamps</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">How We Use Your Information</h2>
              <p className="text-muted-foreground mb-4">We use your information to:</p>
              <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-1 ml-4">
                <li>Create and manage your account</li>
                <li>Store and sync your prayer entries across sessions</li>
                <li>Provide the core functionality of the app</li>
                <li>Improve the app experience</li>
              </ul>

              <p className="text-foreground/90 font-medium mb-2">We do NOT:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Sell your personal information to third parties</li>
                <li>Share your prayer content with anyone</li>
                <li>Use your data for advertising</li>
                <li>Read or access your prayer entries for any purpose other than providing the service</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Data Storage & Security</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Your data is stored securely using industry-standard security practices including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1 ml-4">
                <li>Encryption in transit (HTTPS/TLS)</li>
                <li>Encryption at rest</li>
                <li>Secure authentication protocols</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                Your prayer content is private and only accessible to you through your authenticated account.
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Third-Party Services</h2>
              <p className="text-muted-foreground mb-4">Selah uses the following third-party services:</p>

              <h3 className="font-display text-lg font-medium mb-2 text-foreground/90">Google Sign-In (optional)</h3>
              <p className="text-muted-foreground mb-2">If you choose to sign in with Google:</p>
              <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1 ml-4">
                <li>We receive only your email and display name</li>
                <li>We do not access your Google contacts, calendar, or other data</li>
              </ul>
              <p className="text-muted-foreground">
                Google Privacy Policy:{' '}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  https://policies.google.com/privacy
                </a>
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Your Rights</h2>
              <p className="text-muted-foreground mb-4">You have the right to:</p>
              <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1 ml-4">
                <li>Access your personal data</li>
                <li>Export your prayer entries</li>
                <li>Delete your account and all associated data</li>
                <li>Opt out of any optional communications</li>
              </ul>
              <p className="text-muted-foreground">
                To exercise these rights, contact us at the email below.
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your data for as long as your account is active. If you delete your account, your personal information and prayer content will be permanently removed from our servers within 30 days.
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Selah is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify users of significant changes by updating the "Last updated" date at the top of this page.
              </p>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Contact Us</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                If you have questions about this Privacy Policy or your data, contact us at:
              </p>
              <p className="text-primary font-medium">
                <a href="mailto:unreasonablemelons@gmail.com" className="hover:underline">
                  unreasonablemelons@gmail.com
                </a>
              </p>
            </section>
          </div>

          {/* Back to Home */}
          <div className="mt-16 pt-8 border-t border-border">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="font-body">Back to Home</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 md:px-8 py-8 border-t border-border">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">© 2025 Selah</p>
          <div className="flex items-center gap-6">
            <span className="text-foreground text-sm font-medium">Privacy Policy</span>
            <Link
              to="/terms"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Terms of Service
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
