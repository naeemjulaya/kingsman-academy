import "server-only";

import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const UPLOAD_EXPIRY_SECONDS = 10 * 60;
const DOWNLOAD_EXPIRY_SECONDS = 5 * 60;

let client: S3Client | undefined;

function config() {
  const values = {
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucket: process.env.R2_BUCKET_NAME,
  };
  const missing = Object.entries({
    R2_ACCOUNT_ID: values.accountId,
    R2_ACCESS_KEY_ID: values.accessKeyId,
    R2_SECRET_ACCESS_KEY: values.secretAccessKey,
    R2_BUCKET_NAME: values.bucket,
  }).filter(([, value]) => !value).map(([name]) => name);
  if (missing.length > 0) {
    throw new Error(`Configuração do Cloudflare R2 em falta: ${missing.join(", ")}`);
  }
  return {
    accountId: values.accountId as string,
    accessKeyId: values.accessKeyId as string,
    secretAccessKey: values.secretAccessKey as string,
    bucket: values.bucket as string,
  };
}

function r2Client() {
  if (client) return client;
  const values = config();
  client = new S3Client({
    region: "auto",
    endpoint: `https://${values.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: values.accessKeyId,
      secretAccessKey: values.secretAccessKey,
    },
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
  return client;
}

export function createMaterialObjectKey(courseId: string, originalName: string) {
  const extension = originalName.toLowerCase().match(/\.[a-z0-9]{1,8}$/)?.[0] ?? "";
  return `courses/${courseId}/${crypto.randomUUID()}${extension}`;
}

export function createPaymentProofObjectKey(userId: string, originalName: string) {
  const extension = originalName.toLowerCase().match(/\.(jpg|jpeg|png|pdf)$/)?.[0] ?? "";
  return `payment-proofs/${userId}/${crypto.randomUUID()}${extension}`;
}

export async function createMaterialUploadUrl(objectKey: string, contentType: string, fileSize: number) {
  const { bucket } = config();
  return getSignedUrl(r2Client(), new PutObjectCommand({
    Bucket: bucket,
    Key: objectKey,
    ContentType: contentType,
    ContentLength: fileSize,
  }), { expiresIn: UPLOAD_EXPIRY_SECONDS });
}

export async function paymentProofExists(objectKey: string) {
  const { bucket } = config();
  try {
    await r2Client().send(new HeadObjectCommand({ Bucket: bucket, Key: objectKey }));
    return true;
  } catch (error) {
    const status = (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;
    if (status === 404) return false;
    throw error;
  }
}

export async function createPaymentProofDownloadUrl(objectKey: string) {
  const { bucket } = config();
  return getSignedUrl(r2Client(), new GetObjectCommand({
    Bucket: bucket,
    Key: objectKey,
    ResponseContentDisposition: "inline",
  }), { expiresIn: DOWNLOAD_EXPIRY_SECONDS });
}

export async function deletePaymentProofObject(objectKey: string) {
  const { bucket } = config();
  await r2Client().send(new DeleteObjectCommand({ Bucket: bucket, Key: objectKey }));
}

export async function createMaterialDownloadUrl(objectKey: string, originalName: string) {
  const { bucket } = config();
  const safeName = originalName.replace(/["\r\n]/g, "_");
  return getSignedUrl(r2Client(), new GetObjectCommand({
    Bucket: bucket,
    Key: objectKey,
    ResponseContentDisposition: `inline; filename="${safeName}"`,
  }), { expiresIn: DOWNLOAD_EXPIRY_SECONDS });
}

export async function deleteMaterialObject(objectKey: string) {
  const { bucket } = config();
  await r2Client().send(new DeleteObjectCommand({ Bucket: bucket, Key: objectKey }));
}
