import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { awsConfig } from "@/lib/aws/config";

const s3Client = new S3Client({ region: awsConfig.region });

export async function createUploadUrl(fileName: string, contentType: string): Promise<{ uploadUrl: string; fileUrl: string }> {
  if (!awsConfig.uploadBucket) {
    throw new Error("UPLOAD_BUCKET is not configured");
  }

  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `uploads/${Date.now()}-${safeName}`;

  const command = new PutObjectCommand({
    Bucket: awsConfig.uploadBucket,
    Key: key,
    ContentType: contentType
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
  const fileUrl = `https://${awsConfig.uploadBucket}.s3.${awsConfig.region}.amazonaws.com/${key}`;

  return { uploadUrl, fileUrl };
}
