// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { createContext, type ReactNode, use } from "react";

import { can } from "./can";
import { type Identity, NO_ACCESS } from "./identity";

const IdentityContext = createContext<Identity>(NO_ACCESS);

/**
 * Makes the root loader's identity available to every component. There is no async "ready"
 * state here: by the time a route renders, its loader (server-side) has already resolved
 * `Me` and turned it into this `Identity`, or left it `NO_ACCESS` for a signed-out request.
 */
export const IdentityProvider = ({
  children,
  identity,
}: {
  children: ReactNode;
  identity: Identity;
}) => <IdentityContext value={identity}>{children}</IdentityContext>;

export const useIdentity = (): Identity => use(IdentityContext);

export const useCan = (permission: string): boolean => can(useIdentity(), permission);
