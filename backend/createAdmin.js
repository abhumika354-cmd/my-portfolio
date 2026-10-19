
require("dotenv").config();

const readline = require("node:readline/promises");
const bcrypt = require("bcryptjs");
const pool = require("./config/db");

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const username = (await rl.question("Choose admin username: ")).trim();
    const password = await rl.question("Choose admin password: ");

    if (!username || username.length > 100) {
      throw new Error("Username must contain 1 to 100 characters.");
    }

    if (password.length < 12 || password.length > 128) {
      throw new Error(
        "Use a password between 12 and 128 characters."
      );
    }

    const [existing] = await pool.execute(
      "SELECT id FROM admins WHERE username = ? LIMIT 1",
      [username]
    );

    if (existing.length > 0) {
      throw new Error(
        "That username already exists. Choose another username."
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await pool.execute(
      "INSERT INTO admins (username, password_hash) VALUES (?, ?)",
      [username, passwordHash]
    );

    console.log("\nAdmin account created successfully.");
    console.log(`Username: ${username}`);
    console.log("Keep your password private.");
  } finally {
    rl.close();
    await pool.end();
  }
}

main().catch((error) => {
  console.error("\nCould not create admin:", error.message);
  process.exitCode = 1;
});
