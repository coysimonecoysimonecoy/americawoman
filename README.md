# Iya's Return

Static Cloudflare Pages app recovered from the live Vercel deployment, with the map/memories UI restored and storage moved to Cloudflare D1 + KV media storage.

The Memories button opens a full-screen collage editor. The editor saves project JSON to D1 and uploaded collage assets to the existing Cloudflare media binding.

## Local Setup

1. Install dependencies:

   ```powershell
   npm install
   ```

2. Create local secrets:

   ```powershell
   Copy-Item .dev.vars.example .dev.vars
   ```

   Edit `.dev.vars` and set `MEMORY_PASSCODE`.

3. Apply the local D1 schema:

   ```powershell
   npm run db:schema:local
   ```

4. Start the Pages dev server:

   ```powershell
   npm run dev
   ```

## Cloudflare Setup

Create these resources in Cloudflare:

```powershell
wrangler d1 create iyas_return
wrangler kv namespace create MEMORY_MEDIA --binding MEMORY_MEDIA
```

Put the generated D1 `database_id` and KV `id` into `wrangler.toml`, then apply the remote schema:

```powershell
npm run db:schema:remote
```

Set the `MEMORY_PASSCODE` secret in the Cloudflare Pages project before deploying.

R2 is still supported by the media helper, but this account has to enable R2 in the Cloudflare dashboard before a bucket can be created. KV is the active Cloudflare storage binding so the app can deploy without waiting on R2 setup.

## Collage Editor API

- `GET /api/collage/project?id=default` returns the public saved project, seeded from legacy collage photos if no project exists yet.
- `PUT /api/collage/project` saves the project and requires `MEMORY_PASSCODE`.
- `POST /api/collage/assets` uploads one or more images and requires `MEMORY_PASSCODE`.
- `DELETE /api/collage/assets` removes an uploaded media object and requires `MEMORY_PASSCODE`.

## Migration

After the Cloudflare site or local Pages dev server is running with real Cloudflare bindings:

```powershell
$env:MEMORY_PASSCODE="your-passcode"
npm run migrate:memories
```

Set `MIGRATION_ENDPOINT` if the endpoint is not local:

```powershell
$env:MIGRATION_ENDPOINT="https://your-cloudflare-site.pages.dev/api/admin/migrate-memories"
```

If the migration reports `HTTP 403` for Vercel Blob URLs, the old blob store is not publicly downloadable. In that case, rerun after restoring Vercel Blob access or upload the original image files through the restored memories UI.
