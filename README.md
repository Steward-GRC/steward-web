# steward-web 🧭

> 🖥️ Web apps for Steward: the staff and admin apps, the docs guide and the UI kit

Steward keeps your organisation's rules in one place and gives everyone a safe way to speak up.
This repo holds its web front ends, one pnpm workspace with a separate server image per app.

## 🛠️ Develop

```bash
corepack enable pnpm
pnpm install --ignore-scripts
pnpm run check     # lint, typecheck, unit tests and builds
```

## 📚 Documentation

- [The authoring editor](docs/authoring-editor.md): what staff get, the draft format and
  co-editing.
- [`docs/configuration.md`](docs/configuration.md) — every build argument and environment variable, with its default
- [`docs/development.md`](docs/development.md) — the workspace, the codegen step and the mock build
- [`docs/runbook.md`](docs/runbook.md) — the health probes, reading the build info, and calling other services
- [`apps/docs`](apps/docs): the plain-language Steward guide for staff and administrators, a
  Docusaurus site. Run it with `pnpm --filter @steward-web/docs run dev`.

## 🤝 Contributing

Read the org's [CONTRIBUTING](https://github.com/Steward-GRC/.github/blob/main/.github/CONTRIBUTING.md) and
[SECURITY](https://github.com/Steward-GRC/.github/blob/main/.github/SECURITY.md) guides. Every commit is
signed off (DCO).

## 🙏 Acknowledgements

Steward was originally written by [@Bugs5382](https://github.com/Bugs5382).

## ⚖️ License

Apache-2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
