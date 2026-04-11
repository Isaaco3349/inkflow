import { config } from "dotenv"
import { resolve } from "path"
config({ path: resolve(process.cwd(), ".env") })

import { registerAgent } from "../src/lib/erc8004"

async function main() {
  const privateKey = process.env.AGENT_PRIVATE_KEY as `0x${string}`
  if (!privateKey) throw new Error("Set AGENT_PRIVATE_KEY in .env")
  await registerAgent(privateKey)
}

main().catch(console.error)