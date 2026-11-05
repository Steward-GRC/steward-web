// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { QRCodeSVG } from "qrcode.react";

import { cn } from "#ui/lib/cn";

/**
 * The 120 px QR code on G7, inside a 6 px quiet zone and a 1 px border. It stays ink on white
 * in every theme: an inverted code (light on dark) is one many authenticator apps can't scan.
 */
export const QrCode = ({
  className,
  label,
  size = 120,
  value,
}: {
  className?: string;
  label: string;
  size?: number;
  value: string;
}) => (
  <span
    aria-label={label}
    className={cn("inline-flex rounded-[4px] border border-border bg-white p-1.5", className)}
    role="img"
  >
    <QRCodeSVG aria-hidden="true" bgColor="#ffffff" fgColor="#261b25" size={size} value={value} />
  </span>
);
