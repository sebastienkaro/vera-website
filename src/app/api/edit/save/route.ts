import { ContentCommitError, commitFiles, commitsConfigured } from "@/lib/content-commit";
import { HOME_STORE_PATH, parseHomeContent } from "@/lib/content-store";
import { isEditor } from "@/lib/edit-auth";

export async function POST(request: Request) {
  if (!(await isEditor())) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }
  if (!commitsConfigured()) {
    return Response.json(
      { error: "Saving isn't configured — GITHUB_TOKEN and GITHUB_REPO are missing." },
      { status: 501 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  // Validated with the same parser the render path uses, so nothing can be
  // stored that the site would later refuse to read.
  const content = parseHomeContent(body);
  if (!content) {
    return Response.json({ error: "Those changes don't match the expected shape." }, { status: 400 });
  }

  try {
    const sha = await commitFiles(
      [{ path: HOME_STORE_PATH, content: `${JSON.stringify(content, null, 2)}\n` }],
      "Update homepage content from the site editor",
    );
    return Response.json({ ok: true, commit: sha });
  } catch (error) {
    if (error instanceof ContentCommitError) {
      return Response.json({ error: error.message }, { status: 502 });
    }
    throw error;
  }
}
