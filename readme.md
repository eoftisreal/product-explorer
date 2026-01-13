# Product Data Explorer

A full-stack product exploration platform that aggregates book data from *World of Books* via real-time scraping. This project features a Next.js frontend, a NestJS backend, and a PostgreSQL database, fully containerized with Docker.

## 🚀 Features
* **Live Scraping**: On-demand data fetching using **Crawlee + Playwright**.
* **Smart Caching**: Deduplicates products by ISBN to prevent redundant scrapes.
* **Job Tracking**: Tracks scrape status (Processing, Completed, Failed) in the database.
* **Relational Data**: "Related Books" engine based on category similarity.
* **User History**: Tracks recently viewed items for session persistence.
* **Interactive API Docs**: Full Swagger/OpenAPI documentation.

---

## 🛠️ Tech Stack
* **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
* **Backend**: NestJS, TypeORM, Crawlee, Playwright
* **Database**: PostgreSQL 15
* **Infrastructure**: Docker, Docker Compose, GitHub Actions (CI)

---

## 🏗️ Architecture & Design Decisions

### 1. Database Choice: PostgreSQL
[cite_start]I chose **PostgreSQL** over MongoDB for this project because the data is highly structured and relational[cite: 34].
* **Integrity**: The relationship between `Categories` and `Products`, as well as `Products` and `ViewHistory`, benefits from foreign key constraints.
* **Complex Queries**: The "Related Books" feature relies on efficient filtering (`WHERE category = X AND id != Y`), which SQL handles natively and performantly.

### 2. Scraping Strategy (Ethical & Efficient)
[cite_start]To respect the target site's resources[cite: 61]:
* [cite_start]**Deduplication**: We use `upsert` based on the unique `sourceId` (ISBN) to update existing records instead of creating duplicates[cite: 41, 59].
* **Rate Limiting**: The crawler is configured with `maxConcurrency: 5` and built-in delays to avoid overwhelming the server.
* **Job Queue**: Scraping is handled asynchronously, tracking job IDs so the UI doesn't freeze while data is being fetched.

### 3. Modular Backend
The NestJS application is split into decoupled modules:
* `ProductsModule`: Handles retrieval, search, and recommendation logic.
* `ScrapeJobsModule`: Manages the lifecycle of scraping tasks.
* `NavigationModule`: Handles category hierarchies.

---

## ⚙️ Getting Started

### Prerequisites
* Docker & Docker Compose
* Git

### 📦 Installation (Docker Method)
The easiest way to run the full stack (Frontend + Backend + Database) is via Docker.

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/YOUR_USERNAME/product-explorer.git](https://github.com/YOUR_USERNAME/product-explorer.git)
    cd product-explorer
    ```

2.  **Start the application**
    ```bash
    docker compose up --build
    ```

3.  **Access the App**
    * **Frontend**: [http://localhost:3001](http://localhost:3001)
    * **Backend API**: [http://localhost:3000/api](http://localhost:3000/api) (Swagger Docs)
    * **Database Admin**: [http://localhost:5050](http://localhost:5050) (pgAdmin)

### 🧪 Seeding Data (For Recommendations)
To see the "Related Books" feature immediately without waiting for a scrape:
1.  Open **pgAdmin** or your preferred SQL tool.
2.  Connect to `localhost:5432` (User: `postgres`, Pass: `password`).
3.  Run the contents of `backend/seed.sql`.

---

## 📝 API Documentation
[cite_start]The API is fully documented using Swagger[cite: 87]. Once the backend is running, visit:
**[http://localhost:3000/api](http://localhost:3000/api)**

### Key Endpoints
* `GET /products`: List all products with pagination.
* `POST /products/scrape`: Trigger a new scrape job.
* `GET /products/:id/related`: Get recommended books based on category.
* `GET /products/history/:sessionId`: Retrieve user browsing history.

---

## 🧪 CI Pipeline
This project includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that automatically:
1.  Installs dependencies for both Frontend and Backend.
2.  Runs build scripts to ensure no type errors or compilation issues exist.
3.  Linting checks (optional configuration).

---

## 📂 Project Structure
```text
product-explorer/
├── frontend/             # Next.js Application
│   ├── app/              # App Router Pages
│   └── components/       # Reusable UI Components
├── backend/              # NestJS Application
│   ├── src/
│   │   ├── products/     # Product Logic & Entities
│   │   ├── scrape-jobs/  # Scraping Job Logic
│   │   └── main.ts       # App Entry (Swagger Setup)
├── docker-compose.yml    # Container Orchestration
└── README.md             # Project Documentation
