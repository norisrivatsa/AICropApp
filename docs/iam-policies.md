# IAM Policy Notes (Least Privilege)

## 1) Cognito Unauthenticated Role (for browser Transcribe streaming)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowTranscribeWebSocket",
      "Effect": "Allow",
      "Action": [
        "transcribe:StartStreamTranscriptionWebSocket"
      ],
      "Resource": "*"
    }
  ]
}
```

Scope further via identity-pool trust policy and region restrictions.

## 2) Backend Role (Amplify SSR compute role)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "BedrockConverse",
      "Effect": "Allow",
      "Action": [
        "bedrock:Converse"
      ],
      "Resource": "arn:aws:bedrock:ap-south-1::foundation-model/*"
    },
    {
      "Sid": "PollySynthesize",
      "Effect": "Allow",
      "Action": [
        "polly:SynthesizeSpeech"
      ],
      "Resource": "*"
    },
    {
      "Sid": "LocationReverseGeocode",
      "Effect": "Allow",
      "Action": [
        "geo:SearchPlaceIndexForPosition"
      ],
      "Resource": "arn:aws:geo:ap-south-1:<ACCOUNT_ID>:place-index/<PLACE_INDEX_NAME>"
    },
    {
      "Sid": "S3PresignPut",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::<UPLOAD_BUCKET>/uploads/*"
    }
  ]
}
```
