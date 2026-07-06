import fs from "fs";
import path from "path";

const CONTENT_ROOT = path.join(process.cwd(), "content");

function readText(relativePath: string): string {
  return fs.readFileSync(path.join(CONTENT_ROOT, relativePath), "utf-8");
}

function fileExists(relativePath: string): boolean {
  return fs.existsSync(path.join(CONTENT_ROOT, relativePath));
}

/** Long-form markdown or JSON blocks (payment info, guide, schedule, etc.) */
export function getSiteContentBlock(key: string): string | null {
  const mdPath = `blocks/${key}.md`;
  const jsonPath = `blocks/${key}.json`;
  if (fileExists(mdPath)) return readText(mdPath).trim();
  if (fileExists(jsonPath)) return readText(jsonPath);
  return null;
}

export type PageContent = {
  title: string;
  subtitle?: string;
  [key: string]: unknown;
};

/** Page titles, subtitles, and section copy — one JSON file per page in content/pages/ */
export function getPageContent(pageId: string): PageContent {
  const jsonPath = `pages/${pageId}.json`;
  if (!fileExists(jsonPath)) {
    return { title: pageId };
  }
  return JSON.parse(readText(jsonPath)) as PageContent;
}

export type RegistrationCopy = {
  page: { title: string; subtitle: string };
  profile: { title: string; subtitle: string; linkedGuestsTitle: string; linkedGuestsSubtitle: string };
  coCreate: { title: string; subtitle: string; coThinkingTitle: string; coThinkingSubtitle: string; operationalTitle: string };
  payments: { title: string; intro: string; privacyNote: string; financialLabel: string; financialHint: string; extraLabel: string; sentCheckbox: string; aug31Checkbox: string };
  logistics: { title: string; subtitle: string; bunkHint: string; beddingDetailsLabel: string; beddingDetailsHint: string };
  complete: { title: string; body: string; editPrompt: string; dashboardButton: string };
  coCreationDomains: { value: string; label: string; icon: string }[];
  datesNotComingHint: string;
};

export function getRegistrationCopy(): RegistrationCopy {
  if (!fileExists("registration.json")) {
    throw new Error("Missing content/registration.json");
  }
  return JSON.parse(readText("registration.json")) as RegistrationCopy;
}

export function getPackingChecklist(): string[] {
  if (!fileExists("packing-checklist.json")) {
    return [];
  }
  return JSON.parse(readText("packing-checklist.json")) as string[];
}

export type ContentFileInfo = {
  key: string;
  relativePath: string;
  kind: "markdown" | "json";
};

/** For admin reference — lists editable content files */
export function listContentFiles(): ContentFileInfo[] {
  const files: ContentFileInfo[] = [];

  for (const dir of ["blocks", "pages"] as const) {
    const fullDir = path.join(CONTENT_ROOT, dir);
    if (!fs.existsSync(fullDir)) continue;
    for (const name of fs.readdirSync(fullDir)) {
      if (name.endsWith(".md")) {
        files.push({ key: name.replace(/\.md$/, ""), relativePath: `${dir}/${name}`, kind: "markdown" });
      } else if (name.endsWith(".json")) {
        files.push({ key: name.replace(/\.json$/, ""), relativePath: `${dir}/${name}`, kind: "json" });
      }
    }
  }

  if (fileExists("registration.json")) {
    files.push({ key: "registration", relativePath: "registration.json", kind: "json" });
  }
  if (fileExists("packing-checklist.json")) {
    files.push({ key: "packing-checklist", relativePath: "packing-checklist.json", kind: "json" });
  }

  return files.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}
