# One image, one app: build --build-arg APP=staff or APP=admin. The runtime stage holds
# both the chosen app's build output and server/ (the shared Node server, run straight from
# its TypeScript source; see server/src/index.ts).
#
# VERSION and COMMIT are stamped into both the client bundle (packages/vite-config's
# buildInfoDefines, read at build time) and the server's Steward-Version / Steward-Commit
# health headers (read from the environment at runtime). Unstamped, they fall back to "dev"
# and "unknown".

FROM node:24-bookworm-slim AS build
ARG APP
ARG VERSION
ARG COMMIT
ENV VERSION=${VERSION}
ENV COMMIT=${COMMIT}
WORKDIR /repo

RUN corepack enable

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages ./packages
COPY apps ./apps
COPY server ./server
COPY tsconfig.base.json types ./
RUN pnpm install --frozen-lockfile --ignore-scripts

RUN test -n "${APP}" || (echo "APP build arg is required (staff or admin)" >&2; exit 1)
RUN pnpm --filter "@steward-web/${APP}" run build

FROM node:24-bookworm-slim AS runtime
ARG APP
ARG VERSION
ARG COMMIT
ENV APP=${APP}
ENV VERSION=${VERSION}
ENV COMMIT=${COMMIT}
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /repo

RUN corepack enable \
  && addgroup --system --gid 1001 steward \
  && adduser --system --uid 1001 --gid 1001 steward

# react-router, react, react-dom and isbot are externalized rather than bundled into the SSR
# output, so Node must resolve them the way pnpm laid them out: a symlink in the app's own
# node_modules (and the server's own, for @react-router/node), not a root-level one, since
# neither app nor the server is a dependency of the workspace root itself.
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/package.json /repo/pnpm-workspace.yaml ./
COPY --from=build /repo/packages ./packages
COPY --from=build /repo/apps/${APP}/build ./apps/${APP}/build
COPY --from=build /repo/apps/${APP}/package.json ./apps/${APP}/package.json
COPY --from=build /repo/apps/${APP}/node_modules ./apps/${APP}/node_modules
COPY --from=build /repo/server/node_modules ./server/node_modules
COPY server ./server

USER steward
EXPOSE 3000
ENTRYPOINT ["node", "server/src/index.ts"]
