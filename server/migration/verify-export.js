// codewizards/server/migration/verify-export.js
//
// Re-queries the live database and checks it against a previous export's manifest —
// confirms an export is complete and untampered before trusting it as a migration source.
// Run this immediately after export.js, and again right before cutover once writes are frozen.
//
// Usage: node migration/verify-export.js <timestamp-folder-name>

const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { hashDocs } = require("./lib/hash");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const MODELS_DIR = path.join(__dirname, "..", "models");

const loadModels = () => {
  const byName = {};
  fs.readdirSync(MODELS_DIR)
    .filter((file) => file.endsWith(".js"))
    .forEach((file) => {
      const model = require(path.join(MODELS_DIR, file));
      byName[model.modelName] = model;
    });
  return byName;
};

const run = async () => {
  const folder = process.argv[2];
  if (!folder) {
    console.error("Usage: node migration/verify-export.js <timestamp-folder-name>");
    process.exit(1);
  }

  const exportDir = path.join(__dirname, "exports", folder);
  const manifestPath = path.join(exportDir, "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    console.error(`No manifest.json found at ${manifestPath}`);
    process.exit(1);
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

  await mongoose.connect(process.env.MONGO_URI);
  console.log(`Connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
  console.log(`Verifying export from ${manifest.exportedAt}\n`);

  const models = loadModels();
  let allPassed = true;

  for (const [modelName, entry] of Object.entries(manifest.collections)) {
    const model = models[modelName];
    if (!model) {
      console.log(`  ${modelName.padEnd(20)} SKIP (model no longer exists in codebase)`);
      continue;
    }

    const liveDocs = await model.find({}).lean();
    const liveHash = hashDocs(liveDocs);
    const countMatches = liveDocs.length === entry.count;
    const hashMatches = liveHash === entry.sha256;
    const passed = countMatches && hashMatches;
    allPassed = allPassed && passed;

    const status = passed ? "PASS" : "FAIL";
    console.log(
      `  ${modelName.padEnd(20)} ${status}  (export: ${entry.count} docs, live: ${liveDocs.length} docs)`
    );
    if (!countMatches) {
      console.log(`      -> count differs — the database has changed since this export was taken`);
    } else if (!hashMatches) {
      console.log(`      -> counts match but content differs — some documents were edited since export`);
    }
  }

  console.log(allPassed ? "\nAll collections verified — export is trustworthy." : "\nMismatches found — re-run export.js before migrating.");

  await mongoose.disconnect();
  process.exit(allPassed ? 0 : 1);
};

run().catch((error) => {
  console.error("Verification failed:", error);
  process.exit(1);
});
