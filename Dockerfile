FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install package manager
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Declare build-time secrets needed by Next.js build
ARG DATABASE_URL
ARG AZURE_TRANSLATOR_KEY
ARG AZURE_TRANSLATOR_REGION
ARG GOOGLE_TRANSLATOR_KEY
ARG AUTH_PORTAL_URL

# Make them available as env vars during `npm run build`
ENV DATABASE_URL=$DATABASE_URL
ENV AZURE_TRANSLATOR_KEY=$AZURE_TRANSLATOR_KEY
ENV AZURE_TRANSLATOR_REGION=$AZURE_TRANSLATOR_REGION
ENV GOOGLE_TRANSLATOR_KEY=$GOOGLE_TRANSLATOR_KEY
ENV VITE_AUTH_PORTAL_URL=$AUTH_PORTAL_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Production image — copy build output and run
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Re-declare ARGs so they are accessible in this stage
ARG DATABASE_URL
ARG AZURE_TRANSLATOR_KEY
ARG AZURE_TRANSLATOR_REGION
ARG GOOGLE_TRANSLATOR_KEY
ARG AUTH_PORTAL_URL

# Bake secrets into the runtime image as ENV variables
# This is what actually makes them available when `node server.js` runs
ENV DATABASE_URL=$DATABASE_URL
ENV AZURE_TRANSLATOR_KEY=$AZURE_TRANSLATOR_KEY
ENV AZURE_TRANSLATOR_REGION=$AZURE_TRANSLATOR_REGION
ENV GOOGLE_TRANSLATOR_KEY=$GOOGLE_TRANSLATOR_KEY
ENV VITE_AUTH_PORTAL_URL=$AUTH_PORTAL_URL

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 80

ENV PORT=80
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
