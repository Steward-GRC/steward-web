// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
/**
 * The last clicked element, as its `data-testid` first or else a short CSS selector built
 * from its tag, id and class. Never its text content, so a click never leaks page copy into
 * the bundle.
 */
let lastClicked: string | undefined;

const selectorFor = (element: Element): string => {
  const testIdHolder = element.closest<HTMLElement>("[data-testid]");
  const testId = testIdHolder?.dataset.testid;
  if (testId) return `[data-testid=${testId}]`;

  const tag = element.tagName.toLowerCase();
  if (element.id) return `${tag}#${element.id}`;

  const className = typeof element.className === "string" ? element.className.trim() : "";
  const firstClass = className.split(/\s+/).find(Boolean);
  return firstClass ? `${tag}.${firstClass}` : tag;
};

const onClick = (event: Event): void => {
  if (!(event.target instanceof Element)) return;
  // The button's own chrome (marked with data-steward-dev-ui-issue) never overwrites the
  // last click: clicking "Copy for UI issue" itself would otherwise always be the report.
  if (event.target.closest("[data-steward-dev-ui-issue]")) return;
  lastClicked = selectorFor(event.target);
};

export const installUiIssueClickTracker = (target: Document = document): (() => void) => {
  target.addEventListener("click", onClick, true);
  return () => target.removeEventListener("click", onClick, true);
};

export const getLastClicked = (): string | undefined => lastClicked;

/** Test-only reset; nothing else ever needs to clear the last click. */
export const resetLastClickedForTests = (): void => {
  lastClicked = undefined;
};
