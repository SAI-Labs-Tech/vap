#!/usr/bin/env node
import { startStdioServer } from "./transports/stdio.js";

function main(): void {
  try {
    startStdioServer();
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();
