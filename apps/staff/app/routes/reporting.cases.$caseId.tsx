// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import {
  BreachDecision,
  CaseOutcome,
  CaseStatus,
  InformationKind,
  NoticeRecipient,
  NoticeStatus,
  RiskMitigation,
  RiskRecipient,
  RiskViewed,
} from "@steward-web/api-client";
import { useIdentity } from "@steward-web/auth";
import { useTranslation } from "@steward-web/i18n";
import { refusalOf, useRefusalMessage } from "@steward-web/shell";
import {
  Badge,
  Banner,
  Button,
  Card,
  CardBody,
  Checkbox,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
  Field,
  Input,
  PageHeader,
  Select,
  Table,
  TD,
  Textarea,
  TH,
  THead,
} from "@steward-web/ui";
import { data, Link, useFetcher } from "react-router";

import type { Route } from "./+types/reporting.cases.$caseId";

import { OPEN_SETTABLE_STATUSES, statusLabelKey, statusTone } from "../reporting/caseStatus";
import {
  addCaseNote,
  addCaseNotice,
  assignCase,
  closeReportCase,
  getReportCase,
  postCaseMessage,
  recordRiskAssessment,
  setCaseDiscoveryDate,
  setCaseStatus,
  updateCaseNotice,
} from "../reporting/reporting.server";

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  try {
    const reportCase = await getReportCase(request, params.caseId);
    return { reportCase };
  } catch {
    throw new Response("Not Found", { status: 404 });
  }
};

export const action = async ({ params, request }: Route.ActionArgs) => {
  const caseId = params.caseId;
  const form = await request.formData();
  const intent = form.get("intent");

  try {
    switch (intent) {
      case "add-note": {
        await addCaseNote(request, caseId, String(form.get("body") ?? ""));
        return data({ intent, ok: true } as const);
      }
      case "add-notice": {
        await addCaseNotice(
          request,
          caseId,
          String(form.get("recipient") ?? "") as NoticeRecipient,
          String(form.get("label") ?? "") || undefined,
          String(form.get("method") ?? "") || undefined,
        );
        return data({ intent, ok: true } as const);
      }
      case "assign": {
        const assigneeUserId = String(form.get("assigneeUserId") ?? "") || null;
        await assignCase(request, caseId, assigneeUserId);
        return data({ intent, ok: true } as const);
      }
      case "close-case": {
        const correctiveAction = String(form.get("correctiveAction") ?? "").trim();
        await closeReportCase(
          request,
          caseId,
          String(form.get("outcome") ?? "") as CaseOutcome,
          correctiveAction ? [{ description: correctiveAction, policyId: null }] : [],
          String(form.get("closingMessage") ?? "") || undefined,
        );
        return data({ intent, ok: true } as const);
      }
      case "post-message": {
        await postCaseMessage(request, caseId, String(form.get("body") ?? ""));
        return data({ intent, ok: true } as const);
      }
      case "record-risk-assessment": {
        await recordRiskAssessment(
          request,
          caseId,
          {
            information: form.getAll("information").map(String) as InformationKind[],
            mitigation: String(form.get("mitigation") ?? "") as RiskMitigation,
            recipient: String(form.get("recipient") ?? "") as RiskRecipient,
            viewed: String(form.get("viewed") ?? "") as RiskViewed,
          },
          String(form.get("decision") ?? "") as BreachDecision,
          String(form.get("reason") ?? ""),
        );
        return data({ intent, ok: true } as const);
      }
      case "set-discovery-date": {
        await setCaseDiscoveryDate(request, caseId, String(form.get("discoveredOn") ?? ""));
        return data({ intent, ok: true } as const);
      }
      case "set-status": {
        await setCaseStatus(request, caseId, String(form.get("status") ?? "") as never);
        return data({ intent, ok: true } as const);
      }
      case "update-notice": {
        await updateCaseNotice(
          request,
          caseId,
          String(form.get("noticeId") ?? ""),
          String(form.get("status") ?? "") as NoticeStatus,
          String(form.get("sentOn") ?? "") || undefined,
        );
        return data({ intent, ok: true } as const);
      }
      default: {
        throw new Response("Bad Request", { status: 400 });
      }
    }
  } catch (error) {
    return data({ error: refusalOf(error), intent, ok: false } as const, { status: 400 });
  }
};

