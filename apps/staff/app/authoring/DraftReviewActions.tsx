// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { Banner, Button, type Failure, StatusPill } from "@steward-web/ui";
import { useFetcher } from "react-router";

export interface DraftReviewActionsProps {
  /** Something stops the draft going anywhere: an empty required section, or a collab room
   *  that has gone read-only. */
  blocked: boolean;
  /** The gateway lets this caller publish the draft directly (an author of the policy). */
  canPublish: boolean;
  /** The gateway lets this caller send the draft for review (`viewerCan.submit`). */
  canSubmit: boolean;
  /** The draft's approval run is open. */
  inReview: boolean;
}

/** What the route's action answers for these two intents. */
type Answer = { error: Failure; ok: false } | { ok: true };

const refusalOf = (answer: Answer | undefined): Failure | undefined =>
  answer && !answer.ok ? answer.error : undefined;

/**
 * The editor's way out for a draft (#110): send it for review, which starts the approval run
 * of its group's workflow, or publish it directly, which the gateway still allows an author
 * whether or not a workflow applies. Once the run is open the draft is with its approvers, so
 * neither is offered again until the run ends.
 */
export const DraftReviewActions = ({
  blocked,
  canPublish,
  canSubmit,
  inReview,
}: DraftReviewActionsProps) => {
  const { t } = useTranslation("authoring");
  const submitFetcher = useFetcher<Answer>();
  const publishFetcher = useFetcher<Answer>();

  if (inReview) {
    return (
      <div className="grid justify-items-end gap-1">
        <StatusPill status="in-review" />
        <p className="max-w-sm text-right text-sm text-muted">{t("editor.review.inReview")}</p>
      </div>
    );
  }

  const submitRefusal = refusalOf(submitFetcher.data);
  const publishRefusal = refusalOf(publishFetcher.data);
  const busy = submitFetcher.state !== "idle" || publishFetcher.state !== "idle";

  return (
    <div className="grid justify-items-end gap-2">
      <div className="flex gap-2">
        {canSubmit ? (
          <submitFetcher.Form method="post">
            <input name="intent" type="hidden" value="submit-review" />
            <Button disabled={blocked || busy} type="submit" variant="secondary">
              {submitFetcher.state === "idle"
                ? t("editor.actions.submitForReview")
                : t("editor.actions.submitting")}
            </Button>
          </submitFetcher.Form>
        ) : null}
        {canPublish ? (
          <publishFetcher.Form method="post">
            <input name="intent" type="hidden" value="publish" />
            <Button disabled={blocked || busy} type="submit">
              {publishFetcher.state === "idle"
                ? t("editor.actions.publish")
                : t("editor.actions.publishing")}
            </Button>
          </publishFetcher.Form>
        ) : null}
      </div>
      {submitRefusal ? (
        submitRefusal.code === "FAILED_PRECONDITION" ? (
          <Banner failure={submitRefusal} title={t("editor.review.submitRefused")} tone="danger">
            {t("editor.review.submitRefusedDetail")}
          </Banner>
        ) : (
          <Banner failure={submitRefusal} title={t("editor.review.submitFailed")} tone="danger" />
        )
      ) : null}
      {publishRefusal ? (
        <Banner failure={publishRefusal} title={t("editor.review.publishFailed")} tone="danger" />
      ) : null}
    </div>
  );
};
