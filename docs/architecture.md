# Architecture (MVP)

```text
[Browser Next.js UI]
  |-- Mic PCM stream (Cognito temp creds) --> [Amazon Transcribe Streaming]
  |-- POST /api/chat -----------------------> [Next.js API route on Amplify SSR]
  |                                           |-- ReverseGeocode -> Amazon Location
  |                                           |-- Deterministic crop ranker
  |                                           |-- Converse -> Amazon Bedrock
  |                                           |-- SynthesizeSpeech -> Amazon Polly
  |<-- assistantText + cards + audio(base64)-|
  |-- POST /api/upload-url -----------------> [Next.js API route]
  |<-- pre-signed URL ---------------------- |
  |-- PUT image ----------------------------> [S3]
```
