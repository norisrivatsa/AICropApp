# Crop Advisor (AI for Bharat Hackathon MVP)

Web-only MVP for North India farmers: chat + streaming voice input + voice output + deterministic crop ranking.

## 1) High-level architecture summary

```text
[Next.js Web App (single page)]
  - Chat bubbles, big mic button, location share, optional photo upload
  - Browser streams mic audio to Amazon Transcribe (WebSocket)
  - Final transcript/text -> POST /api/chat

/api/chat (Next.js API route on Amplify SSR)
  - Reverse geocode lat/lng via Amazon Location
  - Run deterministic crop_ranker (Top 3 crops)
  - Call Amazon Bedrock Converse for explanation + action plan
  - Call Amazon Polly for audio reply
  - Return: assistant text + crop cards + base64 mp3

Optional upload flow
  - POST /api/upload-url -> pre-signed PUT URL
  - Browser uploads image to S3
```

## 2) File-by-file plan (tree)

```text
app/
  layout.tsx                  # app shell + manifest registration
  page.tsx                    # single-page UI and orchestration
  globals.css                 # minimal mobile-first styling
  api/
    chat/route.ts             # main orchestration endpoint
    reverse-geocode/route.ts  # optional direct reverse-geocode endpoint
    upload-url/route.ts       # optional S3 presigned upload endpoint
components/
  AudioPlayer.tsx
  ChatWindow.tsx
  Composer.tsx
  CropCards.tsx
  LanguageToggle.tsx
  LocationButton.tsx
  MicButton.tsx
  UploadPhotoButton.tsx
lib/
  constants.ts
  session.ts
  types.ts
  utils.ts
  aws/
    bedrock.ts
    cognitoBrowserCreds.ts
    config.ts
    location.ts
    polly.ts
    s3.ts
    transcribeStreaming.ts
  ranker/
    cropRanker.ts             # deterministic explainable scoring
    crops.ts                  # compact North-India crop dataset
    season.ts                 # infer season from current month
  mock/
    mockData.ts
    mockMode.ts
docs/
  architecture.md
  iam-policies.md
  api-samples.json
public/
  manifest.webmanifest
  icons/icon-192.svg
  icons/icon-512.svg
.env.example
package.json
tsconfig.json
next.config.ts
```

## 3) Setup

### Prerequisites
- Node.js 20+
- AWS account with Bedrock model access enabled in your region
- AWS resources below

### Create AWS resources (minimal)
1. **Cognito Identity Pool**
- Enable unauthenticated identities
- Keep identity pool ID for `NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID`

2. **IAM role for unauth identities**
- Allow `transcribe:StartStreamTranscriptionWebSocket`

3. **Amazon Location Place Index**
- Create place index and note name (`LOCATION_PLACE_INDEX`)

4. **Amazon S3 bucket** (optional upload)
- Create bucket and set CORS for browser PUT:
```xml
<CORSConfiguration>
  <CORSRule>
    <AllowedOrigin>*</AllowedOrigin>
    <AllowedMethod>PUT</AllowedMethod>
    <AllowedMethod>GET</AllowedMethod>
    <AllowedHeader>*</AllowedHeader>
  </CORSRule>
</CORSConfiguration>
```

5. **Bedrock model access**
- Enable model in target region (default env uses Claude 3 Haiku)

6. **Backend execution role (Amplify SSR compute role)**
- Permissions for Bedrock + Polly + Location + S3 PutObject (see IAM section)

### Environment variables
Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Required values:
- `AWS_REGION`
- `NEXT_PUBLIC_AWS_REGION`
- `NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID`
- `BEDROCK_MODEL_ID`
- `LOCATION_PLACE_INDEX` (empty allowed if skipping location context)
- `UPLOAD_BUCKET` (empty allowed if skipping upload)
- `MOCK_MODE=true|false`

### Local run
```bash
npm install
npm run dev
```
Open `http://localhost:3000`.

## 4) Deploy quickly on Amplify

1. Push repo to GitHub.
2. In AWS Amplify Hosting, connect repo and select branch.
3. Framework auto-detect should pick Next.js SSR.
4. Configure environment variables in Amplify console (same as `.env.local`).
5. Attach execution IAM role with required permissions.
6. Deploy.

## 5) API behavior

### `POST /api/chat`
- Input: typed/final-transcribed message, language, optional location and image URL.
- Output: assistant text, top-3 crop cards, reverse-geocode context, optional base64 MP3.

### `POST /api/reverse-geocode`
- Input: `lat/lng`
- Output: district/state/country

### `POST /api/upload-url`
- Input: filename/contentType
- Output: presigned URL + public file URL

See sample payloads: `docs/api-samples.json`.

## 6) Deterministic crop ranking

Inputs:
- state/district (if shared)
- season inferred from current month
- land area, budget, irrigation (MVP defaults configured)

Weights (fixed):
- water feasibility: 25%
- climate/season: 25%
- profitability: 25%
- budget fit: 15%
- rotation/sustainability: 10%

Output fields for top 3:
- suitability score
- rough profit range (INR/acre)
- water need
- risk
- confidence
- deterministic `why[]`

## 7) Mock mode

Set:
```bash
MOCK_MODE=true
```

This bypasses Bedrock/Polly/Location/S3 and returns deterministic fixtures for fast local demos.

## 8) IAM policy notes

Detailed snippets: `docs/iam-policies.md`

### Cognito unauth role
- `transcribe:StartStreamTranscriptionWebSocket`

### Backend role
- `bedrock:Converse`
- `polly:SynthesizeSpeech`
- `geo:SearchPlaceIndexForPosition`
- `s3:PutObject` on `uploads/*` prefix

## 9) 2–3 minute demo script

1. Open app: show one-page interface (`Crop Advisor` header, chat, large mic button).
2. Click **Share Location** and show location captured.
3. Ask by typing: “What should I sow this month with medium irrigation?”
4. Show returned top-3 cards with scores, risk, confidence.
5. Play auto voice output from Polly (or click audio controls if autoplay blocked).
6. Toggle language to **HI**, click mic, speak query, show live partial transcript.
7. Stop mic, final transcript auto-submits, Hindi response and updated cards appear.
8. Upload a photo to demonstrate optional image context pipeline.
9. Close with: deterministic ranker + Bedrock explanation + KVK disclaimer.

## 10) Safety disclaimer

The assistant response always includes:

> This is decision support; consult local KVK/agronomist.

## 11) Known MVP limitations

- Session memory is client-side only; no persistent chat store.
- No offline support beyond basic PWA manifest.
- Crop dataset is intentionally compact and region-focused for hackathon speed.
- Upload is storage-only (no image analysis).
