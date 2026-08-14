"use client";

import { useState } from "react";
import { siteConfig } from "@/lib/site-config";

/** Shared by every input so the fields read as one set. */
const FIELD =
  "mt-2 w-full border border-espresso/20 bg-cream px-3 py-2.5 text-sm text-espresso outline-none transition-colors placeholder:text-espresso/30 focus:border-espresso";

const LABEL = "block text-xs font-medium tracking-wide text-taupe uppercase";

/** What replaces the form once HubSpot has the request. Split around the phone link. */
const SENT = {
  heading: "Thanks — that's with us.",
  before: "We read every request ourselves and usually reply the same day. If it's urgent, text",
  after: "and you'll get us faster.",
};

type Fields = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  equipment: string;
  message: string;
};

const EMPTY: Fields = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
  equipment: "",
  message: "",
};

/**
 * The quote request itself.
 *
 * Deliberately our own markup rather than HubSpot's embedded form: the answers
 * still land in HubSpot through `/api/quote`, but the fields here can carry the
 * site's type and spacing instead of arriving pre-styled in someone else's.
 */
export function QuoteForm({ equipment = "" }: { equipment?: string }) {
  const [fields, setFields] = useState<Fields>({ ...EMPTY, equipment });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  function set(key: keyof Fields) {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFields((current) => ({ ...current, [key]: event.target.value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error ?? "We couldn't send that just now.");
      }
      setSent(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We couldn't send that just now.");
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="border-t border-espresso/15 pt-8">
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-espresso">{SENT.heading}</h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-espresso/60">
          {SENT.before}{" "}
          <a href={`tel:${siteConfig.contact.phone}`} className="text-espresso underline">
            {siteConfig.contact.phone}
          </a>{" "}
          {SENT.after}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="border-t border-espresso/15 pt-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className={LABEL} htmlFor="quote-first-name">
            First name
          </label>
          <input
            id="quote-first-name"
            className={FIELD}
            value={fields.firstName}
            onChange={set("firstName")}
            autoComplete="given-name"
            required
          />
        </div>
        <div>
          <label className={LABEL} htmlFor="quote-last-name">
            Last name
          </label>
          <input
            id="quote-last-name"
            className={FIELD}
            value={fields.lastName}
            onChange={set("lastName")}
            autoComplete="family-name"
          />
        </div>
        <div>
          <label className={LABEL} htmlFor="quote-email">
            Email
          </label>
          <input
            id="quote-email"
            type="email"
            className={FIELD}
            value={fields.email}
            onChange={set("email")}
            autoComplete="email"
            required
          />
        </div>
        <div>
          <label className={LABEL} htmlFor="quote-phone">
            Phone
          </label>
          <input
            id="quote-phone"
            type="tel"
            className={FIELD}
            value={fields.phone}
            onChange={set("phone")}
            autoComplete="tel"
          />
        </div>
        <div className="sm:col-span-2">
          <label className={LABEL} htmlFor="quote-company">
            Café, restaurant or business
          </label>
          <input
            id="quote-company"
            className={FIELD}
            value={fields.company}
            onChange={set("company")}
            autoComplete="organization"
          />
        </div>
        <div className="sm:col-span-2">
          <label className={LABEL} htmlFor="quote-equipment">
            What are you looking at?
          </label>
          <input
            id="quote-equipment"
            className={FIELD}
            value={fields.equipment}
            onChange={set("equipment")}
            placeholder="A machine, a grinder, or a whole setup — whatever you have in mind"
          />
        </div>
        <div className="sm:col-span-2">
          <label className={LABEL} htmlFor="quote-message">
            Anything else we should know?
          </label>
          <textarea
            id="quote-message"
            rows={5}
            className={`${FIELD} resize-y`}
            value={fields.message}
            onChange={set("message")}
            placeholder="Volume, the space it has to fit, when you need it running."
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-6 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-6">
        <button
          type="submit"
          disabled={busy}
          className="bg-espresso px-6 py-3.5 text-xs font-medium tracking-wide text-cream uppercase transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? "Sending…" : "Request a Quote"}
        </button>
        <p className="text-xs text-espresso/50">
          Or text us on{" "}
          <a href={`tel:${siteConfig.contact.phone}`} className="text-espresso/80 underline">
            {siteConfig.contact.phone}
          </a>
          .
        </p>
      </div>
    </form>
  );
}
