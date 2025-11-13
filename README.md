# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Docker Compose integration

This UI reads backend endpoints from runtime environment variables. Set the following environment variables
for the UI service when you run it via Docker Compose (root `docker-compose.yml`):

- `NUXT_PUBLIC_API_GATEWAY_URL` — URL for `Zipa_APIGateway` (recommended)
- `NUXT_PUBLIC_AUTH_URL` — URL for `ZIPA_Auth` (optional)
- `NUXT_PUBLIC_INVENTORY_API_BASE_URL` — URL for `Zipa_Inventario` (optional)

Example service snippet to include in your root `docker-compose.yml` (do not add this file here):

```yaml
	zipa_ui:
		build:
			context: ./ZIPA_UI
		image: zipa_ui:latest
		environment:
			- NUXT_PUBLIC_API_GATEWAY_URL=http://zipa_apigateway:5000
			- NUXT_PUBLIC_AUTH_URL=http://zipa_auth:3000
			- NUXT_PUBLIC_INVENTORY_API_BASE_URL=http://zipa_inventario:3001
		ports:
			- "3000:3000"
		depends_on:
			- zipa_apigateway
			- zipa_auth
			- zipa_inventario
```

Notes:
- The hostnames in the example match typical Compose service names; adjust them to your actual service names and ports
- These changes are self-contained inside `ZIPA_UI`. The root `docker-compose.yml` can reference the `ZIPA_UI` build context as shown above.
