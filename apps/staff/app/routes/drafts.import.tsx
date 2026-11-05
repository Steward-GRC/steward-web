// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Import from CSV (Authoring U21): choose a CSV, see each row ready or with its issues, then
// import the ready rows as policy drafts. The gateway has no bulk import yet
// (steward-gateway#75), so the server checks the rows again and creates them one
// `createPolicy` at a time, answering each row's result.
import { PERMISSIONS } from "@steward-web/auth";
import { requirePermissionFromRequest } from "@steward-web/auth/server";
import { useTranslation } from "@steward-web/i18n";
import { cn } from "@steward-web/ui";
import { Check, Download, X } from "lucide-react";
import { useId, useState } from "react";
import { data, Link, useFetcher } from "react-router";

import type { Route } from "./+types/drafts.import";

import {
  createPolicy,
  listAuthorableGroups,
  listAuthorableTemplates,
} from "../authoring/authoring.server";
import { categoryChoices } from "../authoring/categoryChoices";
import {
  type CheckedRow,
  checkRows,
  CSV_TEMPLATE,
  type ImportRow,
  readImportFile,
  type RowIssue,
} from "../authoring/csvImport";

const authoringChoices = async (request: Request) => {
  const [groups, templates] = await Promise.all([
    listAuthorableGroups(request),
    listAuthorableTemplates(request),
  ]);
  return {
    categories: categoryChoices(groups),
    templates: templates
      .filter((template) => !template.retiredAt)
      .map((template) => ({ id: template.id, name: template.name })),
  };
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requirePermissionFromRequest(request, PERMISSIONS.PolicyAuthor);
  return authoringChoices(request);
};

export interface RowResult {
  line: number;
  ok: boolean;
  policyId?: string;
}

export const action = async ({ request }: Route.ActionArgs) => {
  await requirePermissionFromRequest(request, PERMISSIONS.PolicyAuthor);
  const form = await request.formData();
  const rows = JSON.parse(String(form.get("rowsJson") ?? "[]")) as ImportRow[];
  // Checked again here: the browser's check is a preview, and access may have changed since.
  const { categories, templates } = await authoringChoices(request);
  const results: RowResult[] = [];
  for (const row of checkRows(rows, categories, templates)) {
    if (!row.input) continue;
    try {
      const policy = await createPolicy(request, row.input);
      results.push({ line: row.line, ok: true, policyId: policy.id });
    } catch {
      results.push({ line: row.line, ok: false });
    }
  }
  return data({ ok: true as const, results });
};

const TEMPLATE_HREF = `data:text/csv;charset=utf-8,${encodeURIComponent(CSV_TEMPLATE)}`;

const Pill = ({ children, tone }: { children: React.ReactNode; tone: "danger" | "ok" }) => (
  <span
    className={cn(
      "flex items-center gap-1 rounded-full px-[9px] py-[3px] text-xs font-semibold",
      tone === "ok" ? "bg-ok-soft text-ok" : "bg-danger-soft text-danger",
    )}
  >
    {tone === "ok" ? (
      <Check aria-hidden="true" className="size-3" />
    ) : (
      <X aria-hidden="true" className="size-3" />
    )}
    {children}
  </span>
);

