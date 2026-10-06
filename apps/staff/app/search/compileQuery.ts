// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// ---------------------------------------------------------------------------
// Query-language parser → predicate. Generic and app-agnostic: a record is a
// `text` blob plus named fields (all pre-lowercased by the caller).
//
// Grammar (Google-style, case-insensitive):
//   orExpr   → andExpr ('OR' andExpr)*       — OR binds looser than AND
//   andExpr  → term term*                    — implicit AND between adjacent terms
//   term     → ('NOT' | '-') term            — negation
//            | '(' orExpr ')'                 — grouping
//            | field ':' value                — scoped: (rec[field] ?? '') contains value
//            | '"phrase"'                     — exact substring against rec.text
//            | word                           — substring against rec.text
//   - "quoted phrases" match as an exact substring.
//   - field:value — value may be quoted; field is lowercased.
//   - Empty / whitespace input matches everything.
// Robust to malformed input (unbalanced parens, trailing operators): never
// throws; degrades to matching what parsed.
// ---------------------------------------------------------------------------

export type SearchRecord = { text: string } & Record<string, string>;

type Predicate = (rec: SearchRecord) => boolean;

type Token =
  | { kind: "FIELD"; name: string; value: string }
  | { kind: "LPAREN" }
  | { kind: "MINUS" }
  | { kind: "NOT" }
  | { kind: "OR" }
  | { kind: "PHRASE"; value: string }
  | { kind: "RPAREN" }
  | { kind: "WORD"; value: string };

const tokenize = (input: string): Token[] => {
  const tokens: Token[] = [];
  const s = input;
  let i = 0;

  // Read a value starting at i: either a "quoted phrase" or a bare run.
  // Returns the value (lowercased) and advances past it.
  const readValue = (): string => {
    if (s[i] === '"') {
      i++; // opening quote
      let v = "";
      while (i < s.length && s[i] !== '"') {
        v += s[i];
        i++;
      }
      if (i < s.length) i++; // closing quote (if present)
      return v.toLowerCase();
    }
    let v = "";
    while (i < s.length && !/\s/.test(s[i]!) && s[i] !== "(" && s[i] !== ")" && s[i] !== ":") {
      v += s[i];
      i++;
    }
    return v.toLowerCase();
  };

  while (i < s.length) {
    const c = s[i]!;
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (c === "(") {
      tokens.push({ kind: "LPAREN" });
      i++;
      continue;
    }
    if (c === ")") {
      tokens.push({ kind: "RPAREN" });
      i++;
      continue;
    }
    if (c === "-") {
      tokens.push({ kind: "MINUS" });
      i++;
      continue;
    }
    if (c === '"') {
      tokens.push({ kind: "PHRASE", value: readValue() });
      continue;
    }

    // Bare run: could be a keyword (OR/NOT), a field:value, or a word.
    const start = i;
    let run = "";
    while (i < s.length && !/\s/.test(s[i]!) && s[i] !== "(" && s[i] !== ")" && s[i] !== ":") {
      run += s[i];
      i++;
    }

    if (s[i] === ":") {
      // field:value
      i++; // colon
      const name = run.toLowerCase();
      const value = readValue();
      tokens.push({ kind: "FIELD", name, value });
      continue;
    }

    const upper = run.toUpperCase();
    if (upper === "OR") {
      tokens.push({ kind: "OR" });
      continue;
    }
    if (upper === "NOT") {
      tokens.push({ kind: "NOT" });
      continue;
    }
    if (run.length === 0) {
      // Defensive: avoid infinite loop on an unexpected char.
      i = start + 1;
      continue;
    }
    tokens.push({ kind: "WORD", value: run.toLowerCase() });
  }

  return tokens;
};

const matchAll: Predicate = () => true;

export const compileQuery = (input: string): Predicate => {
  const tokens = tokenize(input ?? "");
  if (tokens.length === 0) return matchAll;

  let pos = 0;
  const peek = (): Token | undefined => tokens[pos];

  // term → (NOT|MINUS) term | '(' orExpr ')' | FIELD | PHRASE | WORD
  const parseTerm = (): Predicate | null => {
    const t = peek();
    if (!t) return null;

    if (t.kind === "NOT" || t.kind === "MINUS") {
      pos++;
      const inner = parseTerm();
      if (!inner) return null; // trailing operator → ignore
      return (rec) => !inner(rec);
    }

    if (t.kind === "LPAREN") {
      pos++;
      const inner = parseOr();
      if (peek()?.kind === "RPAREN") pos++; // tolerate missing closing paren
      return inner;
    }

    if (t.kind === "RPAREN") {
      return null;
    }

    if (t.kind === "OR") {
      // Stray OR with no left operand — let the caller stop here.
      return null;
    }

    if (t.kind === "FIELD") {
      pos++;
      const { name, value } = t;
      return (rec) => (rec[name] ?? "").includes(value);
    }

    if (t.kind === "PHRASE" || t.kind === "WORD") {
      pos++;
      const value = t.value;
      return (rec) => rec.text.includes(value);
    }

    pos++;
    return null;
  };

  // andExpr → term term*
  const parseAnd = (): Predicate => {
    const preds: Predicate[] = [];
    while (true) {
      const t = peek();
      if (!t || t.kind === "RPAREN" || t.kind === "OR") break;
      const term = parseTerm();
      if (term) preds.push(term);
      else break;
    }
    if (preds.length === 0) return matchAll;
    return (rec) => preds.every((p) => p(rec));
  };

  // orExpr → andExpr ('OR' andExpr)*
  const parseOr = (): Predicate => {
    const branches: Predicate[] = [parseAnd()];
    while (peek()?.kind === "OR") {
      pos++;
      branches.push(parseAnd());
    }
    if (branches.length === 1) return branches[0]!;
    return (rec) => branches.some((b) => b(rec));
  };

  return parseOr();
};
