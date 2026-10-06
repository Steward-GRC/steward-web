import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { i18n } from "./i18n";
import { I18nProvider } from "./I18nProvider";
import { LOCALE_STORAGE_KEY } from "./storedLocale";
import { useLocale } from "./useLocale";

afterEach(() => {
  cleanup();
  localStorage.clear();
});

beforeEach(async () => {
  localStorage.clear();
  await i18n.changeLanguage("en");
});

// A minimal consumer standing in for LocaleSwitcher, so these tests exercise the
// provider's contract rather than the kit's dropdown internals.
const Probe = () => {
  const { isPersisting, locale, persistError, setLocale, source } = useLocale();
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="source">{source}</span>
      <span data-testid="persisting">{String(isPersisting)}</span>
      <span data-testid="error">{String(persistError)}</span>
      <button onClick={() => void setLocale("en")} type="button">
        pick-en
      </button>
    </div>
  );
};

describe("I18nProvider", () => {
  it("resolves to en and reports the browser as the source", async () => {
    render(
      <I18nProvider>
        <Probe />
      </I18nProvider>,
    );
    // jsdom's navigator.language is en-US, so the browser step wins with no
    // account preference and no stored choice.
    await waitFor(() => expect(screen.getByTestId("source").textContent).toBe("browser"));
    expect(screen.getByTestId("locale").textContent).toBe("en");
  });

  it("prefers the account preference and reports source=user", async () => {
    render(
      <I18nProvider userLocale="en-GB">
        <Probe />
      </I18nProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("source").textContent).toBe("user"));
    // Negotiated down to the shipped base catalog.
    expect(screen.getByTestId("locale").textContent).toBe("en");
  });

  it("re-resolves when the account preference arrives after first paint", async () => {
    // `me` resolves AFTER mount, so the provider must upgrade rather than
    // compute precedence once.
    const { rerender } = render(
      <I18nProvider userLocale={undefined}>
        <Probe />
      </I18nProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("source").textContent).toBe("browser"));

    rerender(
      <I18nProvider userLocale="en">
        <Probe />
      </I18nProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("source").textContent).toBe("user"));
  });

  it("persists a choice to this browser and keeps it across a remount", async () => {
    const { unmount } = render(
      <I18nProvider>
        <Probe />
      </I18nProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "pick-en" }));

    await waitFor(() => expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("en"));
    expect(screen.getByTestId("source").textContent).toBe("stored");

    unmount();
    render(
      <I18nProvider>
        <Probe />
      </I18nProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("source").textContent).toBe("stored"));
  });

  it("calls the app's persist seam and reports source=user on success", async () => {
    const persist = vi.fn(async () => {});
    render(
      <I18nProvider persist={persist}>
        <Probe />
      </I18nProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "pick-en" }));

    await waitFor(() => expect(persist).toHaveBeenCalledWith("en"));
    await waitFor(() => expect(screen.getByTestId("source").textContent).toBe("user"));
    expect(screen.getByTestId("error").textContent).toBe("false");
  });

  it("keeps the locale applied when the account save fails", async () => {
    // The user's intent was unambiguous, so a failed round-trip must warn, not
    // silently revert the language they just picked.
    const persist = vi.fn().mockRejectedValue(new Error("gateway down"));
    render(
      <I18nProvider persist={persist}>
        <Probe />
      </I18nProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "pick-en" }));

    await waitFor(() => expect(screen.getByTestId("error").textContent).toBe("true"));
    expect(screen.getByTestId("locale").textContent).toBe("en");
    expect(screen.getByTestId("source").textContent).toBe("stored");
    expect(screen.getByTestId("persisting").textContent).toBe("false");
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("en");
  });

  it("keeps <html lang> in step with the locale", async () => {
    // Drives screen-reader pronunciation and CSS :lang() hyphenation.
    render(
      <I18nProvider>
        <Probe />
      </I18nProvider>,
    );
    await waitFor(() => expect(document.documentElement.lang).toBe("en"));
  });

  it("ignores a stored value that is no longer supported", async () => {
    // A locale can be REMOVED from SUPPORTED_LOCALES; a stale localStorage
    // entry must not pin the UI to a catalog that no longer exists.
    localStorage.setItem(LOCALE_STORAGE_KEY, "fr-CA");
    render(
      <I18nProvider>
        <Probe />
      </I18nProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("source").textContent).toBe("browser"));
    expect(screen.getByTestId("locale").textContent).toBe("en");
  });
});

describe("useLocale without a provider", () => {
  it("degrades to a read-only view instead of throwing", async () => {
    // Keeps @steward-web/ui components renderable in Storybook and in unit tests
    // that have no app-level provider.
    render(<Probe />);
    expect(screen.getByTestId("locale").textContent).toBe("en");
    expect(screen.getByTestId("source").textContent).toBe("default");

    await userEvent.click(screen.getByRole("button", { name: "pick-en" }));
    // No provider owns persistence, so the write is a no-op rather than a
    // half-applied change.
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBeNull();
  });
});
