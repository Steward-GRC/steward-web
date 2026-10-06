// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
/**
 * The slice of Ory Kratos's self-service login flow API the sign-in screen renders and
 * submits: https://www.ory.sh/docs/kratos/reference/api#tag/frontend/operation/getLoginFlow.
 * Kept to the fields actually used, not the full response.
 */

export interface KratosLoginFlow {
  id: string;
  ui: {
    action: string;
    messages?: KratosUiText[];
    method: "GET" | "POST";
    nodes: KratosUiNode[];
  };
}

export interface KratosUiNode {
  attributes: KratosUiNodeAttributes;
  /** "default" | "password" | "totp" | "webauthn" | "code" | "link_recovery", and so on. */
  group: string;
  messages: KratosUiText[];
  meta: { label?: { text: string } };
}

export interface KratosUiNodeAttributes {
  disabled: boolean;
  name: string;
  node_type: "a" | "img" | "input" | "script" | "text";
  /** Present on `type: "input"` nodes; e.g. "hidden" | "text" | "password" | "submit". */
  type?: string;
  value?: boolean | number | string;
}

export interface KratosUiText {
  id: number;
  text: string;
  type: "error" | "info" | "success";
}

/** Input nodes only: the ones a submit actually carries (never `a`, `img` or `text` nodes). */
export const inputNodes = (flow: KratosLoginFlow): KratosUiNode[] =>
  flow.ui.nodes.filter((node) => node.attributes.node_type === "input");

/**
 * The body to POST back to `flow.ui.action`: every input node's current value (hidden fields
 * such as `csrf_token`, and the method marker such as `method=password`), overridden by
 * whatever the visitor typed, keyed by field name.
 */
export const buildSubmitBody = (
  flow: KratosLoginFlow,
  typed: Readonly<Record<string, string>>,
): Record<string, string> => {
  const body: Record<string, string> = {};
  for (const node of inputNodes(flow)) {
    const { name, value } = node.attributes;
    if (value != undefined) body[name] = String(value);
  }
  return { ...body, ...typed };
};

/** Every error message on the flow: the form-level ones plus each field's own. */
export const errorMessages = (flow: KratosLoginFlow): string[] => {
  const messages = flow.ui.messages ?? [];
  const fieldMessages = inputNodes(flow).flatMap((node) => node.messages);
  return [...messages, ...fieldMessages]
    .filter((message) => message.type === "error")
    .map((message) => message.text);
};
