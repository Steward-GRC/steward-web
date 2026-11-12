// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The user detail's admin actions (A17 to A20): second factors, a generated password, the
// welcome email, per-policy exceptions, acting as the user, transferring root and moving their
// policies before a delete. Each one is site-admin only (user.manage), as the gateway gates it.
import type { MfaFactor, OverrideEffect, User } from "@steward-web/api-client";

import { DocumentType } from "@steward-web/api-client";
import { PERMISSIONS } from "@steward-web/auth";
import { requirePermissionFromRequest } from "@steward-web/auth/server";
import edge from "@steward-web/edge.server";
import { randomInt } from "node:crypto";

const cookieOf = (request: Request) => request.headers.get("cookie") ?? undefined;

const requireUserManage = (request: Request) =>
  requirePermissionFromRequest(request, PERMISSIONS.UserManage, "/");

export const listUserFactors = async (
  request: Request,
  userId: string,
): Promise<readonly MfaFactor[]> => {
  await requireUserManage(request);
  return edge.userFactors(userId, cookieOf(request));
};

export const renameUserFactor = async (
  request: Request,
  userId: string,
  methodId: string,
  label: string,
): Promise<void> => {
  await requireUserManage(request);
  await edge.renameUserMfaFactor(userId, methodId, label.trim(), cookieOf(request));
};

/** "Reset": removes the method, so the user sets it up again at their next sign-in. */
export const removeUserFactor = async (
  request: Request,
  userId: string,
  methodId: string,
): Promise<void> => {
  await requireUserManage(request);
  await edge.removeUserMfaFactor(userId, methodId, cookieOf(request));
};

// No look-alike characters (0/O, 1/l/I), so a password read off the screen types back right.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
const PASSWORD_LENGTH = 20;

/** A random password for "Generate & reset", from the platform's cryptographic generator. */
export const generatePassword = (): string =>
  Array.from({ length: PASSWORD_LENGTH }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");

/**
 * "Generate & reset" (A17): sets a fresh random password and returns it, for D24 to show once.
 * It's never logged or stored here.
 */
export const resetPassword = async (request: Request, userId: string): Promise<string> => {
  await requireUserManage(request);
  const password = generatePassword();
  await edge.resetUserPassword(userId, password, cookieOf(request));
  return password;
};

export const resendWelcome = async (request: Request, userId: string): Promise<void> => {
  await requireUserManage(request);
  await edge.resendWelcomeEmail(userId, cookieOf(request));
};

/** One per-policy exception (A19): allow, deny, or null to clear it. */
export const setPolicyException = async (
  request: Request,
  userId: string,
  policyNumber: string,
  effect: null | OverrideEffect,
): Promise<User> => {
  await requireUserManage(request);
  return edge.setUserPolicyOverride(userId, policyNumber.trim(), effect, cookieOf(request));
};

/** "Act as this user" (D19): the gateway records it on the admin's session for 30 minutes. */
export const actAsUser = async (request: Request, userId: string, reason: string) => {
  await requireUserManage(request);
  const why = reason.trim();
  if (!why) throw new Error("a reason is required");
  return edge.startImpersonation(userId, why, cookieOf(request));
};

/** Emails the signed-in admin the step-up code (D18) that "Make this user the root" needs. */
export const sendStepUpCode = async (request: Request): Promise<void> => {
  await requireUserManage(request);
  await edge.requestStepUpOtp(cookieOf(request));
};

/** "Make this user the root" (D22): moves the single root seat; only the current root, with the emailed code. */
export const transferRoot = async (
  request: Request,
  userId: string,
  otp: string,
): Promise<User> => {
  await requireUserManage(request);
  return edge.transferRoot(userId, otp, cookieOf(request));
};

/** D20's "Re-assign all to": moves the user's owned policies and author grants first. */
export const reassignPolicies = async (
  request: Request,
  fromUserId: string,
  toUserId: string,
): Promise<void> => {
  await requireUserManage(request);
  await edge.reassignUserPolicies(fromUserId, toUserId, cookieOf(request));
};

/** The policies an exception can name (A19), by title. */
export const listPolicyChoices = async (
  request: Request,
): Promise<{ number: string; title: string }[]> => {
  await requireUserManage(request);
  const policies = await edge.policies(DocumentType.Policy, cookieOf(request));
  return policies
    .map(({ number, title }) => ({ number, title }))
    .toSorted((a, b) => a.title.localeCompare(b.title));
};
