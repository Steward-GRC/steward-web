// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { DevelopmentUiIssueButtonProps } from "./DevelopmentUiIssueButton";

/**
 * The release build's half of the dev UI-issue button swap: nothing.
 * `@steward-web/vite-config`'s `chooseDevelopmentUiIssueButton` aliases
 * `@steward-web/dev-ui-issue-button` to this file unless
 * `STEWARD_DEV_UI_ISSUE_COPY_BUILD=true`, so the real button's code (and its marker string)
 * is never bundled into a build made without that build argument.
 */
export const DevelopmentUiIssueButton: (props: DevelopmentUiIssueButtonProps) => null = () => null;
