// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { Banner, Button, Field, Input } from "@steward-web/ui";
import { Form } from "react-router";

import { errorMessages, inputNodes, type KratosLoginFlow, type KratosUiNode } from "./kratos";

const isHidden = (node: KratosUiNode) => node.attributes.type === "hidden";
const isSubmit = (node: KratosUiNode) => node.attributes.type === "submit";

export interface SignInProps {
  /** "Steward" for the staff app, "Steward Admin" for the admin app. */
  cardTitle: string;
  flow: KratosLoginFlow;
}

/**
 * Renders Kratos's own login flow nodes: whatever methods Kratos has enabled (password,
 * one-time code, and so on) show up here with no per-method branch to maintain. The form
 * posts to this route's own action, which replays the fields to Kratos server-side — the
 * browser never talks to Kratos or holds its session cookie directly.
 */
export const SignIn = ({ cardTitle, flow }: SignInProps) => {
  const { t } = useTranslation("auth");
  const failures = errorMessages(flow);
  const nodes = inputNodes(flow);

  return (
    <div className="mx-auto grid w-full max-w-sm gap-6 py-16">
      <h1 className="text-center text-xl font-semibold text-ink">{cardTitle}</h1>
      {failures.length > 0 ? (
        <Banner title={t("signIn.failedTitle")} tone="danger">
          <ul className="list-inside list-disc">
            {failures.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </Banner>
      ) : null}
      <Form className="grid gap-4" method="post">
        {nodes
          .filter((node) => isHidden(node))
          .map((node) => (
            <input
              key={node.attributes.name}
              name={node.attributes.name}
              type="hidden"
              value={String(node.attributes.value ?? "")}
            />
          ))}
        {nodes
          .filter((node) => !isHidden(node) && !isSubmit(node))
          .map((node) => (
            <Field key={node.attributes.name} label={node.meta.label?.text ?? node.attributes.name}>
              <Input
                defaultValue={
                  typeof node.attributes.value === "string" ? node.attributes.value : undefined
                }
                disabled={node.attributes.disabled}
                name={node.attributes.name}
                required
                type={node.attributes.type === "password" ? "password" : "text"}
              />
            </Field>
          ))}
        <div className="grid gap-2">
          {nodes
            .filter((node) => isSubmit(node))
            .map((node) => (
              <Button
                key={node.attributes.name + String(node.attributes.value)}
                name={node.attributes.name}
                type="submit"
                value={String(node.attributes.value ?? "")}
              >
                {node.meta.label?.text ?? t("signIn.continue")}
              </Button>
            ))}
        </div>
      </Form>
    </div>
  );
};
