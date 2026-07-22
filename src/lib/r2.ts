import "server-only";

import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const UPLOAD_EXPIRY_SECONDS = 10 * 60;
const DOWNLOAD_EXPIRY_SECONDS = 5 * 60;

let client: S3Client | undefined;

function config() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error("Configuração do Cloudflare R2 em falta");
  }
  return { accountId, accessKeyId, secretAccessKey, bucket };
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

export async function createMaterialUploadUrl(objectKey: string, contentType: string, fileSize: number) {
  const { bucket } = config();
  return getSignedUrl(r2Client(), new PutObjectCommand({
    Bucket: bucket,
    Key: objectKey,
    ContentType: contentType,
    ContentLength: fileSize,
  }), { expiresIn: UPLOAD_EXPIRY_SECONDS });
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
