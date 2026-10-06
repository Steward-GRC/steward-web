// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { useState } from "react";
import { Link, useFetcher } from "react-router";

import { Detail, SensitivityBadge, StatusPill } from "#ui/components/Badges";
import { Button } from "#ui/components/Button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "#ui/components/Display";
import { Field } from "#ui/components/Field";
import { Textarea } from "#ui/components/Input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "#ui/components/Overlays";
import { Banner } from "#ui/feedback/Banner";
import { type Failure } from "#ui/feedback/failure";
import { PageHeader } from "#ui/layout/PageHeader";

import { documentStatusOf, documentTypeBasePath } from "./policy";
import {
  ackBannerState,
  type PolicyDetail,
  redactionState,
  revisionNoticeOf,
} from "./policyReader";
import { PolicyReaderChanges, PolicyReaderHistory } from "./PolicyReaderHistory";
import {
  ContactsPanel,
  DefinitionsPanel,
  ReferencesPanel,
  RelatedPanel,
} from "./PolicyReaderPanels";

interface ActionResult {
  error?: Failure;
  ok?: boolean;
}

/** The acknowledge dialog (D1): confirms, then submits `recordAck` through the route's action. */
const AcknowledgeDialog = ({ currentVersionId }: { currentVersionId: string }) => {
  const { t } = useTranslation(["policy", "common"]);
  const fetcher = useFetcher<ActionResult>();
  const [open, setOpen] = useState(false);
  const busy = fetcher.state !== "idle";

  // Closes the dialog once the acknowledge submission succeeds. Adjusted during render
  // (not in an effect) by tracking the fetcher data this render has already seen, so a
  // successful submission closes the dialog on the very render that learns about it.
  const [seenData, setSeenData] = useState(fetcher.data);
  if (fetcher.data !== seenData) {
    setSeenData(fetcher.data);
    if (fetcher.data?.ok) setOpen(false);
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button variant="primary">{t("reader.ack.acknowledge")}</Button>
      </DialogTrigger>
      <DialogContent
        busy={busy}
        description={t("reader.dialogs.acknowledge.description")}
        title={t("reader.dialogs.acknowledge.title")}
      >
        {fetcher.data?.error ? (
          <Banner
            failure={fetcher.data.error}
            title={t("reader.dialogs.acknowledge.title")}
            tone="danger"
          />
        ) : null}
        <fetcher.Form method="post">
          <input name="intent" type="hidden" value="acknowledge" />
          <input name="policyVersionId" type="hidden" value={currentVersionId} />
          <DialogFooter>
            <DialogClose asChild>
              <Button disabled={busy} type="button" variant="ghost">
                {t("actions.cancel", { ns: "common" })}
              </Button>
            </DialogClose>
            <Button busy={busy} type="submit">
              {t("reader.dialogs.acknowledge.confirm")}
            </Button>
          </DialogFooter>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
};

/** The break-glass dialog (D2): a required reason, then submits `breakGlassReveal` through the route's action. */
const BreakGlassDialog = ({ policyId }: { policyId: string }) => {
  const { t } = useTranslation(["policy", "common"]);
  const fetcher = useFetcher<ActionResult>();
  const [open, setOpen] = useState(false);
  const busy = fetcher.state !== "idle";

  // See the matching comment in AcknowledgeDialog: closes on the render that first sees
  // a successful submission, rather than in a later effect.
  const [seenData, setSeenData] = useState(fetcher.data);
  if (fetcher.data !== seenData) {
    setSeenData(fetcher.data);
    if (fetcher.data?.ok) setOpen(false);
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button variant="secondary">{t("reader.redacted.breakGlass")}</Button>
      </DialogTrigger>
      <DialogContent
        busy={busy}
        description={t("reader.dialogs.breakGlass.description")}
        hasInput
        title={t("reader.dialogs.breakGlass.title")}
      >
        {fetcher.data?.error ? (
          <Banner
            failure={fetcher.data.error}
            title={t("reader.dialogs.breakGlass.title")}
            tone="danger"
          />
        ) : null}
        <fetcher.Form className="grid gap-4" method="post">
          <input name="intent" type="hidden" value="breakGlass" />
          <input name="policyId" type="hidden" value={policyId} />
          <Field label={t("reader.dialogs.breakGlass.reasonLabel")}>
            <Textarea name="reason" required />
          </Field>
          <DialogFooter>
            <DialogClose asChild>
              <Button disabled={busy} type="button" variant="ghost">
                {t("actions.cancel", { ns: "common" })}
              </Button>
            </DialogClose>
            <Button busy={busy} type="submit" variant="danger">
              {t("reader.dialogs.breakGlass.confirm")}
            </Button>
          </DialogFooter>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
};

const NOTICE_TONE = {
  inReview: "info",
  rejected: "danger",
  superseded: "warn",
  withdrawn: "warn",
} as const;

export interface PolicyReaderProps {
  detail: PolicyDetail;
}

/**
 * The policy/procedure reader (U7-U10, U12-U19, D1, D2): the metadata card, the
 * acknowledgement banner, the sensitive-content gate, the body with its appendices, the
 * definitions/related/references/contacts panels, the changes panel and the history &
 * approvals accordion. Editing (U11 and the authoring screens) is a separate area — this
 * reader is read-only throughout.
 */
export const PolicyReader = ({ detail }: PolicyReaderProps) => {
  const { t } = useTranslation("policy");
  const ackState = ackBannerState(detail.ack);
  const redaction = redactionState(detail);
  const notice = revisionNoticeOf(detail.status);

  return (
    <div className="grid gap-6 p-6">
      <Link
        className="text-sm text-muted hover:text-ink hover:underline"
        to={documentTypeBasePath(detail.documentType)}
      >
        {t("reader.back")}
      </Link>

      <PageHeader
        actions={
          <>
            <StatusPill status={documentStatusOf(detail.status)} />
            <SensitivityBadge sensitive={detail.sensitivity === "SENSITIVE"} />
          </>
        }
        eyebrow={`${detail.category} · ${detail.subcategory}`}
        subtitle={`${detail.number} · ${detail.version}`}
        title={detail.title}
      />

      <Card>
        <CardBody className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Detail
            label={t("reader.metadata.status")}
            value={<StatusPill status={documentStatusOf(detail.status)} />}
          />
          <Detail
            label={t("reader.metadata.sensitivity")}
            value={t(`sensitivity.${detail.sensitivity.toLowerCase()}`)}
          />
          <Detail label={t("reader.metadata.owner")} value={detail.ownerName ?? "—"} />
          <Detail label={t("reader.metadata.version")} value={detail.version} />
          <Detail label={t("reader.metadata.published")} value={detail.published ?? "—"} />
          <Detail label={t("reader.metadata.updated")} value={detail.updated ?? "—"} />
        </CardBody>
      </Card>

      {notice ? <Banner title={t(`reader.notices.${notice}`)} tone={NOTICE_TONE[notice]} /> : null}

      {ackState === "pending" && detail.currentVersionId ? (
        <Banner
          actions={<AcknowledgeDialog currentVersionId={detail.currentVersionId} />}
          title={t("reader.ack.pendingTitle")}
          tone="warn"
        >
          {t("reader.ack.pendingBody")}
        </Banner>
      ) : null}
      {ackState === "done" ? (
        <Banner title={t("reader.ack.doneTitle")} tone="ok">
          {t("reader.ack.doneBody", { date: detail.ack?.ackedAt })}
        </Banner>
      ) : null}

      {redaction === "visible" ? (
        <Tabs defaultValue="view">
          <TabsList>
            <TabsTrigger value="view">{t("reader.tabs.view")}</TabsTrigger>
            <TabsTrigger value="definitions">{t("reader.tabs.definitions")}</TabsTrigger>
            <TabsTrigger value="related">{t("reader.tabs.related")}</TabsTrigger>
            <TabsTrigger value="references">{t("reader.tabs.references")}</TabsTrigger>
            <TabsTrigger value="contacts">{t("reader.tabs.contacts")}</TabsTrigger>
            <TabsTrigger value="changes">{t("reader.tabs.changes")}</TabsTrigger>
          </TabsList>
          <TabsContent value="view">
            <div className="grid gap-4">
              <p className="whitespace-pre-wrap text-base text-ink">{detail.bodyText}</p>
              {detail.appendices.length > 0 ? (
                <Accordion type="single">
                  {detail.appendices.map((appendix) => (
                    <AccordionItem key={appendix.id} value={appendix.id}>
                      <AccordionTrigger>
                        {t("reader.appendices.title")} {appendix.letter}: {appendix.title}
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="whitespace-pre-wrap text-base text-ink">{appendix.text}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : null}
            </div>
          </TabsContent>
          <TabsContent value="definitions">
            <DefinitionsPanel definitions={detail.definitions} />
          </TabsContent>
          <TabsContent value="related">
            <RelatedPanel related={detail.related} />
          </TabsContent>
          <TabsContent value="references">
            <ReferencesPanel references={detail.references} />
          </TabsContent>
          <TabsContent value="contacts">
            <ContactsPanel contacts={detail.contacts} />
          </TabsContent>
          <TabsContent value="changes">
            <PolicyReaderChanges priorVersion={detail.priorVersion} />
          </TabsContent>
        </Tabs>
      ) : (
        <Banner
          actions={
            redaction === "redacted-reveal" ? <BreakGlassDialog policyId={detail.id} /> : null
          }
          title={t("reader.redacted.title")}
          tone="warn"
        >
          {t("reader.redacted.body")}
          {redaction === "redacted-no-permission" ? ` ${t("reader.redacted.noPermission")}` : ""}
        </Banner>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("reader.history.title")}</CardTitle>
        </CardHeader>
        <CardBody>
          <PolicyReaderHistory history={detail.history} />
        </CardBody>
      </Card>
    </div>
  );
};