export default function ReportingCaseDetailRoute({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation("reporting");
  const identity = useIdentity();
  const { reportCase } = loaderData;

  const messageFetcher = useFetcher<typeof action>();
  const noteFetcher = useFetcher<typeof action>();
  const assignFetcher = useFetcher<typeof action>();
  const statusFetcher = useFetcher<typeof action>();
  const discoveryFetcher = useFetcher<typeof action>();
  const riskFetcher = useFetcher<typeof action>();
  const noticeFetcher = useFetcher<typeof action>();
  const noticeUpdateFetcher = useFetcher<typeof action>();
  const closeFetcher = useFetcher<typeof action>();

  const riskFailure = riskFetcher.data && !riskFetcher.data.ok ? riskFetcher.data.error : null;
  const riskRefusal = useRefusalMessage(riskFailure ?? {});
  const closeFailure = closeFetcher.data && !closeFetcher.data.ok ? closeFetcher.data.error : null;
  const closeRefusal = useRefusalMessage(closeFailure ?? {});

  const isOfficer = reportCase.assigneeUserId === identity.id;
  const isClosed = reportCase.status === CaseStatus.Closed;

  return (
    <div className="grid gap-6 p-6">
      <PageHeader
        actions={
          <>
            <Badge tone={statusTone(reportCase.status)}>
              {t(`status.${statusLabelKey(reportCase.status)}`)}
            </Badge>
            <Link className="text-sm text-primary hover:underline" to="/reporting/cases">
              {t("detail.back")}
            </Link>
          </>
        }
        eyebrow={reportCase.caseCode}
        subtitle={t(`kind.${reportCase.kind.toLowerCase()}`)}
        title={t("detail.details.title")}
      />

      <Card>
        <CardBody className="grid gap-3">
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase text-muted">
                {t("detail.details.whatHappened")}
              </dt>
              <dd className="text-sm text-ink">{reportCase.details.whatHappened}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-muted">
                {t("detail.details.occurred")}
              </dt>
              <dd className="text-sm text-ink">{reportCase.details.occurred}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-muted">
                {t("detail.details.location")}
              </dt>
              <dd className="text-sm text-ink">{reportCase.details.location}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-muted">
                {t("detail.details.informationKinds")}
              </dt>
              <dd className="flex flex-wrap gap-1">
                {reportCase.details.informationKinds.map((kind) => (
                  <Badge key={kind} tone="neutral">
                    {t(`informationKind.${kind.toLowerCase()}`)}
                  </Badge>
                ))}
              </dd>
            </div>
            {reportCase.details.stillHappening ? (
              <div>
                <dt className="text-xs font-semibold uppercase text-muted">
                  {t("detail.details.stillHappening")}
                </dt>
                <dd className="text-sm text-ink">
                  {t(`reportAnswer.${reportCase.details.stillHappening.toLowerCase()}`)}
                </dd>
              </div>
            ) : null}
          </dl>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="grid gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            {t("detail.assignment.title")}
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-ink">
              {reportCase.assigneeUserId
                ? isOfficer
                  ? identity.name
                  : reportCase.assigneeUserId
                : t("queue.unassigned")}
            </span>
            <assignFetcher.Form method="post">
              <input name="intent" type="hidden" value="assign" />
              {isOfficer ? (
                <Button name="assigneeUserId" size="sm" type="submit" value="" variant="secondary">
                  {t("detail.assignment.unassign")}
                </Button>
              ) : (
                <Button name="assigneeUserId" size="sm" type="submit" value={identity.id}>
                  {t("detail.assignment.assignToMe")}
                </Button>
              )}
            </assignFetcher.Form>
          </div>

          {isClosed ? null : (
            <statusFetcher.Form className="flex items-end gap-2" method="post">
              <input name="intent" type="hidden" value="set-status" />
              <Field label={t("detail.assignment.status")}>
                <Select
                  defaultValue={reportCase.status}
                  name="status"
                  options={OPEN_SETTABLE_STATUSES.map((s) => ({
                    label: t(`status.${statusLabelKey(s)}`),
                    value: s,
                  }))}
                />
              </Field>
              <Button disabled={statusFetcher.state !== "idle"} size="sm" type="submit">
                {t("detail.assignment.setStatus")}
              </Button>
            </statusFetcher.Form>
          )}
        </CardBody>
      </Card>

      {isClosed ? null : (
        <Card>
          <CardBody className="grid gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              {t("detail.discovery.title")}
            </h2>
            <p className="text-sm text-muted">{t("detail.discovery.hint")}</p>
            <discoveryFetcher.Form className="flex items-end gap-2" method="post">
              <input name="intent" type="hidden" value="set-discovery-date" />
              <Field label={t("detail.discovery.title")}>
                <Input
                  defaultValue={reportCase.discoveredOn ?? ""}
                  name="discoveredOn"
                  required
                  type="date"
                />
              </Field>
              <Button disabled={discoveryFetcher.state !== "idle"} size="sm" type="submit">
                {t("detail.discovery.set")}
              </Button>
            </discoveryFetcher.Form>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardBody className="grid gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            {t("detail.thread.title")}
          </h2>
          {reportCase.thread.length === 0 ? (
            <p className="text-sm text-muted">{t("detail.thread.empty")}</p>
          ) : (
            <ul className="grid gap-2">
              {reportCase.thread.map((message) => (
                <li className="rounded-md border border-border p-3 text-sm" key={message.id}>
                  <p className="text-xs font-semibold uppercase text-muted">{message.author}</p>
                  <p className="text-ink">{message.body}</p>
                </li>
              ))}
            </ul>
          )}
          {isClosed ? null : (
            <messageFetcher.Form className="grid gap-2" method="post">
              <input name="intent" type="hidden" value="post-message" />
              <Textarea
                name="body"
                placeholder={t("detail.thread.placeholder")}
                required
                rows={2}
              />
              <Button
                className="self-start"
                disabled={messageFetcher.state !== "idle"}
                size="sm"
                type="submit"
              >
                {t("detail.thread.post")}
              </Button>
            </messageFetcher.Form>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="grid gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            {t("detail.notes.title")}
          </h2>
          <p className="text-sm text-muted">{t("detail.notes.hint")}</p>
          {reportCase.notes.length === 0 ? (
            <p className="text-sm text-muted">{t("detail.notes.empty")}</p>
          ) : (
            <ul className="grid gap-2">
              {reportCase.notes.map((note) => (
                <li className="rounded-md border border-border p-3 text-sm text-ink" key={note.id}>
                  {note.body}
                </li>
              ))}
            </ul>
          )}
          {isClosed ? null : (
            <noteFetcher.Form className="grid gap-2" method="post">
              <input name="intent" type="hidden" value="add-note" />
              <Textarea name="body" placeholder={t("detail.notes.placeholder")} required rows={2} />
              <Button
                className="self-start"
                disabled={noteFetcher.state !== "idle"}
                size="sm"
                type="submit"
              >
                {t("detail.notes.add")}
              </Button>
            </noteFetcher.Form>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="grid gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            {t("detail.risk.title")}
          </h2>
          <p className="text-sm text-muted">{t("detail.risk.hint")}</p>

          {reportCase.assessment ? (
            <dl className="grid gap-2 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase text-muted">
                  {t("detail.risk.suggestion")}
                </dt>
                <dd className="text-ink">
                  {reportCase.assessment.suggestion
                    ? t(`riskSuggestion.${reportCase.assessment.suggestion.toLowerCase()}`)
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-muted">
                  {t("detail.risk.decision")}
                </dt>
                <dd className="text-ink">
                  {reportCase.assessment.decision
                    ? t(`breachDecision.${reportCase.assessment.decision.toLowerCase()}`)
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-muted">
                  {t("detail.risk.reason")}
                </dt>
                <dd className="text-ink">{reportCase.assessment.reason}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-muted">{t("detail.risk.none")}</p>
          )}

          {isClosed ? null : (
            <riskFetcher.Form className="grid gap-3 border-t border-border pt-4" method="post">
              <input name="intent" type="hidden" value="record-risk-assessment" />
              {riskFailure ? <Banner title={riskRefusal} tone="danger" /> : null}
              <Field label={t("detail.risk.information")}>
                <div className="flex flex-wrap gap-3">
                  {Object.values(InformationKind).map((kind) => (
                    <label className="flex items-center gap-2 text-sm" key={kind}>
                      <Checkbox
                        defaultChecked={reportCase.details.informationKinds.includes(kind)}
                        name="information"
                        value={kind}
                      />
                      {t(`informationKind.${kind.toLowerCase()}`)}
                    </label>
                  ))}
                </div>
              </Field>
              <Field label={t("detail.risk.recipient")}>
                <Select
                  name="recipient"
                  options={Object.values(RiskRecipient).map((v) => ({
                    label: t(`riskRecipient.${v.toLowerCase()}`),
                    value: v,
                  }))}
                  required
                />
              </Field>
              <Field label={t("detail.risk.viewed")}>
                <Select
                  name="viewed"
                  options={Object.values(RiskViewed).map((v) => ({
                    label: t(`riskViewed.${v.toLowerCase()}`),
                    value: v,
                  }))}
                  required
                />
              </Field>
              <Field label={t("detail.risk.mitigation")}>
                <Select
                  name="mitigation"
                  options={Object.values(RiskMitigation).map((v) => ({
                    label: t(`riskMitigation.${v.toLowerCase()}`),
                    value: v,
                  }))}
                  required
                />
              </Field>
              <Field label={t("detail.risk.decision")}>
                <Select
                  name="decision"
                  options={Object.values(BreachDecision).map((v) => ({
                    label: t(`breachDecision.${v.toLowerCase()}`),
                    value: v,
                  }))}
                  required
                />
              </Field>
              <Field label={t("detail.risk.reason")}>
                <Textarea name="reason" required rows={2} />
              </Field>
              <Button className="self-start" disabled={riskFetcher.state !== "idle"} type="submit">
                {t("detail.risk.record")}
              </Button>
            </riskFetcher.Form>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="grid gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            {t("detail.notices.title")}
          </h2>
          {reportCase.notices.length === 0 ? (
            <p className="text-sm text-muted">{t("detail.notices.empty")}</p>
          ) : (
            <Table>
              <THead>
                <tr>
                  <TH>{t("detail.notices.table.recipient")}</TH>
                  <TH>{t("detail.notices.table.label")}</TH>
                  <TH>{t("detail.notices.table.method")}</TH>
                  <TH>{t("detail.notices.table.due")}</TH>
                  <TH>{t("detail.notices.table.status")}</TH>
                </tr>
              </THead>
              <tbody>
                {reportCase.notices.map((notice) => (
                  <tr key={notice.id}>
                    <TD>{t(`noticeRecipient.${notice.recipient.toLowerCase()}`)}</TD>
                    <TD>{notice.label}</TD>
                    <TD>{notice.method}</TD>
                    <TD className="text-sm text-muted">{notice.dueOn}</TD>
                    <TD>
                      {isClosed ? (
                        <Badge tone="neutral">
                          {t(`noticeStatus.${notice.status.toLowerCase()}`)}
                        </Badge>
                      ) : (
                        <noticeUpdateFetcher.Form className="flex items-center gap-2" method="post">
                          <input name="intent" type="hidden" value="update-notice" />
                          <input name="noticeId" type="hidden" value={notice.id} />
                          <Select
                            aria-label={t("detail.notices.update.status")}
                            defaultValue={notice.status}
                            name="status"
                            options={Object.values(NoticeStatus).map((v) => ({
                              label: t(`noticeStatus.${v.toLowerCase()}`),
                              value: v,
                            }))}
                          />
                          <Input
                            aria-label={t("detail.notices.update.sentOn")}
                            defaultValue={notice.sentOn ?? ""}
                            name="sentOn"
                            type="date"
                          />
                          <Button
                            disabled={noticeUpdateFetcher.state !== "idle"}
                            size="sm"
                            type="submit"
                          >
                            {t("detail.notices.update.submit")}
                          </Button>
                        </noticeUpdateFetcher.Form>
                      )}
                    </TD>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          {isClosed ? null : (
            <noticeFetcher.Form
              className="grid gap-3 border-t border-border pt-4 sm:grid-cols-4"
              method="post"
            >
              <input name="intent" type="hidden" value="add-notice" />
              <Field label={t("detail.notices.add.recipient")}>
                <Select
                  name="recipient"
                  options={Object.values(NoticeRecipient).map((v) => ({
                    label: t(`noticeRecipient.${v.toLowerCase()}`),
                    value: v,
                  }))}
                  required
                />
              </Field>
              <Field
                label={t("detail.notices.add.label")}
                optional={t("detail.notices.add.labelOptional")}
              >
                <Input name="label" />
              </Field>
              <Field
                label={t("detail.notices.add.method")}
                optional={t("detail.notices.add.methodOptional")}
              >
                <Input name="method" />
              </Field>
              <Button className="self-end" disabled={noticeFetcher.state !== "idle"} type="submit">
                {t("detail.notices.add.submit")}
              </Button>
            </noticeFetcher.Form>
          )}
        </CardBody>
      </Card>

      {isClosed ? null : (
        <Card>
          <CardBody className="grid gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-danger">
              {t("detail.close.title")}
            </h2>
            <p className="text-sm text-muted">{t("detail.close.hint")}</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="self-start" variant="danger">
                  {t("detail.close.submit")}
                </Button>
              </DialogTrigger>
              <DialogContent
                description={t("detail.close.confirmDescription")}
                title={t("detail.close.confirmTitle")}
              >
                <closeFetcher.Form className="grid gap-3" method="post">
                  <input name="intent" type="hidden" value="close-case" />
                  {closeFailure ? <Banner title={closeRefusal} tone="danger" /> : null}
                  <Field label={t("detail.close.outcome")}>
                    <Select
                      name="outcome"
                      options={Object.values(CaseOutcome).map((v) => ({
                        label: t(`outcome.${v.toLowerCase()}`),
                        value: v,
                      }))}
                      required
                    />
                  </Field>
                  <Field
                    label={t("detail.close.correctiveAction")}
                    optional={t("detail.close.correctiveActionHint")}
                  >
                    <Input name="correctiveAction" />
                  </Field>
                  <Field label={t("detail.close.message")} optional={t("detail.close.messageHint")}>
                    <Textarea name="closingMessage" rows={2} />
                  </Field>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="secondary">{t("detail.close.cancel")}</Button>
                    </DialogClose>
                    <Button disabled={closeFetcher.state !== "idle"} type="submit" variant="danger">
                      {t("detail.close.confirmSubmit")}
                    </Button>
                  </DialogFooter>
                </closeFetcher.Form>
              </DialogContent>
            </Dialog>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
