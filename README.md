# 🛍️ Juvino Store API

This repository provides a backend service to integrate with a Shopify store.
Built with **NestJS**, **Drizzle ORM**, and **PostgreSQL**, and containerized with **Docker**.

## ✨ Features

1. Authenticate with a Shopify store
2. Register webhooks
3. Handle incoming webhooks
4. Manage customer orders

---


## 📚 API Endpoints

### Shopify Authentication

* **GET** `/auth/shopify?shop={shop}`
  Redirects the user to Shopify’s authentication page.

  * Query Parameters:

    * `shop` (string) - Shopify store domain (e.g., `example.myshopify.com`)
  * Response: Redirect to Shopify login.

* **GET** `/auth/shopify/callback?shop={shop}&code={code}&hmac={hmac}`
  Callback URL after Shopify authentication. Validates the store, exchanges the code for an access token, stores the shop info, and registers the webhook.

  * Query Parameters:

    * `shop` (string) - store domain
    * `code` (string) - Shopify authorization code
    * `hmac` (string) - security hash for verification
  * Response: Success message.

* **GET** `/auth/shopify/webhooks?shop={shop}`
  Retrieves a list of all registered webhooks for the specified shop.

  * Query Parameters:

    * `shop` (string) - store domain
  * Response: JSON list of webhooks.

* **DELETE** `/auth/shopify/webhooks?shop={shop}`
  Deletes all registered webhooks for the specified shop.

  * Query Parameters:

    * `shop` (string) - store domain
  * Response: Success message.

---

### Orders

* **GET** `/orders`
  Returns a list of orders with details.

  * Response: JSON array of orders.

---

### Webhooks

* **POST** `/webhooks/orders/create`
  Endpoint to receive Shopify order creation webhooks.

  * Headers:

    * `x-shopify-shop-domain` (string) - store domain sending the webhook
  * Body: JSON payload with order data (from Shopify)
  * Response: Confirmation message or validation error.

## 🚀 Getting Started

### 1. Ngrok

Para expor sua aplicação local na internet, você deve executar o ngrok e obter sua URL pública.

Execute o comando abaixo, substituindo a porta pelo valor configurado na sua variável de ambiente `PORT` (por padrão, usamos a porta `3001`):

```sh
ngrok http 3001
```

**Importante:** Use a URL pública gerada pelo ngrok para preencher as variáveis no seu arquivo `.env`. Além disso, essa mesma URL precisa ser configurada no painel do Shopify Partners, nos campos de callback da sua app.

O formato do callback URL deve ser:

```txt
https://<your-public-url>/auth/shopify/callback
```

### 2. Environment Variables

First, copy the example environment file:

```sh
cp .env.example .env
```

Then fill in the required values in `.env`. Some are already pre-filled to simplify setup.

| Variable                    | Description                                                                          |
| --------------------------- | ------------------------------------------------------------------------------------ |
| `PORT`                      | Local API port (e.g., `3001`)                                                        |
| `SHOPIFY_API_KEY`           | Your Shopify app's public key (from the Partners dashboard)                          |
| `SHOPIFY_API_SECRET`        | Your Shopify app's private secret                                                    |
| `SHOPIFY_SCOPES`            | Requested permissions, e.g., `read_products,write_products,read_orders,write_orders` |
| `SHOPIFY_REDIRECT_URI`      | Shopify OAuth callback URL. Must match your app config                               |
| `DB_HOST`                   | PostgreSQL host (e.g., `db` when using Docker)                                       |
| `DB_PORT`                   | PostgreSQL port (default `5433`)                                                     |
| `DB_USER`                   | Database username (usually `postgres`)                                               |
| `DB_PASS`                   | Database password                                                                    |
| `DB_NAME`                   | Name of the main database                                                            |
| `WEBHOOK_ORDERS_CREATE_URL` | Public URL to receive `orders/create` webhook from Shopify                           |

---

### 3. Install Dependencies

```sh
npm install
```

### 4. Create the Database

To create the database, run the following command:

```sh
psql -h localhost -p 5433 -U postgres -c "CREATE DATABASE shopify_app;"
```

This will connect to your local PostgreSQL server and create a new database named `shopify_app`.

```markdown
> 💡 You may be prompted to enter your PostgreSQL password.
```

### 5. Run Migrations

To generate and apply the database schema:

```sh
npx drizzle-kit generate
npx drizzle-kit migrate
```

---

### 6. Start the App

```sh
npm run start:dev
```

---

## 🧪 Running Tests

### 1. Configure Environment Variables

First, create a copy of the `.env` file for testing purposes:

```sh
cp .env .env.test
```

Then, update the following variables in the `.env.test` file to use your test database settings:

```env
DB_PORT=5434
DB_PASS=<your-db-password>
DB_NAME=shopify_app_test
```

### 2. Start the test database

```sh
docker compose up -d db_test
```

### 3. Prepare test DB

Generate and run migrations for the test environment:

```sh
DOTENV_CONFIG_PATH=.env.test npx drizzle-kit generate
DOTENV_CONFIG_PATH=.env.test npx drizzle-kit migrate
```

### 4. Run the tests

* **Integration tests:**

```sh
NODE_ENV=test npm run test:e2e
```

* **Unit tests:**

```sh
npm run test
```
---

## 🐳 Running with Docker

To spin up the entire stack using Docker:

```sh
docker compose up -d
```

To generate and apply the database schema:

```sh
npx drizzle-kit generate
npx drizzle-kit migrate
```

This will start:

* `db` – the PostgreSQL database
* `api` – the NestJS application
