// ============================================================
// GharDisha AI — Voice Input Hook (Speechmatics real-time)
// ============================================================
// This version avoids fragile browser-audio-input imports.
// It uses the browser microphone directly and streams 16-bit PCM
// audio to Speechmatics using the official real-time client.
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { RealtimeClient } from '@speechmatics/real-time-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function float32ToInt16ArrayBuffer(float32Array) {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);

  for (let i = 0; i < float32Array.length; i += 1) {
    const sample = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
  }

  return buffer;
}

function transcriptTextFromResults(results = []) {
  return results
    .map((r) => r.alternatives?.[0]?.content || '')
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function useVoiceInput(onTranscript, outputLanguage = 'en') {
  const [available, setAvailable] = useState(false);
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState('');
  const [partial, setPartial] = useState('');

// Speechmatics voice input is enabled only for languages we show as "Voice + text".
// Assamese is kept as text output only because it is important for the Assam demo,
// but it is not used as a Speechmatics voice language in this MVP.
const SPEECHMATICS_LANG = {
  en: 'en',
  hi: 'hi',
  ta: 'ta',
  mr: 'mr',
};

const voiceLang = SPEECHMATICS_LANG[outputLanguage] || 'en';

  const clientRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);

  useEffect(() => {
    let active = true;

    fetch(`${API_URL}/api/voice/status`)
      .then((r) => r.json())
      .then((d) => {
        if (active) setAvailable(Boolean(d.voice_enabled));
      })
      .catch(() => {
        if (active) setAvailable(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const stop = useCallback(async () => {
    try {
      processorRef.current?.disconnect();
    } catch (_) {
      // ignore
    }

    try {
      streamRef.current?.getTracks()?.forEach((track) => track.stop());
    } catch (_) {
      // ignore
    }

    try {
      await clientRef.current?.stopRecognition({ noTimeout: true });
    } catch (_) {
      // ignore
    }

    try {
      await audioContextRef.current?.close();
    } catch (_) {
      // ignore
    }

    processorRef.current = null;
    streamRef.current = null;
    audioContextRef.current = null;
    clientRef.current = null;

    setRecording(false);
    setPartial('');
  }, []);

  const start = useCallback(async () => {
    setStatus('');
    setPartial('');

    let jwt;

    try {
      const res = await fetch(`${API_URL}/api/voice/token`, {
        method: 'POST',
      });

      const data = await res.json();

      if (!data.enabled || !data.jwt) {
        setStatus(data.reason || 'Voice unavailable — please type instead.');
        return;
      }

      jwt = data.jwt;
    } catch (_) {
      setStatus('Could not start voice. Please type instead.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      const client = new RealtimeClient();
      clientRef.current = client;

      client.addEventListener('receiveMessage', ({ data }) => {
        if (data.message === 'AddPartialTranscript') {
          setPartial(transcriptTextFromResults(data.results));
        } else if (data.message === 'AddTranscript') {
          const finalText = transcriptTextFromResults(data.results);

          if (finalText) {
            onTranscript(finalText);
          }

          setPartial('');
        } else if (data.message === 'Error') {
          setStatus(`Voice error: ${data.reason || data.type || 'unknown'}. Please type instead.`);
          stop();
        }
      });

      await client.start(jwt, {
        transcription_config: {
          language: voiceLang,
          enable_partials: true,
          max_delay: 0.7,
        },
        audio_format: {
          type: 'raw',
          encoding: 'pcm_s16le',
          sample_rate: audioContext.sampleRate,
        },
      });

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (event) => {
        try {
          const input = event.inputBuffer.getChannelData(0);
          client.sendAudio(float32ToInt16ArrayBuffer(input));
        } catch (_) {
          // If socket closes, typing fallback still works.
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      setRecording(true);
      setStatus('Listening… speak the situation naturally.');
    } catch (_) {
      setStatus('Microphone unavailable or blocked. Please type instead.');
      await stop();
    }
  }, [onTranscript, stop, voiceLang]);

  const toggle = useCallback(() => {
    if (recording) {
      stop();
    } else {
      start();
    }
  }, [recording, start, stop]);

  return {
    available,
    recording,
    status,
    partial,
    toggle,
  };
}