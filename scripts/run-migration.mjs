const endpoint = process.env.MIGRATION_ENDPOINT || "http://localhost:8788/api/admin/migrate-memories";
const passcode = process.env.MEMORY_PASSCODE;

if (!passcode) {
  console.error("Set MEMORY_PASSCODE before running the migration.");
  process.exit(1);
}

const response = await fetch(endpoint, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ passcode }),
});

const data = await response.json().catch(() => ({}));

if (!response.ok) {
  console.error(data.error || `Migration failed with HTTP ${response.status}`);
  process.exit(1);
}

console.log(JSON.stringify(data, null, 2));
