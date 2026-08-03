FROM denoland/deno:2.9.4 AS build
RUN apt-get update && apt-get install -y --no-install-recommends nodejs npm \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY deno.json deno.lock ./
COPY content ./content
COPY theme ./theme
COPY scripts ./scripts
RUN deno task build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
