"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Mode = "photo" | "video";
type Status = "idle" | "starting" | "live" | "recording" | "captured" | "error";

/** Hard cap so a rambling gym video doesn't become a 200MB upload. */
const MAX_VIDEO_SECONDS = 30;

/** First container the browser will actually record. Safari only does mp4. */
function pickVideoMimeType(): string | undefined {
  const candidates = [
    "video/mp4",
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];
  return candidates.find(
    (type) =>
      typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type),
  );
}

export type Capture = { file: File; url: string; type: "image" | "video" };

export function CameraCapture({
  onCapture,
}: {
  onCapture: (capture: Capture | null) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const previewUrlRef = useRef<string | null>(null);

  const [mode, setMode] = useState<Mode>("photo");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [preview, setPreview] = useState<Capture | null>(null);
  const [seconds, setSeconds] = useState(0);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(
    async (nextFacing: "environment" | "user" = facing) => {
      setError(null);
      setStatus("starting");

      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus("error");
        setError(
          "This browser won't share the camera. On a phone, open the app over https (or on localhost) in Safari or Chrome.",
        );
        return;
      }

      stopStream();

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: nextFacing, width: { ideal: 1280 } },
          // Audio is only needed for video, but asking once avoids a second
          // permission prompt when someone flips to video mode mid-session.
          audio: mode === "video",
        });

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {
            /* autoplay rejection is harmless; the user can tap to play */
          });
        }
        setStatus("live");
      } catch (cause) {
        setStatus("error");
        const name = cause instanceof DOMException ? cause.name : "";
        if (name === "NotAllowedError") {
          setError(
            "Camera access was blocked. Allow the camera for this site in your browser settings, then try again.",
          );
        } else if (name === "NotFoundError") {
          setError("No camera found on this device.");
        } else {
          setError("Could not start the camera. Close any other app using it and try again.");
        }
      }
    },
    [facing, mode, stopStream],
  );

  // Tear the camera down when the screen goes away, or the phone keeps the
  // recording light on.
  useEffect(() => stopStream, [stopStream]);

  useEffect(() => {
    const url = previewUrlRef.current;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [preview]);

  // Recording timer + auto-stop at the cap.
  useEffect(() => {
    if (status !== "recording") return;

    const interval = setInterval(() => {
      setSeconds((value) => {
        if (value + 1 >= MAX_VIDEO_SECONDS) stopRecording();
        return value + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
     
  }, [status]);

  function publish(capture: Capture) {
    previewUrlRef.current = capture.url;
    setPreview(capture);
    setStatus("captured");
    stopStream();
    onCapture(capture);
  }

  function takePhoto() {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    if (!context) return;

    // The preview is mirrored for the selfie camera; un-mirror it so the saved
    // photo matches what the world actually saw.
    if (facing === "user") {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `proof-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        publish({ file, url: URL.createObjectURL(blob), type: "image" });
      },
      "image/jpeg",
      0.9,
    );
  }

  function startRecording() {
    const stream = streamRef.current;
    if (!stream) return;

    const mimeType = pickVideoMimeType();
    if (typeof MediaRecorder === "undefined" || !mimeType) {
      setError("This browser can't record video. Take a photo instead.");
      return;
    }

    chunksRef.current = [];
    const recorder = new MediaRecorder(stream, { mimeType });

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const extension = mimeType.includes("mp4") ? "mp4" : "webm";
      const file = new File([blob], `proof-${Date.now()}.${extension}`, {
        type: mimeType,
      });
      publish({ file, url: URL.createObjectURL(blob), type: "video" });
    };

    recorderRef.current = recorder;
    recorder.start();
    setSeconds(0);
    setStatus("recording");
  }

  function stopRecording() {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }

  function retake() {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setPreview(null);
    setSeconds(0);
    onCapture(null);
    void start();
  }

  function flipCamera() {
    const next = facing === "environment" ? "user" : "environment";
    setFacing(next);
    void start(next);
  }

  function switchMode(next: Mode) {
    if (next === mode) return;
    setMode(next);
    // Video needs an audio track the photo stream may not have, so re-open.
    if (status === "live") void start();
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-4/5 w-full overflow-hidden rounded-2xl border border-line bg-ink">
        {/* Live preview. Kept mounted so the stream has somewhere to render. */}
        <video
          ref={videoRef}
          muted
          playsInline
          autoPlay
          className={`h-full w-full object-cover ${
            facing === "user" ? "-scale-x-100" : ""
          } ${preview ? "hidden" : ""}`}
        />

        {preview?.type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview.url}
            alt="Your workout proof"
            className="h-full w-full object-cover"
          />
        ) : null}

        {preview?.type === "video" ? (
          <video
            src={preview.url}
            controls
            playsInline
            className="h-full w-full object-cover"
          />
        ) : null}

        {status === "idle" || status === "error" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
            <svg viewBox="0 0 24 24" className="h-12 w-12 text-muted" aria-hidden="true">
              <path
                fill="currentColor"
                d="M9 3 7.2 5H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3.2L15 3zm3 5.5a5 5 0 1 1 0 10 5 5 0 0 1 0-10m0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6"
              />
            </svg>
            <p className="max-w-xs text-sm text-muted">
              {error ??
                "Proof has to be live. Open the camera and capture it here — you can't upload an old photo."}
            </p>
            <button
              type="button"
              onClick={() => void start()}
              className="rounded-full bg-lime px-5 py-2.5 text-sm font-semibold text-ink transition active:scale-95"
            >
              {status === "error" ? "Try again" : "Open camera"}
            </button>
          </div>
        ) : null}

        {status === "starting" ? (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/70 text-sm text-muted">
            Starting camera…
          </div>
        ) : null}

        {status === "recording" ? (
          <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-broke px-3 py-1.5 text-xs font-bold text-white">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
            {seconds}s / {MAX_VIDEO_SECONDS}s
          </div>
        ) : null}

        {status === "live" || status === "recording" ? (
          <button
            type="button"
            onClick={flipCamera}
            aria-label="Switch camera"
            disabled={status === "recording"}
            className="absolute right-3 top-3 rounded-full bg-ink/70 p-2.5 text-white backdrop-blur transition active:scale-95 disabled:opacity-40"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 5V2L8 6l4 4V7a5 5 0 0 1 5 5h2a7 7 0 0 0-7-7m0 12a5 5 0 0 1-5-5H5a7 7 0 0 0 7 7v3l4-4-4-4z"
              />
            </svg>
          </button>
        ) : null}
      </div>

      {status === "live" || status === "recording" ? (
        <>
          <div className="flex justify-center gap-1 rounded-full border border-line bg-surface p-1">
            {(["photo", "video"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => switchMode(option)}
                disabled={status === "recording"}
                className={`flex-1 rounded-full py-2 text-sm font-semibold capitalize transition disabled:opacity-40 ${
                  mode === option ? "bg-lime text-ink" : "text-muted"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="flex justify-center">
            {mode === "photo" ? (
              <button
                type="button"
                onClick={takePhoto}
                aria-label="Take photo"
                className="h-18 w-18 rounded-full border-4 border-lime bg-lime/20 transition active:scale-90"
              />
            ) : (
              <button
                type="button"
                onClick={status === "recording" ? stopRecording : startRecording}
                aria-label={status === "recording" ? "Stop recording" : "Start recording"}
                className="flex h-18 w-18 items-center justify-center rounded-full border-4 border-broke transition active:scale-90"
              >
                <span
                  className={`bg-broke transition-all ${
                    status === "recording" ? "h-6 w-6 rounded" : "h-12 w-12 rounded-full"
                  }`}
                />
              </button>
            )}
          </div>
        </>
      ) : null}

      {status === "captured" ? (
        <button
          type="button"
          onClick={retake}
          className="w-full rounded-xl border border-line bg-surface py-3 text-sm font-semibold transition active:scale-[0.99]"
        >
          Retake
        </button>
      ) : null}
    </div>
  );
}
