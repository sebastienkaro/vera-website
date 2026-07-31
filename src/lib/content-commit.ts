/**
 * Writing edits back to the repository.
 *
 * Vercel's filesystem is read-only at runtime, so a save can't just write a
 * file — it commits one through the GitHub API instead. The push triggers a
 * redeploy, which is why an edit takes about a minute to appear. In exchange,
 * every save is a commit: full history, and rollback is `git revert`.
 */
const API = "https://api.github.com";

type CommitFile = {
  /** Repo-relative, e.g. `content/home.json`. */
  path: string;
  /** Raw bytes; text is encoded as UTF-8. */
  content: Buffer | string;
};

export class ContentCommitError extends Error {}

function config() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  if (!token || !repo) {
    throw new ContentCommitError(
      "Saving needs GITHUB_TOKEN and GITHUB_REPO (owner/name) set in the environment.",
    );
  }
  return { token, repo, branch: process.env.GITHUB_BRANCH || "main" };
}

export function commitsConfigured(): boolean {
  return Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_REPO);
}

async function gh(url: string, token: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(url, {
    ...init,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  return response;
}

/**
 * Commits one or more files in a single commit, on top of whatever the branch
 * currently points at. Uses the git data API rather than the contents API so
 * that a content change and its uploaded image land together — a half-applied
 * save that references an image that didn't upload would render a placeholder.
 */
export async function commitFiles(files: CommitFile[], message: string): Promise<string> {
  if (files.length === 0) throw new ContentCommitError("Nothing to commit.");
  const { token, repo, branch } = config();

  const refUrl = `${API}/repos/${repo}/git/ref/heads/${branch}`;
  const refResponse = await gh(refUrl, token);
  if (!refResponse.ok) {
    throw new ContentCommitError(await describe(refResponse, `read branch ${branch}`));
  }
  const headSha: string = (await refResponse.json()).object.sha;

  const commitResponse = await gh(`${API}/repos/${repo}/git/commits/${headSha}`, token);
  if (!commitResponse.ok) {
    throw new ContentCommitError(await describe(commitResponse, "read the current commit"));
  }
  const baseTree: string = (await commitResponse.json()).tree.sha;

  // Every file becomes a blob first; the tree then references them by sha.
  const tree = await Promise.all(
    files.map(async (file) => {
      const body = Buffer.isBuffer(file.content) ? file.content : Buffer.from(file.content, "utf8");
      const blobResponse = await gh(`${API}/repos/${repo}/git/blobs`, token, {
        method: "POST",
        body: JSON.stringify({ content: body.toString("base64"), encoding: "base64" }),
      });
      if (!blobResponse.ok) {
        throw new ContentCommitError(await describe(blobResponse, `upload ${file.path}`));
      }
      return {
        path: file.path,
        mode: "100644" as const,
        type: "blob" as const,
        sha: (await blobResponse.json()).sha as string,
      };
    }),
  );

  const treeResponse = await gh(`${API}/repos/${repo}/git/trees`, token, {
    method: "POST",
    body: JSON.stringify({ base_tree: baseTree, tree }),
  });
  if (!treeResponse.ok) {
    throw new ContentCommitError(await describe(treeResponse, "build the tree"));
  }

  const newCommitResponse = await gh(`${API}/repos/${repo}/git/commits`, token, {
    method: "POST",
    body: JSON.stringify({
      message,
      tree: (await treeResponse.json()).sha,
      parents: [headSha],
    }),
  });
  if (!newCommitResponse.ok) {
    throw new ContentCommitError(await describe(newCommitResponse, "create the commit"));
  }
  const newSha: string = (await newCommitResponse.json()).sha;

  // Not forced: if someone pushed between reading the head and writing, this
  // fails rather than dropping their commit, and the editor can retry.
  const updateResponse = await gh(`${API}/repos/${repo}/git/refs/heads/${branch}`, token, {
    method: "PATCH",
    body: JSON.stringify({ sha: newSha, force: false }),
  });
  if (!updateResponse.ok) {
    throw new ContentCommitError(
      await describe(updateResponse, `move ${branch} — someone may have pushed since; try again`),
    );
  }

  return newSha;
}

async function describe(response: Response, action: string): Promise<string> {
  let detail = "";
  try {
    detail = ((await response.json())?.message as string) ?? "";
  } catch {
    // Non-JSON error bodies are rare here and add nothing useful.
  }
  return `Couldn't ${action} (${response.status}${detail ? `: ${detail}` : ""}).`;
}
