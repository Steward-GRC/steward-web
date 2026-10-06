// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { refusalOf } from "@steward-web/shell";
import { Banner, Button, Field, Input, PageHeader, Select } from "@steward-web/ui";
import { data, Form, Link, redirect } from "react-router";

import type { Route } from "./+types/groups.new";

import {
  createGroup,
  isValidSlug,
  listGroups,
  orderedWithPaths,
  slugify,
} from "../groups/groups.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const groups = await listGroups(request);
  return { parentOptions: orderedWithPaths(groups) };
};

const TOP_LEVEL = "__top_level__";

export const action = async ({ request }: Route.ActionArgs) => {
  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim();
  const rawSlug = String(form.get("slug") ?? "").trim();
  const slug = rawSlug || slugify(name);
  const parentId = String(form.get("parentId") ?? TOP_LEVEL);

  if (!name) {
    return data({ ok: false, validationError: "Name is required." } as const, { status: 400 });
  }
  if (!isValidSlug(slug)) {
    return data(
      {
        ok: false,
        validationError:
          "Lowercase letters, numbers, and single hyphens only (no leading/trailing hyphen).",
      } as const,
      { status: 400 },
    );
  }

  try {
    const created = await createGroup(request, {
      name,
      parentId: parentId === TOP_LEVEL ? null : parentId,
      slug,
    });
    return redirect(`/groups/${created.id}`);
  } catch (error) {
    return data({ failure: refusalOf(error), ok: false } as const, { status: 400 });
  }
};

export default function NewGroup({ actionData, loaderData }: Route.ComponentProps) {
  const { parentOptions } = loaderData;

  return (
    <div className="flex w-full max-w-xl flex-col gap-6 p-6">
      <PageHeader eyebrow="Access" subtitle="Add a group to the org hierarchy." title="New group" />

      <Form className="flex flex-col gap-4" method="post">
        <Field label="Name">
          <Input name="name" required />
        </Field>
        <Field
          hint="Derived from the name when left blank. Lowercase letters, numbers and hyphens only."
          label="Slug"
        >
          <Input name="slug" placeholder="auto-generated" />
        </Field>
        <Field label="Parent">
          <Select
            defaultValue={TOP_LEVEL}
            name="parentId"
            options={[
              { label: "Top level (no parent)", value: TOP_LEVEL },
              ...parentOptions.map((o) => ({ label: o.path, value: o.id })),
            ]}
          />
        </Field>

        {actionData && !actionData.ok && "validationError" in actionData ? (
          <Banner title="Couldn't create this group" tone="danger">
            {actionData.validationError}
          </Banner>
        ) : null}
        {actionData && !actionData.ok && "failure" in actionData ? (
          <Banner failure={actionData.failure} title="Couldn't create this group" tone="danger" />
        ) : null}

        <div className="flex items-center gap-2">
          <Button type="submit">Create group</Button>
          <Button asChild variant="secondary">
            <Link to="/groups">Cancel</Link>
          </Button>
        </div>
      </Form>
    </div>
  );
}
