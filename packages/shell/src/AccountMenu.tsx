// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useIdentity } from "@steward-web/auth";
import { useTranslation } from "@steward-web/i18n";
import { cn, Menu, MenuContent, MenuItem, MenuTrigger, Tooltip } from "@steward-web/ui";
import { ArrowLeft, Bell, Info, Smartphone, User } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Link, useHref } from "react-router";

import { AboutDiagnostics } from "./AboutDiagnostics";
import { COMING_SOON } from "./staff/comingSoon";

const itemClass =
  "flex gap-2.5 rounded-md px-2.5 py-[9px] text-base text-ink data-[highlighted]:bg-sunken data-[highlighted]:text-ink [&_svg]:size-4";

/** The first letter of the person's first name, name or username: H1's "B" for Bob. */
const initialOf = (identity: { firstName: string; name: string; username: string }) =>
  (identity.firstName || identity.name || identity.username).charAt(0).toUpperCase();

/**
 * A plain form POST to the app's own `/sign-out` action (basename applied by `useHref`), which
 * ends the session at the gateway and clears its cookie. A form, not a link: a GET must never
 * sign anyone out.
 */
const SignOutItem = () => {
  const { t } = useTranslation("auth");
  const action = useHref("/sign-out");
  return (
    <form action={action} aria-label={t("signOut")} method="post">
      <MenuItem asChild className={itemClass}>
        <button className="w-full text-left" type="submit">
          <ArrowLeft aria-hidden="true" />
          {t("signOut")}
        </button>
      </MenuItem>
    </form>
  );
};

/**
 * The avatar and its account menu (H14), in place of the old second Steward lockup (decision
 * 1-brand-and-voice.s3): name and email, Your profile, Notifications, Log out everywhere and
 * Sign out. About and diagnostics stays in the menu so a report can be copied from any page.
 * `avatarClassName` lets the admin header use its lilac avatar (H2).
 */
export const AccountMenu = ({
  avatarClassName,
  links = COMING_SOON,
  trigger,
}: {
  avatarClassName?: string;
  /** Where Notifications and Log out everywhere go until they're built. */
  links?: { logOutEverywhere: string; notifications: string };
  /** Wraps the 32 px avatar, for the phone header's 44 px touch target. */
  trigger?: (avatar: ReactNode) => ReactNode;
}) => {
  const { t } = useTranslation("shell");
  const identity = useIdentity();
  const [aboutOpen, setAboutOpen] = useState(false);
  const avatar = (
    <span
      className={cn(
        "flex size-8 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-on-primary-soft shadow-[inset_0_0_0_1px_var(--border)]",
        avatarClassName,
      )}
    >
      {initialOf(identity)}
    </span>
  );

  return (
    <>
      <Menu>
        <Tooltip content={t("header.accountMenu")}>
          <MenuTrigger asChild>
            <button
              aria-label={t("header.accountMenu")}
              className="flex items-center justify-center rounded-full max-lg:size-11"
              type="button"
            >
              {trigger ? trigger(avatar) : avatar}
            </button>
          </MenuTrigger>
        </Tooltip>
        <MenuContent className="w-[280px] rounded-lg p-1.5">
          <div className="mb-1 flex flex-col border-b border-border p-2.5 text-base">
            <b className="font-semibold">{identity.name || identity.username}</b>
            <span className="text-sm text-muted">{identity.email}</span>
          </div>
          <MenuItem asChild className={itemClass}>
            <Link to="/profile">
              <User aria-hidden="true" />
              {t("account.profile")}
            </Link>
          </MenuItem>
          <MenuItem asChild className={itemClass}>
            <Link to={links.notifications}>
              <Bell aria-hidden="true" />
              {t("account.notifications")}
            </Link>
          </MenuItem>
          <MenuItem asChild className={itemClass}>
            <Link to={links.logOutEverywhere}>
              <Smartphone aria-hidden="true" />
              {t("account.logOutEverywhere")}
            </Link>
          </MenuItem>
          <MenuItem className={itemClass} onSelect={() => setAboutOpen(true)}>
            <Info aria-hidden="true" />
            {t("about.menuEntry")}
          </MenuItem>
          <div className="mt-1 border-t border-border pt-1">
            <SignOutItem />
          </div>
        </MenuContent>
      </Menu>
      <AboutDiagnostics onOpenChange={setAboutOpen} open={aboutOpen} />
    </>
  );
};
