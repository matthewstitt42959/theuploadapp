# Perry ParcelRunner

A personal API testing tool — like Postman, but lighter and self-hosted. Built with Next.js 14 + React.

> *Delivering APIs with Postal Precision*

---

## Features

- **Send HTTP requests** — GET, POST, PUT, PATCH, DELETE
- **Collections sidebar** — save requests into named groups, load them back with one click
- **Export / Import collections** — share a `perry-collections.json` file with teammates
- **Query params table** — build query strings visually, not by hand
- **Headers table** — manage request headers with enable/disable toggles, persisted to disk
- **Request body editor** — for POST/PUT/PATCH requests
- **Response panel** — status badge, content-type, duration, size, copy to clipboard
- **Recent endpoints** — quick access to the last 5 URLs you hit
- **Notes tab** — auto-saving scratchpad for tokens, payloads, and test notes
- **Corporate proxy support** — custom CA certificate via environment variable

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production (recommended for shared/work use)

```bash
npm install
npm run build
npm start
```

---

## Configuration

Create a `.env.local` file in the project root:

```env
# Path to your corporate CA certificate (optional)
CUSTOM_CA_PATH=C:/path/to/your/certificate/cacert.pem
```

Two runtime config files are **git-ignored** and must be created manually on first install:

| File | Purpose | Initial content |
|------|---------|-----------------|
| `src/lib/user.json` | Persisted request headers | `{ "headers": [] }` |
| `src/lib/collections.json` | Saved request collections | `{ "collections": [] }` |

---

## Transferring to Another Machine

```bash
# Create a ZIP of source files (excludes node_modules and build output)
git archive HEAD --output=perry-parcelrunner.zip
```

Transfer the ZIP via USB, network share, or any company-approved method. On the new machine:

```bash
unzip perry-parcelrunner.zip
npm install
npm run build && npm start
```

Then recreate `.env.local`, `src/lib/user.json`, and `src/lib/collections.json` on the new machine.

**Migrating collections:** use the Export button (↓) in the sidebar on the old machine to download `perry-collections.json`, then use the Import button (↑) on the new machine.

---

## Sharing Collections with Teammates

Each person runs their own local instance. To share a collection:

1. Click the **Export** (↓) button in the Collections sidebar
2. Send the downloaded `perry-collections.json` to your teammate
3. They click **Import** (↑) and select the file — collections merge without overwriting existing ones

---

## Project Structure

```
src/
├── components/
│   ├── HomeComponent.js          # Main UI — state, layout, request orchestration
│   ├── CollectionsSidebar.js     # Collections panel with export/import
│   ├── APIRequestComponent.js    # Sends requests via the proxy
│   ├── TabsComponent.js          # Tab navigation (Home, Params, Headers, Notes)
│   ├── HeaderTabComponent.js     # Header management table
│   ├── ParamsTabComponent.js     # Query params table
│   ├── NotesTab.js               # Auto-saving scratchpad
│   ├── RecentEndpointComponent.js
│   └── Body/
│       ├── RequestBodyComponent.js
│       └── RequestPanel.js       # Response display
├── lib/
│   ├── collectionsStorage.js     # localStorage helper for collections
│   ├── collections.json          # Runtime collections store (git-ignored)
│   └── user.json                 # Runtime headers store (git-ignored)
└── pages/
    ├── index.js
    ├── _app.js
    └── api/
        ├── proxy.js              # Forwards requests to external APIs
        ├── getCollections.js
        ├── saveCollections.js
        ├── getHeaders.js
        └── saveHeaders.js
```

---

## Running Tests

```bash
npm test          # watch mode
npm run test:ci   # single run with coverage
```
