"use client";

import { ArrowSquareOut } from "@phosphor-icons/react";
import {
  displayDomain,
  drivePreviewUrl,
  extractDriveFileId,
} from "@/lib/recordings/drive";
import { Card } from "@/components/ui/Card";

type Props = {
  url: string;
};

export function ExternalPlayer({ url }: Props) {
  const driveId = extractDriveFileId(url);

  if (driveId) {
    return (
      <div className="overflow-hidden rounded-lg bg-lavender-50">
        <iframe
          title="Google Drive recording"
          src={drivePreviewUrl(driveId)}
          className="aspect-video w-full border-0"
          allow="autoplay"
        />
        <p className="px-4 py-2 text-body-sm text-ink-600">
          Playing from Google Drive. Timed comments here won&apos;t seek this player.
        </p>
      </div>
    );
  }

  const domain = displayDomain(url);

  return (
    <Card tint="lavender" className="!p-5">
      <p className="text-body-sm text-ink-600">External recording</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex items-center gap-2 text-display-sm text-plum-600 hover:text-plum-700"
      >
        Listen on {domain}
        <ArrowSquareOut size={20} weight="bold" />
      </a>
      <p className="mt-2 text-body-sm text-ink-600">
        Opens in a new tab. Comments below can include a time note for reading along.
      </p>
    </Card>
  );
}
