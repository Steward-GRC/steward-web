// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { SectionInput, TemplateVersion } from "@steward-web/api-client";

import { refusalOf } from "@steward-web/shell";
import {
  Badge,
  Banner,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  EmptyState,
  type Failure,
  Field,
  Input,
  PageHeader,
  Table,
  TD,
  TH,
  THead,
} from "@steward-web/ui";
import { useState } from "react";
import { data, Form, Link, redirect } from "react-router";

import type { Route } from "./+types/templates.$code";

import { SectionOutlineEditor } from "../templates/SectionOutlineEditor";
import {
  createTemplateVersion,
  deleteTemplate,
  discardTemplateVersion,
  findTemplateByCode,
  listTemplateVersions,
  publishTemplateVersion,
  renameTemplate,
  retireTemplate,
  updateTemplateVersionSections,
} from "../templates/templates.server";

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const template = await findTemplateByCode(request, params.code);
  if (!template) return { template: null, versions: [] };
  const versions = await listTemplateVersions(request, template.id);
  return { template, versions };
};

export const action = async ({ params, request }: Route.ActionArgs) => {
  const template = await findTemplateByCode(request, params.code);
  if (!template) throw new Response("Not Found", { status: 404 });
  const form = await request.formData();
  const intent = form.get("intent");

  try {
    switch (intent) {
      case "create-version": {
        const versions = await listTemplateVersions(request, template.id);
        const base = versions.find((v) => v.status === "published")?.sections ?? [];
        await createTemplateVersion(request, template.id, base);
        return data({ intent, ok: true } as const);
      }
      case "delete": {
        await deleteTemplate(request, template.id);
        return redirect("/templates");
      }
      case "discard-draft": {
        await discardTemplateVersion(request, String(form.get("versionId") ?? ""));
        return data({ intent, ok: true } as const);
      }
      case "publish": {
        await publishTemplateVersion(request, String(form.get("versionId") ?? ""));
        return data({ intent, ok: true } as const);
      }
      case "rename": {
        const name = String(form.get("name") ?? "").trim();
        if (!name) {
          return data({ intent, ok: false, validationError: "A name is required." } as const, {
            status: 400,
          });
        }
        await renameTemplate(request, template.id, name);
        return data({ intent, ok: true } as const);
      }
      case "retire": {
        await retireTemplate(request, template.id);
        return redirect("/templates");
      }
      case "save-sections": {
        const sections = JSON.parse(
          String(form.get("sectionsJson") ?? "[]"),
        ) as readonly SectionInput[];
        await updateTemplateVersionSections(request, String(form.get("versionId") ?? ""), sections);
        return data({ intent, ok: true } as const);
      }
      default: {
        throw data("unrecognized intent", { status: 400 });
      }
    }
  } catch (error) {
    return data({ failure: refusalOf(error), intent: String(intent), ok: false } as const, {
      status: 400,
    });
  }
};

interface DraftSectionsPanelProps {
  onDiscard: () => void;
  publishError?: Failure;
  saved: boolean;
  saveError?: Failure;
  version: TemplateVersion;
}

/** Keyed on the draft's id by its caller, so a freshly created or discarded draft always
 *  starts from its own (server-given) sections rather than a stale edit. */
const DraftSectionsPanel = ({
  onDiscard,
  publishError,
  saved,
  saveError,
  version,
}: DraftSectionsPanelProps) => {
  const [sections, setSections] = useState<readonly SectionInput[]>(version.sections);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">
        Use the arrows to reorder; indent/outdent sets the heading level (H1-H5); toggle required.
        Each section can carry optional boilerplate body text.
      </p>

      <SectionOutlineEditor initialSections={version.sections} onChange={setSections} />

      <Form className="flex items-center gap-3" method="post">
        <input name="intent" type="hidden" value="save-sections" />
        <input name="versionId" type="hidden" value={version.id} />
        <input name="sectionsJson" type="hidden" value={JSON.stringify(sections)} />
        {saveError ? (
          <Banner failure={saveError} title="Couldn't save these sections" tone="danger" />
        ) : null}
        <Button size="sm" type="submit">
          Save sections
        </Button>
        {saved ? <span className="text-sm text-ok">Saved.</span> : null}
      </Form>

      <div className="flex items-center gap-2 border-t border-border pt-4">
        <Form method="post">
          <input name="intent" type="hidden" value="publish" />
          <input name="versionId" type="hidden" value={version.id} />
          <Button size="sm" type="submit">
            Publish version
          </Button>
        </Form>
        <Button onClick={onDiscard} size="sm" variant="danger">
          Discard draft
        </Button>
      </div>
      {publishError ? (
        <Banner failure={publishError} title="Couldn't publish this version" tone="danger" />
      ) : null}
    </div>
  );
};

