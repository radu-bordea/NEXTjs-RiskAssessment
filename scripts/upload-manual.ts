// scripts/upload-manual.ts
import "dotenv/config"
import { put } from "@vercel/blob"
import { readFileSync } from "fs"

async function main() {
  const file = readFileSync("./public/documents/manual.pdf")

  const blob = await put("manual.pdf", file, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  })

  console.log("Uploaded! URL:", blob.url)
}

main()