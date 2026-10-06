// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: MIT
declare module "*.svg?react" {
  import type { FC, SVGProps } from "react";
  const Component: FC<SVGProps<SVGSVGElement>>;
  export default Component;
}
