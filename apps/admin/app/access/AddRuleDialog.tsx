// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { RaciSubjectKind } from "@steward-web/api-client";
import { useTranslation } from "@steward-web/i18n";
import {
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
  Field,
  Input,
  RadioGroup,
  RadioItem,
  Select,
} from "@steward-web/ui";
import { type FormEvent, useState } from "react";

import type { AccessPerson } from "./access.server";

const KINDS = [RaciSubjectKind.Everyone, RaciSubjectKind.Group, RaciSubjectKind.User] as const;

export interface AddRuleDialogProps {
  disabled?: boolean;
  onAdd: (subjectKind: RaciSubjectKind, subjectRef: string) => void;
  people: readonly AccessPerson[];
}

/**
 * "+ Add rule" (A5) in the standard dialog frame: who the rule is for (everyone, a directory
 * group by name, or one person), then the rule joins the bottom of the category's own rules
 * with every action blank, ready to be filled in and moved.
 */
export const AddRuleDialog = ({ disabled, onAdd, people }: AddRuleDialogProps) => {
  const { t } = useTranslation("admin");
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<RaciSubjectKind>(RaciSubjectKind.Group);
  const [group, setGroup] = useState("");
  const [person, setPerson] = useState("");

  const subjectRef =
    kind === RaciSubjectKind.Group ? group.trim() : kind === RaciSubjectKind.User ? person : "";
  const ready = kind === RaciSubjectKind.Everyone || subjectRef !== "";

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!ready) return;
    onAdd(kind, subjectRef);
    setOpen(false);
    setGroup("");
    setPerson("");
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button
          className="ml-auto h-8 px-3 text-sm"
          disabled={disabled}
          size="sm"
          variant="secondary"
        >
          {t("access.rules.add")}
        </Button>
      </DialogTrigger>
      <DialogContent
        description={t("access.addRule.description")}
        hasInput
        title={t("access.addRule.title")}
      >
        <form onSubmit={submit}>
          <DialogBody>
            <fieldset className="grid gap-1.5">
              <legend className="mb-1.5 text-sm font-semibold">{t("access.addRule.kind")}</legend>
              <RadioGroup
                className="flex flex-wrap gap-4"
                onValueChange={(value) => setKind(value as RaciSubjectKind)}
                value={kind}
              >
                {KINDS.map((entry) => (
                  <RadioItem key={entry} value={entry}>
                    {t(`access.rules.kinds.${entry}`)}
                  </RadioItem>
                ))}
              </RadioGroup>
            </fieldset>
            {kind === RaciSubjectKind.Group ? (
              <Field hint={t("access.addRule.groupHint")} label={t("access.addRule.groupName")}>
                <Input
                  autoComplete="off"
                  onChange={(event) => setGroup(event.target.value)}
                  value={group}
                />
              </Field>
            ) : null}
            {kind === RaciSubjectKind.User ? (
              <Field label={t("access.addRule.person")}>
                <Select
                  onValueChange={setPerson}
                  options={people.map((entry) => ({
                    label: t("access.simulator.personOption", {
                      email: entry.email,
                      name: entry.name,
                    }),
                    value: entry.id,
                  }))}
                  placeholder={t("access.addRule.personPlaceholder")}
                  value={person}
                />
              </Field>
            ) : null}
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">{t("access.addRule.cancel")}</Button>
            </DialogClose>
            <Button disabled={!ready} type="submit">
              {t("access.addRule.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
