import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { listContentFiles } from "@/lib/content";

export function ContentFilesGuide() {
  const files = listContentFiles();

  return (
    <div className="space-y-4">
      <Card tint="lavender">
        <h2 className="text-display-sm">Edit copy in your project folder</h2>
        <p className="mt-2 text-body-md text-ink-600">
          All site copy lives in the <code className="text-body-sm">content/</code> folder at
          the project root. Edit a file, save, commit, and push — Vercel redeploys automatically.
        </p>
        <p className="mt-2 text-body-sm text-ink-600">
          See <code className="text-body-sm">content/README.md</code> for a full guide.
        </p>
      </Card>

      <ul className="space-y-2">
        {files.map((file) => (
          <li key={file.relativePath}>
            <Card tint="white" className="py-3">
              <p className="font-mono text-body-sm text-plum-700">
                content/{file.relativePath}
              </p>
              <p className="mt-1 text-body-sm text-ink-600">
                {file.kind === "markdown" ? "Markdown content block" : "JSON page copy or data"}
              </p>
            </Card>
          </li>
        ))}
      </ul>

      <Link
        href="/admin"
        className="inline-block text-body-sm font-semibold text-plum-500 hover:underline"
      >
        ← Back to admin
      </Link>
    </div>
  );
}
