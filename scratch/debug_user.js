const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "d:/VS Code Programs/My Project/code wizards/codewizards/server/.env" });

const User = mongoose.model("User", new mongoose.Schema({}, { strict: false }));

async function run() {
  const uri = process.env.MONGO_URI;
  await mongoose.connect(uri);
  const users = await User.find({});
  console.log(`Found ${users.length} users:`);
  users.forEach((u) => {
    console.log(JSON.stringify(u.toObject(), null, 2));
  });
  await mongoose.disconnect();
}

run().catch(console.error);
