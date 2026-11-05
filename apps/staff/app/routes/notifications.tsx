// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The account menu's and the emails' "Notifications" (U35) lives under the profile.
import { redirect } from "react-router";

export const loader = () => redirect("/profile/notifications");
