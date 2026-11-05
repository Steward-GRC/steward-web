// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
export { AboutDiagnostics } from "./AboutDiagnostics";
export { AccountMenu } from "./AccountMenu";
export { ADMIN_COMING_SOON, ADMIN_COMING_SOON_PATHS } from "./admin/adminComingSoon";
export { AdminShell, type AdminShellProps } from "./admin/AdminShell";
export { ComingSoonPage } from "./ComingSoonPage";
export { CopyDiagnostics } from "./CopyDiagnostics";
export { adminCreates, type CreateAction, staffCreates } from "./createActions";
export { DiagnosticsProvider } from "./DiagnosticsProvider";
export {
  buildDiagnosticsText,
  type DiagnosticsActorFact,
  type DiagnosticsReportInput,
  type StewardFacts,
} from "./diagnosticsText";
export { EnvironmentBanner } from "./EnvironmentBanner";
export { GATE_HANDLE, GateShell, type GateShellProps, useIsGate } from "./GateShell";
export { MAIN_ID, MainContent, SkipLink } from "./MainContent";
export { browserName, PageError } from "./PageError";
export { PageTitle, pageTitle } from "./pageTitle";
export { refusalOf, useRefusalMessage } from "./refusal";
export { type NotFoundData, RouteErrorBoundary } from "./RouteErrorBoundary";
export { RoutePending } from "./RoutePending";
export { SearchField } from "./SearchField";
export {
  SharedEmailPrompt,
  SharedLinkRefused,
  SharedPolicyReader,
  SharedUnavailable,
  SsoTestLanding,
  SsoTestResult,
  SsoTestUnavailable,
} from "./SharedGates";
export {
  COMMAND_PALETTE_PATH,
  type CommandPaletteResults,
  ShellCommandPalette,
} from "./ShellCommandPalette";
export type { ShellConfig } from "./shellConfig";
export { ShellFooter } from "./ShellFooter";
export { SiteBanners } from "./SiteBanners";
export { COMING_SOON, COMING_SOON_PATHS } from "./staff/comingSoon";
export { StaffShell, type StaffShellProps } from "./staff/StaffShell";
export { type InstanceState, type InstanceStatus, STATUS_PATH } from "./status";
export {
  AdminsOnlyGate,
  CheckingGate,
  InstanceGate,
  MaintenanceGate,
  NotSetUpGate,
  type StatusGate,
  statusGateFor,
} from "./StatusGates";
export {
  LIVE_ACCESS_PATH,
  shouldRevalidateShell,
  useAccessRevalidation,
} from "./useAccessRevalidation";
export { useLiveRevalidation } from "./useLiveRevalidation";
