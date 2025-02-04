import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";
import * as blazeface from "@tensorflow-models/blazeface";
import axios from "axios";

const FaceRegister = () => {
  const webcamRef = useRef(null);
  const [name, setName] = useState("");
  const [roll, setRoll] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState(null);
  const [captureProgress, setCaptureProgress] = useState(0); // For progress bar
  const [isModelLoading, setIsModelLoading] = useState(false); // Model loading state

  // Load the BlazeFace model
  useEffect(() => {
    const loadModel = async () => {
      setIsModelLoading(true);
      try {
        const loadedModel = await blazeface.load();
        setModel(loadedModel);
        console.log("BlazeFace model loaded successfully.");
      } catch (error) {
        console.error("Error loading BlazeFace model:", error);
        setMessage("Error loading model. Please try again later.");
      } finally {
        setIsModelLoading(false);
      }
    };

    loadModel();
  }, []);

  const captureMultipleFaces = async () => {
    if (!model) {
      alert("Model is still loading...");
      return;
    }

    if (!name || !roll) {
      alert("Please fill in both Name and Roll Number fields.");
      return;
    }

    setIsLoading(true);
    setCaptureProgress(0); // Reset progress bar
    const faceDataArray = [];
    const numCaptures = 5;
    let screenshotData = null;

    try {
      for (let i = 0; i < numCaptures; i++) {
        const screenshot = webcamRef.current.getScreenshot();
        if (!screenshot) {
          alert("Unable to capture image. Please try again.");
          return;
        }

        if (i === 0) screenshotData = screenshot;

        const img = new Image();
        img.src = screenshot;
        await img.decode();

        const predictions = await model.estimateFaces(img);
        if (predictions.length === 0) {
          console.warn(`No face detected in capture ${i + 1}`);
          continue;
        }

        faceDataArray.push(predictions[0].landmarks);
        
        // Update progress bar
        setCaptureProgress(((i + 1) / numCaptures) * 100);

        await new Promise(resolve => setTimeout(resolve, 300)); // Optional delay between captures
      }

      if (faceDataArray.length === 0) {
        alert("No face detected in any capture. Please try again.");
        return;
      }

      const averagedLandmarks = faceDataArray.reduce((acc, curr) => 
        acc.map((point, idx) => [point[0] + curr[idx][0], point[1] + curr[idx][1]]),
        Array(faceDataArray[0].length).fill([0, 0])
      ).map(point => [point[0] / faceDataArray.length, point[1] / faceDataArray.length]);

      const formData = new FormData();
      formData.append("image", screenshotData.split(",")[1]);

      const imgBBResponse = await axios.post(
        `https://api.imgbb.com/1/upload?key=ace89bb38fba53c4f34f8049ea6e58c9`,
        formData
      );

      if (imgBBResponse.status !== 200) {
        throw new Error("Failed to upload image to ImgBB");
      }

      const imageUrl = imgBBResponse.data.data.url;
      const date=new Date();
      const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
      const time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
      const dateTime = `${formattedDate} ${time}`;

      console.log({
        profileImage: imageUrl,
        roll,
        name,
        faceData: averagedLandmarks,
        dateTime
      });

      await axios.post("http://localhost:5000/api/register", {
        roll,
        name,
        faceData: averagedLandmarks,
        profileImage: imageUrl,
        dateTime
      });

      setMessage("Student registered successfully!");
      setName("");
      setRoll("");
    } catch (error) {
      console.error(error);
      setMessage("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
      setCaptureProgress(0); // Reset progress bar
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
        disabled={isModelLoading || isLoading}
      />
      <input
        type="text"
        placeholder="Student Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mb-4 p-2 border rounded w-full"
        disabled={isModelLoading || isLoading}
      />
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        className="mb-4 rounded shadow"
        videoConstraints={{ facingMode: "user" }}
      />
      {isModelLoading ? (
        <div className="loader"></div> // Custom loader or spinner
      ) : (
        <button
          onClick={captureMultipleFaces}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        >
          {isLoading ? "Processing..." : "Register Face"}
        </button>
      )}
      
      {/* Progress Bar */}
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
      
      {/* Feedback Message */}
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
