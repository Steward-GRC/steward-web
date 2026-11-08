// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { Button, Card } from "@steward-web/ui";
import { RecordBreadcrumb } from "@steward-web/ui/domain";
import { type ComponentProps } from "react";
import { useFetcher } from "react-router";

import { AppendicesPanel } from "./EditorChrome";

/**
 * The edit screen of a document that has no working draft yet. Choosing Edit only opens this;
 * the draft is made when Start editing is pressed (bug log 219). The appendices are the
 * document's own and are edited from here without a draft of the document.
 */
export const StartEditing = ({
  appendices,
  policy,
}: {
  appendices: ComponentProps<typeof AppendicesPanel>["appendices"];
  policy: {
    id: string;
    version?: null | string;
  } & ComponentProps<typeof RecordBreadcrumb>["record"];
}) => {
  const { t } = useTranslation("authoring");
  const fetcher = useFetcher();
  return (
    <div className="flex flex-col gap-3.5 px-4 pt-[22px] pb-8 text-ink sm:px-8">
      <RecordBreadcrumb page={t("editor.start.page")} record={policy} />
      <h1 className="font-serif text-[30px] leading-[38px] font-semibold">{policy.title}</h1>
      <span className="font-mono text-sm text-muted">
        {policy.number}
        {policy.version ? ` · v${policy.version}` : ""}
      </span>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Card className="flex flex-col gap-4 px-6 py-6">
          <p className="max-w-[68ch]">
            {t("editor.start.text", { version: policy.version ?? "" })}
          </p>
          <fetcher.Form className="self-start" method="post">
            <input name="intent" type="hidden" value="edit" />
            <Button busy={fetcher.state !== "idle"} type="submit">
              {t("editor.start.action")}
            </Button>
          </fetcher.Form>
        </Card>
        <div className="flex flex-col gap-3.5">
          <AppendicesPanel appendices={appendices} number={policy.number} policyId={policy.id} />
          <p className="text-sm text-muted">{t("editor.start.appendixNote")}</p>
        </div>
      </div>
    </div>
  );
};
