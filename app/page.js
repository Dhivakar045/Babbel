"use client"; // Add this directive at the very top of the file

import { useState, useEffect } from "react";

export default function Home() {
  const [recording, setRecording] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showCountdown, setShowCountdown] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);

  useEffect(() => {
    if (showCountdown && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      startRecording();
    }
  }, [countdown, showCountdown]);

  const requestMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (stream) {
        setHasPermission(true);
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);
        startCountdown();
      }
    } catch (err) {
      console.error("Mic permission denied", err);
    }
  };

  const startCountdown = () => {
    setShowCountdown(true);
    setCountdown(3);
  };

  const startRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "inactive") {
      mediaRecorder.start();
      setRecording(true);
      setShowCountdown(false);

      mediaRecorder.ondataavailable = (event) => {
        setAudioChunks((prevChunks) => [...prevChunks, event.data]);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
        setAudioChunks([]);
      };
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  return (
    <div className="container">
      {!recording && !showCountdown && (
        <button onClick={requestMicPermission} className="babble-button">
          Babble
        </button>
      )}

      {showCountdown && <div className="countdown">{countdown}</div>}

      {recording && (
        <div className="recording-container">
          <div className="sound-wave">Recording...</div>
          <button onClick={stopRecording} className="stop-button">
            Stop
          </button>
        </div>
      )}

      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          border: 2px solid #97a3ab;
          margin-left: 10%;
          margin-top: 10%;
        }
        .babble-button {
          width: 100px;
          height: 100px;
          background-color: #2f4858;
          border: 2px solid #b48f76;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.3s;
        }
        .countdown {
          font-size: 48px;
          width: 100px;
          height: 100px;
          background-color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: black;
        }
        .recording-container {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .stop-button {
          margin-top: 20px;
          padding: 10px;
          background-color: red;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
