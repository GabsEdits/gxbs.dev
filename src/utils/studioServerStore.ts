import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  createSeedCommissions,
  normalizeCommission,
  type StudioCommission,
} from "./studioWorkflow";

const STORAGE_PATH =
  process.env.STUDIO_COMMISSIONS_FILE ??
  path.join(process.cwd(), "data", "studio-commissions.json");

let writeLock: Promise<void> = Promise.resolve();

const withWriteLock = async <T>(action: () => Promise<T>) => {
  const task = writeLock.then(action, action);
  writeLock = task.then(
    () => undefined,
    () => undefined
  );
  return task;
};

const ensureStoreFile = async () => {
  try {
    await readFile(STORAGE_PATH, "utf8");
  } catch {
    const seed = createSeedCommissions().map(normalizeCommission);
    await mkdir(path.dirname(STORAGE_PATH), { recursive: true });
    await writeFile(STORAGE_PATH, JSON.stringify(seed, null, 2), "utf8");
  }
};

const readStore = async (): Promise<StudioCommission[]> => {
  await ensureStoreFile();
  const raw = await readFile(STORAGE_PATH, "utf8");

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeCommission);
  } catch {
    return [];
  }
};

const writeStore = async (commissions: StudioCommission[]) => {
  await mkdir(path.dirname(STORAGE_PATH), { recursive: true });
  await writeFile(STORAGE_PATH, JSON.stringify(commissions, null, 2), "utf8");
};

export const listCommissions = async () => {
  return readStore();
};

export const getCommissionById = async (id: string) => {
  const commissions = await readStore();
  return commissions.find((commission) => commission.id === id) ?? null;
};

export const updateCommissionById = async (
  id: string,
  patch: Partial<StudioCommission>
) => {
  return withWriteLock(async () => {
    const commissions = await readStore();
    const index = commissions.findIndex((commission) => commission.id === id);
    if (index < 0) return null;

    const now = new Date().toISOString();
    const updated = normalizeCommission({
      ...commissions[index],
      ...patch,
      id,
      updatedAt: now,
    });

    commissions[index] = updated;
    await writeStore(commissions);
    return updated;
  });
};