export default function ImportCsv({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation("authoring");
  const fileId = useId();
  const fetcher = useFetcher<typeof action>();
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [checked, setChecked] = useState<CheckedRow[] | null>(null);
  const [missing, setMissing] = useState<string[]>([]);

  const choose = async (file: File) => {
    const read = readImportFile(await file.text());
    if (!read.ok) {
      setMissing(read.missing);
      setChecked(null);
      return;
    }
    setMissing([]);
    setRows(read.rows);
    setChecked(checkRows(read.rows, loaderData.categories, loaderData.templates));
  };

  const results = fetcher.data?.ok ? fetcher.data.results : null;
  const resultOf = (line: number) => results?.find((result) => result.line === line);
  const ready = checked?.filter((row) => row.input) ?? [];
  const withIssues = (checked?.length ?? 0) - ready.length;
  const imported = results?.filter((result) => result.ok).length ?? 0;
  const failed = results?.filter((result) => !result.ok).length ?? 0;

  const issueText = (issue: RowIssue) =>
    "value" in issue
      ? t(`import.issues.${issue.kind}`, { value: issue.value })
      : t(`import.issues.${issue.kind}`);

  return (
    <div className="flex flex-col gap-3.5 px-4 pt-6 pb-8 text-ink sm:px-8">
      <div className="flex flex-wrap items-end gap-2.5">
        <div className="flex flex-1 flex-col gap-1">
          <h1 className="text-[26px] font-semibold">{t("import.title")}</h1>
          <p className="text-muted">{t("import.subtitle")}</p>
        </div>
        <a
          className="flex h-9 items-center gap-1.5 rounded-md border border-border-strong bg-surface px-3 text-sm font-semibold hover:bg-sunken"
          download="policies-template.csv"
          href={TEMPLATE_HREF}
        >
          <Download aria-hidden="true" className="size-4" />
          {t("import.template")}
        </a>
      </div>

      <div className="flex flex-col gap-[5px]">
        <label className="text-sm font-medium" htmlFor={fileId}>
          {t("import.choose")}
        </label>
        <input
          accept=".csv,text/csv"
          className="text-sm"
          id={fileId}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void choose(file);
          }}
          type="file"
        />
        <p className="text-[13px] text-muted">{t("import.columns")}</p>
      </div>

      {missing.length > 0 ? (
        <p className="rounded-lg bg-danger-soft px-3.5 py-3 text-sm text-danger" role="alert">
          {missing.map((column) => t("import.missingColumn", { column })).join(" ")}
        </p>
      ) : null}

      {checked ? (
        <>
          <div className="flex gap-2">
            <Pill tone="ok">{t("import.ready", { count: ready.length })}</Pill>
            {withIssues > 0 ? (
              <Pill tone="danger">{t("import.withIssues", { count: withIssues })}</Pill>
            ) : null}
          </div>
          <div className="overflow-x-auto rounded-[10px] border border-border bg-surface text-[13px]">
            <table className="w-full">
              <thead className="border-b border-border-strong bg-sunken text-left font-semibold text-muted">
                <tr>
                  <th className="w-9 px-3 py-2">#</th>
                  <th className="px-3 py-2">{t("import.headers.title")}</th>
                  <th className="px-3 py-2">{t("import.headers.category")}</th>
                  <th className="px-3 py-2">{t("import.headers.issues")}</th>
                </tr>
              </thead>
              <tbody>
                {checked.map((row) => {
                  const result = resultOf(row.line);
                  return (
                    <tr className="border-b border-border last:border-b-0" key={row.line}>
                      <td className="px-3 py-2 font-mono text-muted">{row.line}</td>
                      <td className="px-3 py-2">
                        {result?.ok && result.policyId ? (
                          <Link
                            className="text-primary hover:underline"
                            to={`/drafts/${result.policyId}`}
                          >
                            {row.title}
                          </Link>
                        ) : (
                          row.title
                        )}
                      </td>
                      <td className="px-3 py-2">{row.category}</td>
                      <td
                        className={cn(
                          "px-3 py-2",
                          row.issues.length > 0 || result?.ok === false
                            ? "font-semibold text-danger"
                            : "text-ok",
                        )}
                      >
                        {result
                          ? t(result.ok ? "import.created" : "import.failedRow")
                          : row.issues.length > 0
                            ? row.issues.map(issueText).join("; ")
                            : t("import.readyRow")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {results ? null : (
            <div className="flex justify-end">
              <fetcher.Form method="post">
                <input name="rowsJson" type="hidden" value={JSON.stringify(rows)} />
                <button
                  className="flex h-10 items-center rounded-md bg-primary px-[18px] font-semibold text-on-primary hover:bg-primary-hover disabled:opacity-50"
                  disabled={ready.length === 0 || fetcher.state !== "idle"}
                  type="submit"
                >
                  {t("import.submit", { count: ready.length })}
                </button>
              </fetcher.Form>
            </div>
          )}
        </>
      ) : null}

      {results && imported > 0 ? (
        <p className="rounded-lg bg-ok-soft px-3.5 py-3 text-ok" role="status">
          <b>{t("import.done", { count: imported })}</b> · {t("import.asDrafts")}
        </p>
      ) : null}
      {failed > 0 ? (
        <p className="rounded-lg bg-danger-soft px-3.5 py-3 text-danger" role="alert">
          <b>{t("import.failed", { count: failed })}</b>
        </p>
      ) : null}
    </div>
  );
}
