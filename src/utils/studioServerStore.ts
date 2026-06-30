import PocketBase from "pocketbase";
import {
  normalizeCommission,
  type StudioCommission,
  PAYMENT_STATUSES,
  PAYMENT_PROVIDERS,
} from "./studioWorkflow";

const pb = new PocketBase("https://cdn.gxbs.dev");

const COLLECTION_NAME = "commissions";

const recordToCommission = (record: Record<string, unknown>): StudioCommission => {
  return normalizeCommission({
    id: record.id as string,
    clientName: record.clientName as string,
    clientEmail: record.clientEmail as string,
    projectTitle: record.projectTitle as string,
    offer: record.offer as string,
    tier: record.tier as string,
    status: record.status as any,
    brief: record.brief as string,
    submittedAt: record.created as string, // Use PocketBase's 'created'
    updatedAt: record.updated as string,   // Use PocketBase's 'updated'
    decisionNote: record.decisionNote as string,
    accessCode: record.accessCode as string,
    sessionId: record.sessionId as string,
    approvedAt: record.approvedAt as string,
    quotedAmount: record.quotedAmount as number,
    currency: (record.currency as string) || undefined, // Ensure empty string becomes undefined
    paymentStatus: record.paymentStatus as any,
    paymentProvider: record.paymentProvider as any,
    paymentUrl: record.paymentUrl as string,
    paymentReference: record.paymentReference as string,
    paidAt: record.paidAt as string,
  });
};

export const listCommissions = async (): Promise<StudioCommission[]> => {
  const records = await pb.collection(COLLECTION_NAME).getFullList({
    sort: "-updated", // Sort by PocketBase's 'updated' field
  });
  return records.map(recordToCommission);
};

export const getCommissionById = async (id: string): Promise<StudioCommission | null> => {
  try {
    const record = await pb.collection(COLLECTION_NAME).getOne(id);
    return recordToCommission(record);
  } catch (error) {
    return null;
  }
};

export const updateCommissionById = async (
  id: string,
  patch: Partial<StudioCommission>
): Promise<StudioCommission | null> => {
  try {
    // PocketBase handles its own 'updated' timestamp, so we don't need to set updatedAt in patch
    const record = await pb.collection(COLLECTION_NAME).update(id, patch);
    return recordToCommission(record);
  } catch (error) {
    return null;
  }
};

export const createCommission = async (
  commissionData: Partial<StudioCommission> // Accept partial data
): Promise<StudioCommission> => {
  // Normalize the incoming data to ensure all fields have defaults
  // We pass temporary ID and timestamps, which will be overwritten by PocketBase's generated ones.
  const normalizedCommission = normalizeCommission({
    id: "temp-id", // Temporary ID, will be replaced by PocketBase's ID
    submittedAt: new Date().toISOString(), // Temporary, will be replaced by PocketBase's 'created'
    updatedAt: new Date().toISOString(),   // Temporary, will be replaced by PocketBase's 'updated'
    ...commissionData, // Spread the actual incoming data
  });

  // Prepare the payload for PocketBase.
  // Exclude 'id', 'submittedAt', 'updatedAt' as PocketBase manages these.
  const pbPayload = {
    clientName: normalizedCommission.clientName,
    clientEmail: normalizedCommission.clientEmail,
    projectTitle: normalizedCommission.projectTitle,
    offer: normalizedCommission.offer,
    tier: normalizedCommission.tier,
    status: normalizedCommission.status,
    brief: normalizedCommission.brief,
    decisionNote: normalizedCommission.decisionNote,
    accessCode: normalizedCommission.accessCode,
    sessionId: normalizedCommission.sessionId,
    approvedAt: normalizedCommission.approvedAt,
    quotedAmount: normalizedCommission.quotedAmount,
    currency: normalizedCommission.currency,
    paymentStatus: normalizedCommission.paymentStatus,
    paymentProvider: normalizedCommission.paymentProvider,
    paymentUrl: normalizedCommission.paymentUrl,
    paymentReference: normalizedCommission.paymentReference,
    paidAt: normalizedCommission.paidAt,
  };

  const record = await pb.collection(COLLECTION_NAME).create(pbPayload);
  return recordToCommission(record);
};