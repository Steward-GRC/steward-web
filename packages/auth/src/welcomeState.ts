// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0

export interface WelcomeLoaderData {
  next: string;
  person: WelcomePerson;
  /** The frame id a dev-only `?gate=` preview is showing; never set in a release build. */
  preview?: string;
}

/** What the sign-in already knows about someone on the welcome page (G10). */
export interface WelcomePerson {
  /** Shown read-only when the sign-in sent it; asked for when it didn't. */
  email: string;
  firstName: string;
  lastName: string;
  username: string;
}

/** Why finishing onboarding didn't go through. */
export interface WelcomeState {
  problem: "failed" | "terms";
}
