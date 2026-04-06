FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY tools/mcp-server/package.json tools/mcp-server/package-lock.json* ./
RUN npm ci

# Copy WEFT schemas for type generation
COPY 02-material/material.schema.json /app/schemas/02-material/material.schema.json
COPY 03-project/project.schema.json /app/schemas/03-project/project.schema.json
COPY 05-tool/tool.schema.json /app/schemas/05-tool/tool.schema.json
COPY 06-pattern/pattern.schema.json /app/schemas/06-pattern/pattern.schema.json
COPY 08-queue/queue.schema.json /app/schemas/08-queue/queue.schema.json
COPY 09-favorite/favorite.schema.json /app/schemas/09-favorite/favorite.schema.json
COPY 11-library/library.schema.json /app/schemas/11-library/library.schema.json
COPY 12-shop/shop.schema.json /app/schemas/12-shop/shop.schema.json
COPY 13-designer/designer.schema.json /app/schemas/13-designer/designer.schema.json

# Copy source
COPY tools/mcp-server/tsconfig.json ./
COPY tools/mcp-server/scripts/ scripts/
COPY tools/mcp-server/src/ src/

RUN npm run build

FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/package.json /app/package-lock.json* ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist/ dist/

ENV MCP_PORT=3000
EXPOSE 3000

CMD ["node", "dist/server.js"]
