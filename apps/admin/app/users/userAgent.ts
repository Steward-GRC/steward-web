// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// A session's user agent as A20 shows it: "Firefox · Linux", "Mobile app · iOS". Product and
// system names aren't translated, so this needs no catalog.

const BROWSERS: [RegExp, string][] = [
  [/^Steward\//, "Mobile app"],
  [/Edg\//, "Edge"],
  [/Firefox\//, "Firefox"],
  [/Chrome\//, "Chrome"],
  [/Safari\//, "Safari"],
];

const SYSTEMS: [RegExp, string][] = [
  [/iPhone|iPad/, "iOS"],
  [/Android/, "Android"],
  [/Mac OS X|Macintosh/, "macOS"],
  [/Windows/, "Windows"],
  [/Linux|X11/, "Linux"],
];

const first = (agent: string, table: [RegExp, string][]) =>
  table.find(([pattern]) => pattern.test(agent))?.[1];

export const browserOf = (agent: string): string => {
  const browser = first(agent, BROWSERS);
  const system = first(agent, SYSTEMS);
  if (!browser && !system) return agent;
  return [browser, system].filter(Boolean).join(" · ");
};
