import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import axios from "axios";

const FaceRegister = () => {
  const webcamRef = useRef(null);
  const [name, setName] = useState("");
  const [roll, setRoll] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [captureProgress, setCaptureProgress] = useState(0);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
        await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
        console.log("Face API models loaded successfully.");
      } catch (error) {
        console.error("Error loading face-api models:", error);
        setMessage("Error loading models. Please try again later.");
      }
    };
    loadModels();
  }, []);

  const captureAndRegister = async () => {
    if (!name || !roll) {
      alert("Please fill in the name and roll fields.");
      return;
    }

    setIsLoading(true);
    setCaptureProgress(0);
    const faceDataArray = [];
    const numCaptures = 5;

    try {
      for (let i = 0; i < numCaptures; i++) {
        const screenshotCanvas = webcamRef.current.getCanvas();
        if (!screenshotCanvas) {
          alert("Unable to capture image. Please try again.");
          setIsLoading(false);
          return;
        }

        const detections = await faceapi
          .detectSingleFace(screenshotCanvas, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!detections) {
          alert("No face detected. Please ensure your face is visible.");
          continue;
        }

        faceDataArray.push(detections.descriptor);
        setCaptureProgress(((i + 1) / numCaptures) * 100);
        await new Promise((resolve) => setTimeout(resolve, 300)); // Delay between captures
      }

      if (faceDataArray.length === 0) {
        alert("No face embeddings captured. Please try again.");
        setIsLoading(false);
        return;
      }

      // Average the face descriptors
      const averagedDescriptor = faceDataArray.reduce(
        (acc, curr) => acc.map((val, idx) => val + curr[idx]),
        Array(faceDataArray[0].length).fill(0)
      ).map((val) => val / faceDataArray.length);

      const date = new Date();
      const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
      const time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
      const dateTime = `${formattedDate} ${time}`;

      console.log({
        roll,
        name,
        faceEmbedding: averagedDescriptor,
        profileimage:
        dateTime,
      })

      // Send the data to the backend
      await axios.post("http://localhost:5000/api/register", {
        roll,
        name,
        faceEmbedding: averagedDescriptor,
        dateTime,
      });

      setMessage("Student registered successfully!");
      setName("");
      setRoll("");
    } catch (error) {
      console.error("Error during registration:", error);
      setMessage("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
      setCaptureProgress(0);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-semibold mb-4">Register Student</h2>
      <input
        type="number"
        placeholder="Roll Number"
        value={roll}
        onChange={(e) => setRoll(e.target.value)}
        className="mb-4 p-2 border rounded w-full"
        disabled={isLoading}
      />
      <input
        type="text"
        placeholder="Student Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mb-4 p-2 border rounded w-full"
        disabled={isLoading}
      />
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        className="mb-4 rounded shadow"
      />
      <button
        onClick={captureAndRegister}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
      >
        {isLoading ? "Processing..." : "Register Face"}
      </button>

      {isLoading && (
        <div className="w-full mt-4">
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-blue-500 rounded-full"
              style={{ width: `${captureProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {message && (
        <p
          className={`mt-4 text-lg ${
            message.includes("successfully") ? "text-green-500" : "text-red-500"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default FaceRegister;
