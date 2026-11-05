// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Client-safe surface only. Anything that touches the gateway directly lives in
// `./index.server.ts` (imported as `@steward-web/auth/server`): the two never share a barrel,
// so a client bundle can never pull in a `*.server.ts` module through this one.
export { canOpenAdmin } from "./adminAccess";
export { can } from "./can";
export { type Permission, PERMISSIONS } from "./catalog";
export { type Identity, identityFromMe, type Me, NO_ACCESS } from "./identity";
export { IdentityProvider, useCan, useIdentity } from "./IdentityContext";
export { NAV_CHOICE_ENABLED } from "./navigationChoice";
export { ProfileName, type ProfileNameProps } from "./ProfileName";
export { SignIn, type SignInProps } from "./SignIn";
export type {
  PasskeyChallenge,
  QuickLoginUser,
  SignInCapabilities,
  SignInFactor,
  SignInLoaderData,
  SignInState,
} from "./signInState";
export { Welcome, type WelcomeProps } from "./Welcome";
export type { WelcomeLoaderData, WelcomePerson, WelcomeState } from "./welcomeState";
