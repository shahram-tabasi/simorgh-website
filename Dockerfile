# The SIMORGH website image: `next build` in standalone mode, run on distroless.
#
# Base images come through Harbor's proxy-cache projects, like every other
# image on this cluster: the build host reaches Docker Hub and gcr.io only
# through registry.simorghai.com. To build somewhere with direct access:
#
#   --build-arg NODE_IMAGE=node:20.17-bookworm-slim
#   --build-arg RUNTIME_IMAGE=gcr.io/distroless/nodejs20-debian12:nonroot
#
# Build and push (from the repository root):
#
#   buildah bud -t registry.simorghai.com/simorgh/simorgh-website:1.0.0 .
#   buildah push registry.simorghai.com/simorgh/simorgh-website:1.0.0
#
# No `# syntax=` line on purpose: it makes the builder fetch a frontend image
# from Docker Hub first, which Harbor cannot stand in for.
ARG NODE_IMAGE=registry.simorghai.com/docker-proxy/library/node:20.17-bookworm-slim
ARG RUNTIME_IMAGE=registry.simorghai.com/gcr-proxy/distroless/nodejs20-debian12:nonroot

# ── deps ─────────────────────────────────────────────────────────────────────
FROM ${NODE_IMAGE} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# ── build ────────────────────────────────────────────────────────────────────
FROM deps AS build
WORKDIR /app
COPY . .
# Inlined into the bundle at build time, not read at runtime: canonical links,
# sitemap.xml and social cards. A different public address needs a new image.
ARG NEXT_PUBLIC_SITE_URL=https://simorghai.com
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── runtime ──────────────────────────────────────────────────────────────────
FROM ${RUNTIME_IMAGE} AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    SIMORGH_STORAGE_DIR=/data

COPY --from=build /app/.next/standalone/ ./
COPY --from=build /app/.next/static      ./.next/static
COPY --from=build /app/public            ./public

# distroless `nonroot` is uid 65532; the Deployment's fsGroup makes the /data
# volume writable for it.
USER nonroot
EXPOSE 3000
CMD ["server.js"]
