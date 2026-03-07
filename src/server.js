import app from "./app.js";
import connectDB from "./config/database.js";
import { port } from "./config/env.js";

const start = async () => {
  try {
    await connectDB();
    app.listen(port, () => console.log(`Server listening on port ${port}`));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
