// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { ComponentVersion } from "@steward-web/api-client";
import type { Failure } from "@steward-web/ui";

export interface DiagnosticsActorFact {
  actingAs?: { id: string; roles: readonly string[]; username: string } | null;
  id: string;
  roles: readonly string[];
  username: string;
}

export interface DiagnosticsReportInput {
  actor?: DiagnosticsActorFact;
  app: { commit: string; version: string };
  failure?: Failure;
  route: string;
  steward: StewardFacts;
  time: Date;
  url: string;
  userAgent: string;
}

/** The gateway's own diagnostics read, or why it isn't included. */
export type StewardFacts =
  | "signed-out"
  | "unavailable"
  | {
      appliance?: null | string;
      gateway: ComponentVersion;
      release?: null | string;
      services: readonly ComponentVersion[];
      thirdParty: readonly ComponentVersion[];
    };

const line = (label: string, value: null | string | undefined): string[] =>
  value == undefined || value === "" ? [] : [`${label}: ${value}`];

const componentLines = (label: string, component: ComponentVersion): string[] => [
  ...line(`${label} version`, component.version),
  ...line(`${label} commit`, component.commit),
];

const failureSection = (failure: Failure | undefined): string[] =>
  failure
    ? [
        ...line("Failure operation", failure.operation),
        ...line("Failure code", failure.code),
        ...line("Failure reason", failure.reason),
        ...line("Failure status", failure.status?.toString()),
        ...line("Failure request id", failure.requestId),
        ...line("Failure trace id", failure.traceId),
      ]
    : [];

const actorSection = (actor: DiagnosticsActorFact | undefined): string[] => {
  if (!actor) return ["Actor: sign in to include"];
  return [
    ...line("Actor id", actor.id),
    ...line("Actor username", actor.username),
    ...line("Actor roles", actor.roles.join(", ")),
    ...(actor.actingAs
      ? [
          ...line("Acting as id", actor.actingAs.id),
          ...line("Acting as username", actor.actingAs.username),
          ...line("Acting as roles", actor.actingAs.roles.join(", ")),
        ]
      : []),
  ];
};

const stewardSection = (steward: StewardFacts): string[] => {
  if (steward === "signed-out") return ["Steward: sign in to include"];
  if (steward === "unavailable") return ["Steward: unavailable"];
  return [
    ...componentLines("Gateway", steward.gateway),
    ...steward.services.flatMap((service) => componentLines(service.name, service)),
    ...line("Release", steward.release),
    ...line("Appliance", steward.appliance),
    ...steward.thirdParty.flatMap((component) => componentLines(component.name, component)),
  ];
};

/**
 * The plain-text clipboard report, fixed English labels, one fact per line, in the order the
 * spec sets: time, URL, route, failure, actor, app, gateway, each service, release,
 * appliance, each third-party component, user agent. Never translated (support reads any
 * report), and never fed anything but these typed, allow-listed fields: no object is ever
 * spread into it.
 */
export const buildDiagnosticsText = (input: DiagnosticsReportInput): string =>
  [
    "Steward diagnostics",
    ...line("Time", input.time.toISOString()),
    ...line("URL", input.url),
    ...line("Route", input.route),
    ...failureSection(input.failure),
    ...actorSection(input.actor),
    ...line("App version", input.app.version),
    ...line("App commit", input.app.commit),
    ...stewardSection(input.steward),
    ...line("User agent", input.userAgent),
  ].join("\n");
