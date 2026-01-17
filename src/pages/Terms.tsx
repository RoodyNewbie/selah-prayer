import { Link } from 'react-router-dom';
import { BookHeart, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { GlobalAudioButton } from '@/components/GlobalAudioButton';

export default function Terms() {
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
            Terms of Service
          </h1>
          <p className="text-muted-foreground">Last updated: January 2025</p>
        </header>

        <div className="prose prose-lg dark:prose-invert max-w-none space-y-10">
          {/* Section 1 */}
          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to Selah. By accessing or using our prayer journal application, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the service.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Selah is a guided prayer application designed to help you structure and deepen your prayer life using time-tested frameworks.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">2. Eligibility</h2>
            <p className="text-muted-foreground leading-relaxed">
              You must be at least 13 years old to use Selah. By using our service, you represent and warrant that you meet this age requirement. If you are under 18, you should review these Terms with a parent or guardian.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">3. Account Responsibilities</h2>
            <p className="text-muted-foreground leading-relaxed">
              When you create an account with Selah, you are responsible for:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
              <li>Maintaining the confidentiality of your login credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use of your account</li>
              <li>Ensuring the information you provide is accurate and up-to-date</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">4. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to use Selah only for its intended purpose as a personal prayer journal. You may not:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
              <li>Use the service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
              <li>Interfere with or disrupt the service or servers</li>
              <li>Use automated systems or software to extract data from the service</li>
              <li>Upload malicious code or content</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">5. User Content</h2>
            <p className="text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Ownership:</strong> You retain full ownership of all prayer entries, journal content, and other materials you create within Selah ("User Content"). Your prayers are yours.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong className="text-foreground">Limited License:</strong> By using Selah, you grant us a limited license to store and display your User Content solely to provide the service to you. We do not read, share, or use your prayer content for any other purpose.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">6. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Selah name, logo, application design, and all related materials are owned by Selah and protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works based on our intellectual property without express written permission.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">7. Service Availability</h2>
            <p className="text-muted-foreground leading-relaxed">
              We strive to provide reliable access to Selah, but we do not guarantee that the service will be available at all times. We reserve the right to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
              <li>Modify or discontinue features with or without notice</li>
              <li>Perform maintenance that may temporarily interrupt service</li>
              <li>Suspend or terminate accounts that violate these Terms</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              Selah is provided "as is" without warranties of any kind. To the fullest extent permitted by law, we disclaim all warranties and shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Our total liability for any claims arising from your use of Selah shall not exceed the amount you paid us (if any) in the 12 months preceding the claim.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">9. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              <strong className="text-foreground">By Us:</strong> We may suspend or terminate your access to Selah at any time for violations of these Terms or for any other reason at our discretion.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong className="text-foreground">By You:</strong> You may delete your account at any time through the app settings. Upon deletion, your User Content will be permanently removed within 30 days.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">10. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to conflict of law principles. Any disputes shall be resolved in the courts of competent jurisdiction.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">11. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these Terms from time to time. We will notify users of significant changes by updating the "Last updated" date at the top of this page. Continued use of Selah after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">12. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about these Terms of Service, please contact us at:
            </p>
            <p className="text-muted-foreground mt-4">
              <strong className="text-foreground">Email:</strong>{' '}
              <a
                href="mailto:unreasonablemelons@gmail.com"
                className="text-primary hover:underline"
              >
                unreasonablemelons@gmail.com
              </a>
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
