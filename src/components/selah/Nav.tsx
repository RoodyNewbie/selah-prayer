import { Link } from "react-router-dom";
import { Lantern } from "./Lantern";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GlobalAudioButton } from "@/components/GlobalAudioButton";

export const Nav = () => {
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-6xl px-6 pt-5">
        <div className="flex items-center justify-between rounded-full border hairline bg-card-soft/70 backdrop-blur-xl px-4 py-2.5 shadow-soft">
          <a href="#top" className="flex items-center gap-2.5 group">
            <span className="lantern-glow inline-flex">
              <Lantern className="h-7 w-7" />
            </span>
            <span className="font-serif text-lg tracking-tight text-parchment">Selah</span>
          </a>
          <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-parchment transition-colors">Features</a>
            <a href="#frameworks" className="hover:text-parchment transition-colors">Frameworks</a>
            <a href="#how-it-works" className="hover:text-parchment transition-colors">How it works</a>
            <a href="#preview" className="hover:text-parchment transition-colors">Inside Selah</a>
          </nav>
          <div className="flex items-center gap-2">
            <GlobalAudioButton />
            <ThemeToggle />
            <Link
              to="/auth"
              className="hidden sm:inline-flex text-sm text-muted-foreground hover:text-parchment px-3 py-1.5 rounded-full transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/auth"
              className="inline-flex items-center text-sm font-medium bg-gold text-primary-foreground px-4 py-1.5 rounded-full hover:brightness-110 transition-all shadow-glow/40"
            >
              Enter Selah
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
