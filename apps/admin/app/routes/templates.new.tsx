// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { refusalOf } from "@steward-web/shell";
import { Banner, Button, Field, Input, PageHeader, Select } from "@steward-web/ui";
import { data, Form, Link, redirect } from "react-router";

import type { Route } from "./+types/templates.new";

import { listGroups } from "../groups/groups.server";
import { createTemplate } from "../templates/templates.server";

const NO_CATEGORY = "__no_category__";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const groups = await listGroups(request);
  // A template's category maps to a top-level taxonomy group: a fixed choice, not free text.
  return { categories: groups.filter((g) => !g.parentId) };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim();
  const ownerCategoryId = String(form.get("ownerCategoryId") ?? NO_CATEGORY);

  if (!name) {
    return data({ ok: false, validationError: "Name is required." } as const, { status: 400 });
  }

  try {
    const created = await createTemplate(
      request,
      name,
      ownerCategoryId === NO_CATEGORY ? null : ownerCategoryId,
    );
    return redirect(`/templates/${created.code}`);
  } catch (error) {
    return data({ failure: refusalOf(error), ok: false } as const, { status: 400 });
  }
};

export default function NewTemplate({ actionData, loaderData }: Route.ComponentProps) {
  const { categories } = loaderData;

  return (
    <div className="flex w-full max-w-xl flex-col gap-6 p-6">
      <PageHeader
        eyebrow="Structure"
        subtitle="Start a reusable document skeleton."
        title="New template"
      />

      <Form className="flex flex-col gap-4" method="post">
        <Field label="Name">
          <Input name="name" required />
        </Field>
        <Field
          hint="Templates have no category of their own yet; choose one, or leave it unset."
          label="Category"
        >
          <Select
            defaultValue={NO_CATEGORY}
            name="ownerCategoryId"
            options={[
              { label: "No category", value: NO_CATEGORY },
              ...categories.map((c) => ({ label: c.name, value: c.id })),
            ]}
          />
        </Field>

        {actionData && !actionData.ok && "validationError" in actionData ? (
          <Banner title="Couldn't create this template" tone="danger">
            {actionData.validationError}
          </Banner>
        ) : null}
        {actionData && !actionData.ok && "failure" in actionData ? (
          <Banner
            failure={actionData.failure}
            title="Couldn't create this template"
            tone="danger"
          />
        ) : null}

        <div className="flex items-center gap-2">
          <Button type="submit">Create template</Button>
          <Button asChild variant="secondary">
            <Link to="/templates">Cancel</Link>
          </Button>
        </div>
      </Form>
    </div>
  );
}
