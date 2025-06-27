import fs from "fs/promises";
import path from "path";
import { PlayRecord } from "../types";

const DATA_DIR = path.join(process.cwd(), "data");
const PLAY_RECORDS_FILE = path.join(DATA_DIR, "playrecords.json");

type DbData = {
  [key: string]: PlayRecord;
};

// Ensure data directory exists
async function ensureDataDir(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error("Error creating data directory:", error);
    throw error;
  }
}

// Read the entire DB file
async function readDb(): Promise<DbData> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(PLAY_RECORDS_FILE, "utf-8");
    return JSON.parse(data) as DbData;
  } catch (error: any) {
    // If file does not exist, return empty object
    if (error.code === "ENOENT") {
      return {};
    }
    console.error("Error reading database file:", error);
    throw error;
  }
}

// Write the entire DB file
async function writeDb(data: DbData): Promise<void> {
  await ensureDataDir();
  try {
    await fs.writeFile(
      PLAY_RECORDS_FILE,
      JSON.stringify(data, null, 2),
      "utf-8"
    );
  } catch (error) {
    console.error("Error writing to database file:", error);
    throw error;
  }
}

// --- Public DB Methods ---

export function generateStorageKey(source: string, id: string): string {
  return `${source}+${id}`;
}

export async function getAllPlayRecords(): Promise<DbData> {
  return readDb();
}

export async function savePlayRecord(
  source: string,
  id: string,
  record: Omit<PlayRecord, "user_id">
): Promise<void> {
  const db = await readDb();
  const key = generateStorageKey(source, id);
  const fullRecord: PlayRecord = { ...record, user_id: 0 }; // user_id is always 0 for now
  db[key] = fullRecord;
  await writeDb(db);
}
