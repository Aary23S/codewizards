const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const localDb = mongoose.connection.client.db("local");
  const oplog = localDb.collection("oplog.rs");
  
  // Find delete operations or insert operations in the test database collections
  const ops = await oplog.find({
    ns: { $regex: /^test\./ }
  }).toArray();

  console.log(`Found ${ops.length} operations in oplog for "test" database:`);
  
  ops.forEach((op, index) => {
    console.log(`\nOperation #${index}: op=${op.op}, ns=${op.ns}, wall=${op.wall}`);
    console.log("Details:", JSON.stringify(op.o, null, 2));
    if (op.o2) {
      console.log("Query (o2):", JSON.stringify(op.o2, null, 2));
    }
  });

  await mongoose.disconnect();
}

run().catch(console.error);
