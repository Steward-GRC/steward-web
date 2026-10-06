// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { EmptyState, PageHeader } from "@steward-web/ui";

/**
 * A registry of every magic link issued across the org isn't buildable yet: the gateway's
 * `createMagicLink`/`revokeMagicLink` mutations mint and revoke one link for a policy
 * version at a time, and there is no query that lists the links already issued. Until a
 * listing read exists, this page says so plainly rather than inventing data to show.
 */
export default function MagicLinks() {
  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <PageHeader
        eyebrow="Policies"
        subtitle="Every read-only share link issued across the org."
        title="Magic links"
      />
      <EmptyState
        description="There's no org-wide list of issued links yet. A magic link is created and revoked from the policy it shares; this registry page will list them once a listing read is added to the gateway."
        title="Not available yet"
      />
    </div>
  );
}
