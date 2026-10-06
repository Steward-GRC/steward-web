// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DevelopmentUiIssueButton } from "./NoDevelopmentUiIssueButton";

describe("NoDevelopmentUiIssueButton", () => {
  it("renders nothing, even when enabled is true", () => {
    const { container } = render(<DevelopmentUiIssueButton app="staff" enabled={true} />);
    expect(container).toBeEmptyDOMElement();
  });
});
