export const awsConfig = {
  region: process.env.AWS_REGION || "ap-south-1",
  bedrockModelId: process.env.BEDROCK_MODEL_ID || "anthropic.claude-3-haiku-20240307-v1:0",
  locationPlaceIndex: process.env.LOCATION_PLACE_INDEX || "",
  uploadBucket: process.env.UPLOAD_BUCKET || ""
};
