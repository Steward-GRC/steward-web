// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The staff app's accessibility and layout pass (#24), run by hand against a running staff app
// and steward-mock-server; not part of CI. For every staff route and gate, at 390, 1024 and
// 1280 px in light, dark and high contrast, it loads the page in headless Chrome (over the
// DevTools protocol, never a visible window), signed in as the sample person the route needs,
// and checks:
//   - axe-core: every violation is reported; serious and critical ones fail the run;
//   - no horizontal overflow (the page is never wider than the screen);
//   - the shell's layout for the width: the drawer's menu button on a phone, the icon rail at
//     1024 px, the full sidebar at 1280 px;
//   - a visible focus indicator on each of the first Tab stops.
// Usage: pnpm run check:a11y [-- --only <route substring>] [--widths 390,1280] [--themes light]
// Settings: STEWARD_URL (the staff app, default http://localhost:5183), MOCK_URL (the mock,
// default http://localhost:5175), CHROME (the Chrome binary).
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";

const require = createRequire(import.meta.url);

export const WIDTHS = [390, 1024, 1280];
export const THEMES = ["light", "dark", "hc"];
const HEIGHT = 900;

/** Chrome's binary on macOS: the app bundle's folder, then the executable inside it. */
const MAC_CHROME = path.join(
  "/Applications",
  ["Google Chrome", "app"].join("."),
  "Contents/MacOS/Google Chrome",
);
const TAB_STOPS = 4;

/**
 * The staff app's routes and gates, each with who it's opened as (`null` signed out) and
 * whether it sits inside the shell (gates don't). Sample numbers come from the mock's seed.
 */
export const ROUTES = [
  { as: null, path: "/sign-in", shell: false },
  { as: null, path: "/sign-in?step=sso", shell: false },
  { as: null, path: "/sign-in?step=reset", shell: false },
  { as: null, path: "/sign-in?gate=G6", shell: false },
  { as: null, path: "/sign-in?gate=G6-code", shell: false },
  { as: null, path: "/sign-in?gate=G7", shell: false },
  { as: null, path: "/sign-in?gate=G9", shell: false },
  { as: null, path: "/sign-in?gate=G11", shell: false },
  { as: null, path: "/not-set-up?gate=G1", shell: false },
  { as: null, path: "/not-set-up?gate=G2", shell: false },
  { as: null, path: "/share/sample?gate=G16", shell: false },
  { as: null, path: "/sso-test/result?test=passed", shell: false },
  { as: "erin", path: "/", shell: true },
  { as: "erin", path: "/acknowledge", shell: true },
  { as: "erin", path: "/policies", shell: true },
  { as: "erin", path: "/policies?category=Workplace", shell: true },
  { as: "erin", path: "/procedures", shell: true },
  { as: "erin", path: "/policies/POL-FACILITIES-000001", shell: true },
  { as: "erin", path: "/policies/POL-EXPENSES-000002", shell: true },
  { as: "erin", path: "/search?q=desk", shell: true },
  { as: "erin", path: "/ask", shell: true },
  { as: "erin", path: "/profile", shell: true },
  { as: "erin", path: "/profile/security", shell: true },
  { as: "erin", path: "/profile/preferences", shell: true },
  { as: "erin", path: "/profile/notifications", shell: true },
  { as: "erin", path: "/inbox", shell: true },
  { as: "bob", path: "/drafts", shell: true },
  { as: "bob", path: "/drafts/new", shell: true },
  { as: "charlie", path: "/approvals", shell: true },
];

/**
 * Whether focus can be seen: the focused element draws an outline or a ring of its own, or
 * something around it changes when it takes focus (`focusedLook` against `blurredLook`, the
 * element's and its nearest ancestors' outlines, rings and borders), as a focus-within ring does.
 */
export const focusVisible = (style, focusedLook, blurredLook) =>
  (style.outlineStyle !== "none" && Number.parseFloat(style.outlineWidth) > 0) ||
  Boolean(style.boxShadow && style.boxShadow !== "none") ||
  (focusedLook !== undefined && focusedLook !== blurredLook);

/** The shell layout a width should show. */
export const expectedLayout = (width) =>
  width < 1024 ? "drawer" : width < 1280 ? "rail" : "sidebar";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** A session cookie for a sample person, signed in on the mock (any second factor passes). */
const signIn = async (mock, username) => {
  const post = (route, body, cookie) =>
    fetch(`${mock}${route}`, {
      body: JSON.stringify(body),
      headers: { "content-type": "application/json", ...(cookie ? { cookie } : {}) },
      method: "POST",
    });
  let answer = await post("/auth/login", { password: `${username}-password`, username });
  let body = await answer.json();
  if (body.mfaRequired) {
    answer = await post("/auth/mfa/verify", {
      code: "123456",
      kind: "totp",
      pendingId: body.pendingId,
    });
    body = await answer.json();
  }
  const sid = (answer.headers.getSetCookie?.() ?? [])
    .map((c) => c.split(";", 1)[0])
    .find((c) => c.startsWith("steward_sid="));
  if (!sid) throw new Error(`couldn't sign ${username} in on the mock`);
  return sid.slice("steward_sid=".length);
};

