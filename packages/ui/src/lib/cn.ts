// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Join class names, letting a later Tailwind utility win over an earlier one. */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));
