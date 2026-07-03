import { siteConfig } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="border-t border-espresso/10 bg-cream">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 py-8 text-sm text-espresso-light sm:flex-row sm:justify-between">
        <p>
          &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
        <a href={`mailto:${siteConfig.contactEmail}`} className="hover:text-espresso">
          {siteConfig.contactEmail}
        </a>
      </div>
    </footer>
  );
}