export default function TemplateDetail({ actionData, loaderData }: Route.ComponentProps) {
  const { template, versions } = loaderData;
  const [retireOpen, setRetireOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);

  if (!template) {
    return (
      <div className="flex w-full flex-col gap-6 p-6">
        <EmptyState
          action={
            <Button asChild>
              <Link to="/templates">Back to templates</Link>
            </Button>
          }
          description="No template matches that code."
          title="Template not found"
        />
      </div>
    );
  }

  const headVersion = versions[0] ?? null;
  const hasDraftHead = headVersion?.status === "draft";

  const errorFor = (intent: string) =>
    actionData && !actionData.ok && actionData.intent === intent && "failure" in actionData
      ? actionData.failure
      : undefined;
  const validationErrorFor = (intent: string) =>
    actionData && !actionData.ok && actionData.intent === intent && "validationError" in actionData
      ? actionData.validationError
      : undefined;
  const savedIntent = actionData?.ok ? actionData.intent : undefined;

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <Button asChild className="self-start px-0" size="sm" variant="link">
        <Link to="/templates">← Back to templates</Link>
      </Button>

      <PageHeader
        actions={
          <div className="flex items-center gap-2">
            <Button onClick={() => setRetireOpen(true)} size="sm" variant="secondary">
              Retire
            </Button>
            <Button onClick={() => setDeleteOpen(true)} size="sm" variant="danger">
              Delete
            </Button>
          </div>
        }
        eyebrow="Structure"
        subtitle={template.code}
        title={
          <span className="flex items-center gap-2">
            {template.name}
            {template.retiredAt ? <Badge tone="neutral">Retired</Badge> : null}
          </span>
        }
      />

      <Dialog onOpenChange={setRetireOpen} open={retireOpen}>
        <DialogContent
          description="It will no longer be offered when creating new policies. Policies already using it keep working unchanged."
          title={`Retire ${template.name}?`}
        >
          <Form method="post">
            <input name="intent" type="hidden" value="retire" />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">Cancel</Button>
              </DialogClose>
              <Button type="submit" variant="danger">
                Retire template
              </Button>
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog onOpenChange={setDeleteOpen} open={deleteOpen}>
        <DialogContent
          description="Physically removes the template and its versions. Fails if any policy references it — retire it instead."
          title={`Delete ${template.name}?`}
        >
          <Form method="post">
            <input name="intent" type="hidden" value="delete" />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">Cancel</Button>
              </DialogClose>
              <Button type="submit" variant="danger">
                Delete permanently
              </Button>
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>

      {errorFor("retire") ? (
        <Banner failure={errorFor("retire")} title="Couldn't retire this template" tone="danger" />
      ) : null}
      {errorFor("delete") ? (
        <Banner failure={errorFor("delete")} title="Couldn't delete this template" tone="danger" />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Rename</CardTitle>
        </CardHeader>
        <CardBody>
          <Form className="flex flex-col gap-4" method="post">
            <input name="intent" type="hidden" value="rename" />
            <Field label="Name">
              <Input defaultValue={template.name} name="name" required />
            </Field>
            {validationErrorFor("rename") ? (
              <Banner title="Couldn't rename this template" tone="danger">
                {validationErrorFor("rename")}
              </Banner>
            ) : null}
            {errorFor("rename") ? (
              <Banner
                failure={errorFor("rename")}
                title="Couldn't rename this template"
                tone="danger"
              />
            ) : null}
            <Button className="self-start" type="submit">
              Rename
            </Button>
            {savedIntent === "rename" ? <p className="text-sm text-ok">Renamed.</p> : null}
          </Form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardBody>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs uppercase tracking-wide text-muted">Versions</dt>
              <dd>
                <Badge tone="neutral">{versions.length}</Badge>
              </dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs uppercase tracking-wide text-muted">Latest status</dt>
              <dd>
                {headVersion ? (
                  <Badge tone={headVersion.status === "published" ? "ok" : "neutral"}>
                    {headVersion.status}
                  </Badge>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </dd>
            </div>
          </dl>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current draft</CardTitle>
          <Form method="post">
            <input name="intent" type="hidden" value="create-version" />
            <Button
              disabled={hasDraftHead}
              size="sm"
              title={
                hasDraftHead
                  ? "Finish or discard the current draft first — only one draft at a time"
                  : undefined
              }
              type="submit"
              variant="secondary"
            >
              Create version
            </Button>
          </Form>
        </CardHeader>
        <CardBody>
          {errorFor("create-version") ? (
            <Banner
              failure={errorFor("create-version")}
              title="Couldn't start a new version"
              tone="danger"
            />
          ) : null}

          {!headVersion || !hasDraftHead ? (
            <p className="text-sm text-muted">
              No draft in progress. Click &quot;Create version&quot; to start one.
            </p>
          ) : (
            <DraftSectionsPanel
              key={headVersion.id}
              onDiscard={() => setDiscardOpen(true)}
              publishError={errorFor("publish")}
              saved={savedIntent === "save-sections"}
              saveError={errorFor("save-sections")}
              version={headVersion}
            />
          )}
        </CardBody>
      </Card>

      <Dialog onOpenChange={setDiscardOpen} open={discardOpen}>
        <DialogContent
          description={`This permanently deletes the draft version of ${template.name}. Published versions are unaffected.`}
          title="Discard this draft version?"
        >
          <Form method="post">
            <input name="intent" type="hidden" value="discard-draft" />
            <input name="versionId" type="hidden" value={headVersion?.id ?? ""} />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">Keep draft</Button>
              </DialogClose>
              <Button type="submit" variant="danger">
                Discard draft
              </Button>
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>
      {errorFor("discard-draft") ? (
        <Banner
          failure={errorFor("discard-draft")}
          title="Couldn't discard this draft"
          tone="danger"
        />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Version history</CardTitle>
        </CardHeader>
        <CardBody>
          {versions.length === 0 ? (
            <p className="text-sm text-muted">No versions yet.</p>
          ) : (
            <Table>
              <THead>
                <tr>
                  <TH>Version</TH>
                  <TH>Status</TH>
                  <TH>Sections</TH>
                </tr>
              </THead>
              <tbody>
                {versions.map((version) => (
                  <tr key={version.id}>
                    <TD>{version.versionNo}</TD>
                    <TD>
                      <Badge tone={version.status === "published" ? "ok" : "neutral"}>
                        {version.status}
                      </Badge>
                    </TD>
                    <TD>{version.sections.length}</TD>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
