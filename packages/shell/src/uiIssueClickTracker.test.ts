// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { afterEach, describe, expect, it } from "vitest";

import {
  getLastClicked,
  installUiIssueClickTracker,
  resetLastClickedForTests,
} from "./uiIssueClickTracker";

afterEach(() => {
  resetLastClickedForTests();
  document.body.innerHTML = "";
});

const click = (element: Element) => {
  element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
};

describe("installUiIssueClickTracker", () => {
  it("prefers the clicked element's own data-testid", () => {
    document.body.innerHTML = '<button data-testid="secret-reveal">Reveal</button>';
    const stop = installUiIssueClickTracker(document);
    click(document.querySelector("button")!);
    expect(getLastClicked()).toBe("[data-testid=secret-reveal]");
    stop();
  });

  it("finds an ancestor's data-testid when the click lands on a child", () => {
    document.body.innerHTML =
      '<button data-testid="secret-reveal"><span id="inner">Reveal</span></button>';
    const stop = installUiIssueClickTracker(document);
    click(document.querySelector("#inner")!);
    expect(getLastClicked()).toBe("[data-testid=secret-reveal]");
    stop();
  });

  it("falls back to a tag#id selector with no data-testid", () => {
    document.body.innerHTML = '<button id="save-button">Save</button>';
    const stop = installUiIssueClickTracker(document);
    click(document.querySelector("#save-button")!);
    expect(getLastClicked()).toBe("button#save-button");
    stop();
  });

  it("falls back to a tag.class selector with no id or data-testid", () => {
    document.body.innerHTML = '<button class="primary-action">Go</button>';
    const stop = installUiIssueClickTracker(document);
    click(document.querySelector("button")!);
    expect(getLastClicked()).toBe("button.primary-action");
    stop();
  });

  it("falls back to the bare tag with no id, class or data-testid", () => {
    document.body.innerHTML = "<button>Go</button>";
    const stop = installUiIssueClickTracker(document);
    click(document.querySelector("button")!);
    expect(getLastClicked()).toBe("button");
    stop();
  });

  it("never records the element's text content", () => {
    document.body.innerHTML = '<button id="reveal-secret">my-secret-value-42</button>';
    const stop = installUiIssueClickTracker(document);
    click(document.querySelector("button")!);
    expect(getLastClicked()).not.toContain("my-secret-value-42");
    stop();
  });

  it("never overwrites the last click with a click on the button's own chrome", () => {
    document.body.innerHTML =
      '<button id="save-button">Save</button>' +
      '<div data-steward-dev-ui-issue="steward-dev-ui-issue-copy"><button>Copy for UI issue</button></div>';
    const stop = installUiIssueClickTracker(document);
    click(document.querySelector("#save-button")!);
    click(document.querySelector("[data-steward-dev-ui-issue] button")!);
    expect(getLastClicked()).toBe("button#save-button");
    stop();
  });

  it("stops tracking once uninstalled", () => {
    document.body.innerHTML = '<button id="first">1</button><button id="second">2</button>';
    const stop = installUiIssueClickTracker(document);
    click(document.querySelector("#first")!);
    stop();
    click(document.querySelector("#second")!);
    expect(getLastClicked()).toBe("button#first");
  });
});
