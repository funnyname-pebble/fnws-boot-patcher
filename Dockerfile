FROM bun:latest

WORKDIR /app

COPY . .

RUN bun install

CMD ["bun", "run", "index.ts"]