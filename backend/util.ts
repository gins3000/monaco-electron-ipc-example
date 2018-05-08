import * as fs from "mz/fs";
import * as path from "path";

export async function getFileContents(filePath: string) {
  const contents = await fs.readFile(filePath);
  return contents.toString();
}

// just exposing 'path' to the frontend for simplicity
export { path };
