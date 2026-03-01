import {
  TranscriptResultStream,
  TranscribeStreamingClient,
  StartStreamTranscriptionCommand
} from "@aws-sdk/client-transcribe-streaming";
import { getBrowserCredentials } from "@/lib/aws/cognitoBrowserCreds";
import { LangCode } from "@/lib/types";

const SAMPLE_RATE = 16000;

function downsampleBuffer(buffer: Float32Array, inputSampleRate: number): Int16Array {
  if (inputSampleRate === SAMPLE_RATE) {
    const result = new Int16Array(buffer.length);
    for (let i = 0; i < buffer.length; i += 1) {
      const s = Math.max(-1, Math.min(1, buffer[i]));
      result[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return result;
  }

  const ratio = inputSampleRate / SAMPLE_RATE;
  const newLength = Math.round(buffer.length / ratio);
  const result = new Int16Array(newLength);

  let offsetResult = 0;
  let offsetBuffer = 0;

  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * ratio);
    let accum = 0;
    let count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i += 1) {
      accum += buffer[i];
      count += 1;
    }
    const sample = accum / count;
    const s = Math.max(-1, Math.min(1, sample));
    result[offsetResult] = s < 0 ? s * 0x8000 : s * 0x7fff;

    offsetResult += 1;
    offsetBuffer = nextOffsetBuffer;
  }

  return result;
}

function int16ToBufferChunk(samples: Int16Array): Uint8Array {
  return new Uint8Array(samples.buffer);
}

export interface StartStreamingArgs {
  languageCode: LangCode;
  region: string;
  identityPoolId: string;
  onPartialTranscript: (text: string) => void;
  onFinalTranscript: (text: string) => void;
  onError: (message: string) => void;
}

export async function startTranscribeStreaming(args: StartStreamingArgs): Promise<() => Promise<void>> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(stream);
  const processor = audioContext.createScriptProcessor(4096, 1, 1);

  let isClosed = false;
  const queue: Uint8Array[] = [];

  processor.onaudioprocess = (event) => {
    const input = event.inputBuffer.getChannelData(0);
    const downsampled = downsampleBuffer(input, audioContext.sampleRate);
    queue.push(int16ToBufferChunk(downsampled));
  };

  source.connect(processor);
  processor.connect(audioContext.destination);

  const client = new TranscribeStreamingClient({
    region: args.region,
    credentials: getBrowserCredentials(args.region, args.identityPoolId)
  });

  const audioStream = async function* () {
    while (!isClosed) {
      if (!queue.length) {
        await new Promise((resolve) => setTimeout(resolve, 30));
        continue;
      }
      const chunk = queue.shift();
      if (chunk) {
        yield {
          AudioEvent: {
            AudioChunk: chunk
          }
        };
      }
    }
  };

  const command = new StartStreamTranscriptionCommand({
    LanguageCode: args.languageCode,
    MediaSampleRateHertz: SAMPLE_RATE,
    MediaEncoding: "pcm",
    AudioStream: audioStream()
  });

  client.send(command)
    .then(async (response) => {
      for await (const event of response.TranscriptResultStream as AsyncIterable<TranscriptResultStream>) {
        const transcriptEvent = event.TranscriptEvent;
        const result = transcriptEvent?.Transcript?.Results?.[0];
        if (!result?.Alternatives?.[0]?.Transcript) continue;
        const text = result.Alternatives[0].Transcript;
        if (result.IsPartial) args.onPartialTranscript(text);
        else args.onFinalTranscript(text);
      }
    })
    .catch((error) => {
      args.onError(error instanceof Error ? error.message : "Transcribe streaming failed");
    });

  return async () => {
    isClosed = true;
    processor.disconnect();
    source.disconnect();
    stream.getTracks().forEach((t) => t.stop());
    await audioContext.close();
    client.destroy();
  };
}
