// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { Field, Input, Select } from "@steward-web/ui";

export const NO_CATEGORY = "__no_category__";

/** D25's create-template fields: a name and the top-level category that owns it. */
export const NewTemplateFields = ({
  categories,
}: {
  categories: readonly { id: string; name: string }[];
}) => {
  const { t } = useTranslation("admin");
  return (
    <>
      <Field label={t("templates.add.name")}>
        <Input name="name" required />
      </Field>
      <Field label={t("templates.add.category")}>
        <Select
          defaultValue={NO_CATEGORY}
          name="ownerCategoryId"
          options={[
            { label: t("templates.add.noCategory"), value: NO_CATEGORY },
            ...categories.map((c) => ({ label: c.name, value: c.id })),
          ]}
        />
      </Field>
    </>
  );
};
