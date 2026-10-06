// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { Trans, useTranslation } from "@steward-web/i18n";
import {
  Banner,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  type Failure,
  Field,
  Input,
} from "@steward-web/ui";
import { Form } from "react-router";

import { useIdentity } from "./IdentityContext";

export interface ProfileNameProps {
  /** Set by the route's action when the save failed; absent once it succeeds and revalidates. */
  error?: Failure;
  /** Set by the route's action right after a successful save. */
  saved?: boolean;
}

/**
 * The "Your name" card of `/profile` (U32): first and last name, with a live preview of how
 * the name will appear. The route's own action calls `updateMyProfile`; a successful submit
 * re-runs the root loader (see each app's `root.tsx` `shouldRevalidate`), so the fields below
 * reseed from the fresh identity — there's no local "pending edit" state to reconcile.
 */
export const ProfileName = ({ error, saved }: ProfileNameProps) => {
  const { t } = useTranslation(["settings", "common"]);
  const identity = useIdentity();
  const displayName = `${identity.firstName} ${identity.lastName}`.trim();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("profile.name.title")}</CardTitle>
      </CardHeader>
      <CardBody className="grid gap-4">
        <p className="text-sm text-muted">{t("profile.name.description")}</p>
        {error ? (
          <Banner failure={error} title={t("profile.name.saveError")} tone="danger" />
        ) : null}
        <Form className="grid gap-4" method="post">
          <Field label={t("profile.name.firstNameLabel")}>
            <Input
              autoComplete="given-name"
              defaultValue={identity.firstName}
              key={identity.firstName}
              name="firstName"
              required
            />
          </Field>
          <Field label={t("profile.name.lastNameLabel")}>
            <Input
              autoComplete="family-name"
              defaultValue={identity.lastName}
              key={identity.lastName}
              name="lastName"
              required
            />
          </Field>
          <p className="text-sm text-muted">
            {displayName ? (
              <Trans
                components={{ name: <span className="font-medium text-ink" /> }}
                i18nKey="settings:profile.name.preview"
                values={{ displayName }}
              />
            ) : (
              t("profile.name.previewEmpty")
            )}
          </p>
          <div>
            <Button type="submit">{t("actions.save", { ns: "common" })}</Button>
          </div>
        </Form>
        {saved ? <p className="text-sm text-ok">{t("profile.name.saved")}</p> : null}
      </CardBody>
    </Card>
  );
};