/** One headless Chrome, driven over the DevTools protocol. */
const launch = async (binary) => {
  const port = 9400 + Math.floor(Math.random() * 400);
  const profile = mkdtempSync(path.join(process.env.TMPDIR ?? tmpdir(), "steward-a11y-"));
  const chrome = spawn(
    binary,
    [
      "--headless=new",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      "--hide-scrollbars",
      "--no-first-run",
      "about:blank",
    ],
    { stdio: "ignore" },
  );
  let target;
  for (let index = 0; index < 75 && !target; index += 1) {
    await sleep(200);
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json`);
      const list = await response.json();
      target = list.find((t) => t.type === "page");
    } catch {
      // Chrome is still starting.
    }
  }
  if (!target) throw new Error("headless Chrome didn't start");
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve) => ws.addEventListener("open", resolve));
  let next = 0;
  const pending = new Map();
  const listeners = new Set();
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      pending.get(message.id)(message);
      pending.delete(message.id);
    } else for (const listener of listeners) listener(message);
  });
  const send = (method, parameters = {}) =>
    new Promise((resolve) => {
      next += 1;
      pending.set(next, resolve);
      ws.send(JSON.stringify({ id: next, method, params: parameters }));
    });
  const evaluate = async (expression) => {
    const answer = await send("Runtime.evaluate", {
      awaitPromise: true,
      expression,
      returnByValue: true,
    });
    if (answer.result?.exceptionDetails) throw new Error(answer.result.exceptionDetails.text);
    return answer.result?.result?.value;
  };
  const loaded = () =>
    new Promise((resolve) => {
      const listener = (message) => {
        if (message.method === "Page.loadEventFired") {
          listeners.delete(listener);
          resolve();
        }
      };
      listeners.add(listener);
      setTimeout(() => {
        listeners.delete(listener);
        resolve();
      }, 15_000);
    });
  await send("Page.enable");
  await send("Network.enable");
  return {
    close: async () => {
      ws.close();
      const exited = new Promise((resolve) => chrome.once("exit", resolve));
      chrome.kill();
      await exited;
      // The throwaway profile this run made; Chrome may still be letting go of it.
      try {
        rmSync(profile, { force: true, maxRetries: 5, recursive: true, retryDelay: 200 });
      } catch {
        // Left for the system's temp cleanup.
      }
    },
    evaluate,
    loaded,
    send,
  };
};

/** What the page measures of itself once it has settled. */
const MEASURE = `(() => {
  const width = window.innerWidth;
  const overflow = document.documentElement.scrollWidth - width;
  const wide = overflow > 1
    ? [...document.querySelectorAll("body *")]
        .filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.right > width + 1; })
        .slice(0, 5)
        .map((e) => e.tagName.toLowerCase() + (e.id ? "#" + e.id : "") + (typeof e.className === "string" && e.className ? "." + e.className.trim().split(/\\s+/).slice(0, 3).join(".") : ""))
    : [];
  const nav = document.querySelector('nav[aria-label="Main navigation"]');
  const navShown = nav && getComputedStyle(nav).display !== "none" && nav.getBoundingClientRect().width > 0;
  const menu = [...document.querySelectorAll("button")].find((b) => b.getAttribute("aria-label") === "Open menu" && b.getBoundingClientRect().width > 0);
  // The icon rail is the sidebar drawn narrow (by width, or when someone collapses it).
  const layout = !navShown ? (menu ? "drawer" : "none") : nav.getBoundingClientRect().width < 120 ? "rail" : "sidebar";
  return { layout, overflow, title: document.title, wide };
})()`;

/** Tab through the first stops, noting any whose focus can't be seen. */
const tabStops = async (browser) => {
  const missing = [];
  for (let index = 0; index < TAB_STOPS; index += 1) {
    await browser.send("Input.dispatchKeyEvent", {
      code: "Tab",
      key: "Tab",
      type: "keyDown",
      windowsVirtualKeyCode: 9,
    });
    await browser.send("Input.dispatchKeyEvent", {
      code: "Tab",
      key: "Tab",
      type: "keyUp",
      windowsVirtualKeyCode: 9,
    });
    await sleep(120);
    const stop = await browser.evaluate(`(() => {
      const e = document.activeElement;
      if (!e || e === document.body) return null;
      // How the element and its nearest ancestors look; compared focused and blurred.
      const look = () => {
        const parts = [];
        for (let n = e, i = 0; n && i < 4; n = n.parentElement, i += 1) {
          const c = getComputedStyle(n);
          parts.push([c.outlineStyle, c.outlineWidth, c.outlineColor, c.boxShadow, c.borderColor, c.borderWidth].join(" "));
        }
        return parts.join("|");
      };
      const s = getComputedStyle(e);
      const focused = look();
      const own = { boxShadow: s.boxShadow, outlineStyle: s.outlineStyle, outlineWidth: s.outlineWidth };
      e.blur();
      const blurred = look();
      e.focus({ focusVisible: true });
      const name = (e.getAttribute("aria-label") || e.textContent || "").trim().slice(0, 40);
      return { blurred, focused, name, own, tag: e.tagName.toLowerCase() };
    })()`);
    if (stop && !focusVisible(stop.own, stop.focused, stop.blurred)) {
      missing.push(`${stop.tag} "${stop.name}"`);
    }
  }
  return missing;
};

const options = (argv) => {
  const value = (flag) => {
    const at = argv.indexOf(flag);
    return at === -1 ? undefined : argv[at + 1];
  };
  return {
    only: value("--only"),
    themes: value("--themes")?.split(",") ?? THEMES,
    widths: value("--widths")?.split(",").map(Number) ?? WIDTHS,
  };
};

const main = async () => {
  const base = process.env.STEWARD_URL ?? "http://localhost:5183";
  const mock = process.env.MOCK_URL ?? "http://localhost:5175";
  const binary = process.env.CHROME ?? MAC_CHROME;
  const { only, themes, widths } = options(process.argv.slice(2));
  const axe = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
  const routes = ROUTES.filter((route) => !only || route.path.includes(only));
  const sessions = new Map();
  for (const person of new Set(routes.map((route) => route.as).filter(Boolean))) {
    sessions.set(person, await signIn(mock, person));
  }

  const browser = await launch(binary);
  const host = new URL(base).hostname;
  const failures = [];
  const minor = new Map();
  try {
    for (const theme of themes) {
      // The theme rides on the display preferences the boot script reads before first paint.
      await browser.send("Page.addScriptToEvaluateOnNewDocument", {
        source: `try{localStorage.setItem("steward.display", JSON.stringify({theme:${JSON.stringify(theme)}}))}catch(e){}`,
      });
      for (const width of widths) {
        await browser.send("Emulation.setDeviceMetricsOverride", {
          deviceScaleFactor: 1,
          height: HEIGHT,
          mobile: width < 600,
          width,
        });
        for (const route of routes) {
          await browser.send("Network.clearBrowserCookies");
          if (route.as) {
            await browser.send("Network.setCookie", {
              domain: host,
              httpOnly: true,
              name: "steward_sid",
              path: "/",
              value: sessions.get(route.as),
            });
          }
          const where = `${route.path} @${width} ${theme}`;
          const loaded = browser.loaded();
          await browser.send("Page.navigate", { url: `${base}${route.path}` });
          await loaded;
          await sleep(1200);
          const page = await browser.evaluate(MEASURE);
          if (page.overflow > 1)
            failures.push(
              `${where}: ${page.overflow}px wider than the screen (${page.wide.join(", ")})`,
            );
          if (route.shell && page.layout !== expectedLayout(width)) {
            failures.push(
              `${where}: shows the ${page.layout} layout, expected the ${expectedLayout(width)}`,
            );
          }
          if (!page.title || !page.title.includes("·"))
            failures.push(`${where}: page title "${page.title}"`);
          await browser.evaluate(axe);
          const violations = await browser.evaluate(
            `axe.run(document, { resultTypes: ["violations"] }).then((r) => r.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.slice(0, 3).map((n) => n.target.join(" ")), help: v.help })))`,
          );
          for (const violation of violations) {
            const line = `${where}: axe ${violation.impact} ${violation.id} — ${violation.help} (${violation.nodes.join("; ")})`;
            if (violation.impact === "serious" || violation.impact === "critical")
              failures.push(line);
            else minor.set(`${violation.id} ${route.path}`, line);
          }
          const unseen = await tabStops(browser);
          for (const stop of unseen) failures.push(`${where}: no visible focus on ${stop}`);
        }
      }
    }
  } finally {
    await browser.close();
  }

  for (const line of minor.values()) console.log(`note  ${line}`);
  for (const line of failures) console.log(`FAIL  ${line}`);
  const pages = routes.length * widths.length * themes.length;
  console.log(
    `check-a11y: ${pages} page loads, ${failures.length} failures, ${minor.size} minor findings`,
  );
  if (failures.length > 0) process.exitCode = 1;
};

if (import.meta.url === `file://${process.argv[1]}`) await main();
