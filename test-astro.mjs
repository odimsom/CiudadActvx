#!/usr/bin/env node

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const landingDir = join(__dirname, "apps", "landing");

console.log("🚀 Testing Astro development server...");
console.log("Landing directory:", landingDir);

// Test Astro config
console.log("\n📋 Testing Astro config...");
const testConfig = spawn("npx", ["astro", "check"], {
  cwd: landingDir,
  stdio: "inherit",
  shell: true,
});

testConfig.on("close", (code) => {
  if (code === 0) {
    console.log("✅ Astro config is valid");

    // Start dev server
    console.log("\n🔄 Starting development server...");
    const devServer = spawn("npx", ["astro", "dev"], {
      cwd: landingDir,
      stdio: "inherit",
      shell: true,
    });

    // Handle CTRL+C
    process.on("SIGINT", () => {
      console.log("\n🛑 Stopping development server...");
      devServer.kill("SIGINT");
      process.exit(0);
    });
  } else {
    console.log("❌ Astro config has errors");
    process.exit(1);
  }
});
