// codewizards/server/migration/export.js
//
// Read-only snapshot of every collection to timestamped JSON, for migrating off MongoDB.
// Never writes to the database — safe to run against production at any time.
//
// Usage: node migration/export.js
// Output: migration/exports/<timestamp>/<CollectionName>.json + manifest.json

const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { hashDocs } = require("./lib/hash");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const MODELS_DIR = path.join(__dirname, "..", "models");

const loadModels = () => {
  return fs
    .readdirSync(MODELS_DIR)
    .filter((file) => file.endsWith(".js"))
    .map((file) => require(path.join(MODELS_DIR, file)));
};

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log(`Connected: ${mongoose.connection.host}/${mongoose.connection.name}`);

  const models = loadModels();
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outDir = path.join(__dirname, "exports", timestamp);
  fs.mkdirSync(outDir, { recursive: true });

  const manifest = {
    exportedAt: new Date().toISOString(),
    mongoHost: mongoose.connection.host,
    dbName: mongoose.connection.name,
    collections: {},
  };

  for (const model of models) {
    const docs = await model.find({}).lean();
    const fileName = `${model.modelName}.json`;
    fs.writeFileSync(path.join(outDir, fileName), JSON.stringify(docs, null, 2));

    manifest.collections[model.modelName] = {
      collectionName: model.collection.name,
      count: docs.length,
      sha256: hashDocs(docs),
      file: fileName,
    };

    console.log(`  ${model.modelName.padEnd(20)} ${String(docs.length).padStart(6)} docs`);
  }

  fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log(`\nExport written to ${outDir}`);
  console.log(`Run "node migration/verify-export.js ${timestamp}" to confirm it matches the live database.`);

  await mongoose.disconnect();
};

run().catch((error) => {
  console.error("Export failed:", error);
  process.exit(1);
});
