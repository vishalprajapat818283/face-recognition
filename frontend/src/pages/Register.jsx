import { useEffect, useRef, useState } from "react";
import { registerPerson } from "../api";

const TOTAL_SAMPLES = 20;
const CAPTURE_INTERVAL = 300;

function Register() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  const [name, setName] = useState("");
  const [cameraStarted, setCameraStarted] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [sampleCount, setSampleCount] = useState(0);

  const [status, setStatus] = useState(
    "Enter your name and start the camera."
  );

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Start webcam
  const startCamera = async () => {
    setError("");
    setMessage("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraStarted(true);
      setStatus("Camera ready. Position your face inside the frame.");

    } catch (err) {
      console.error(err);

      setError(
        "Could not access the camera. Please allow camera permission in your browser."
      );
    }
  };

  // Stop webcam
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraStarted(false);
  };

  // Capture one frame
  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      return null;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        "image/jpeg",
        0.90
      );
    });
  };

  // Register the person
  const startRegistration = async () => {
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!cameraStarted) {
      setError("Please start the camera first.");
      return;
    }

    setError("");
    setMessage("");
    setSampleCount(0);
    setCapturing(true);

    const images = [];

    try {
      setStatus("Get ready...");

      // Small delay before capture starts
      await new Promise((resolve) =>
        setTimeout(resolve, 1000)
      );

      for (
        let i = 0;
        i < TOTAL_SAMPLES;
        i++
      ) {
        setStatus(
          `Capturing face sample ${i + 1} of ${TOTAL_SAMPLES}...`
        );

        const blob = await captureFrame();

        if (!blob) {
          throw new Error(
            "Could not capture camera frame."
          );
        }

        images.push(blob);

        setSampleCount(i + 1);

        await new Promise((resolve) =>
          setTimeout(resolve, CAPTURE_INTERVAL)
        );
      }

      setStatus(
        "Samples captured. Sending to recognition server..."
      );

      const result = await registerPerson(
        name.trim(),
        images
      );

      setMessage(
        `${result.person.name} registered successfully.`
      );

      setStatus("Registration completed successfully.");

      setName("");

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
        err.message ||
        "Registration failed."
      );

      setStatus("Registration failed.");

    } finally {
      setCapturing(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="page">

      <div className="card registration-card">

        <h1>
          Register Face
        </h1>

        <p className="description">
          Register yourself using your webcam.
          The system will capture multiple face
          samples and create your face embedding.
        </p>

        <label>
          Name
        </label>

        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          disabled={capturing}
          onChange={(event) =>
            setName(event.target.value)
          }
        />

        <div className="camera-container">

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="camera-video"
          />

          {!cameraStarted && (
            <div className="camera-placeholder">
              Camera is not started
            </div>
          )}

        </div>

        <canvas
          ref={canvasRef}
          style={{ display: "none" }}
        />

        <div className="camera-buttons">

          {!cameraStarted ? (

            <button
              className="primary-button full-width"
              onClick={startCamera}
            >
              Start Camera
            </button>

          ) : (

            <button
              className="secondary-button full-width"
              onClick={stopCamera}
              disabled={capturing}
            >
              Stop Camera
            </button>

          )}

        </div>

        {cameraStarted && !capturing && (
          <button
            className="primary-button full-width"
            onClick={startRegistration}
          >
            Start Registration
          </button>
        )}

        {capturing && (
          <div className="capture-status">

            <div className="capture-count">
              {sampleCount} / {TOTAL_SAMPLES}
            </div>

            <p>
              {status}
            </p>

          </div>
        )}

        {!capturing && !message && (
          <p className="camera-status">
            {status}
          </p>
        )}

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

      </div>

    </div>
  );
}

export default Register;