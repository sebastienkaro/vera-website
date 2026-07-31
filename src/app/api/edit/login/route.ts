import { editingEnabled, signIn, signOut } from "@/lib/edit-auth";

export async function POST(request: Request) {
  if (!editingEnabled()) {
    return Response.json({ error: "Editing is not enabled on this site." }, { status: 404 });
  }

  let password: unknown;
  try {
    password = (await request.json())?.password;
  } catch {
    return Response.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  if (!(await signIn(password))) {
    return Response.json({ error: "That password isn't right." }, { status: 401 });
  }

  return Response.json({ ok: true });
}

export async function DELETE() {
  await signOut();
  return Response.json({ ok: true });
}
