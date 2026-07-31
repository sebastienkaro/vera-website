import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Access control for `?edit`. One shared password, held in `EDIT_PASSWORD`,
 * exchanged for a signed session cookie.
 *
 * This is deliberately the simplest thing that works for a single client
 * editing their own site — there are no accounts, no roles, and no audit of
 * who changed what beyond the commit trail. If more than one person ever needs
 * their own login, this is the piece to replace.
 *
 * With `EDIT_PASSWORD` unset, editing is off entirely: no password can be
 * right, so a deploy that forgets the variable is locked rather than open.
 */
const COOKIE_NAME = "vera_edit";
const SESSION_LABEL = "vera-editor-v1";
const SESSION_MAX_AGE = 60 * 60 * 8;

export function editingEnabled(): boolean {
  return Boolean(process.env.EDIT_PASSWORD);
}

/** Whether the current request carries a valid editor session. */
export async function isEditor(): Promise<boolean> {
  const expected = sessionToken();
  if (!expected) return false;

  const cookieStore = await cookies();
  return matches(cookieStore.get(COOKIE_NAME)?.value, expected);
}

/** Checks a submitted password and, if it's right, starts a session. */
export async function signIn(password: unknown): Promise<boolean> {
  const secret = process.env.EDIT_PASSWORD;
  const token = sessionToken();
  if (!secret || !token || typeof password !== "string") return false;
  if (!matches(password, secret)) return false;

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return true;
}

export async function signOut(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * The cookie value for a valid session: the password itself never travels back
 * to the browser, only this derivation of it. Changing `EDIT_PASSWORD`
 * therefore invalidates every existing session.
 */
function sessionToken(): string | null {
  const secret = process.env.EDIT_PASSWORD;
  if (!secret) return null;
  return createHmac("sha256", secret).update(SESSION_LABEL).digest("hex");
}

/** Constant-time compare, so a wrong guess leaks nothing through timing. */
function matches(candidate: string | undefined, expected: string): boolean {
  if (!candidate) return false;

  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
