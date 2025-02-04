import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";
import * as blazeface from "@tensorflow-models/blazeface";
import axios from "axios";

const FaceRecognize = ({ updatePresentList }) => {
  const webcamRef = useRef(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState(null);

  // Load the BlazeFace model
  useEffect(() => {
    const loadModel = async () => {
      setIsLoading(true);
      try {
        const loadedModel = await blazeface.load();
        setModel(loadedModel);
        console.log("BlazeFace model loaded successfully.");
      } catch (error) {
        console.error("Error loading BlazeFace model:", error);
        setMessage("Error loading model. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    loadModel();
  }, []);

  const recognizeFace = async () => {
    if (!model) {
      alert("Model is still loading...");
      return;
    }

    const screenshot = webcamRef.current.getScreenshot();
    if (!screenshot) {
      alert("Unable to capture image. Please try again.");
      return;
    }

    try {
      const img = new Image();
      img.src = screenshot;
      await img.decode(); // Ensure the image is fully loaded

      // Detect faces
      const predictions = await model.estimateFaces(img);
      if (predictions.length === 0) {
        setMessage("No face detected.");
        return;
      }
      
      console.log(predictions[0].landmarks);

      // Send face data to the backend for recognition
      const res = await axios.post("http://localhost:5000/api/recognize", { faceData: predictions[0].landmarks });

      setMessage(res.data.message);

      if (res.data.isRecognized) {
        // If the face was recognized, update the present list
        updatePresentList(res.data.student);
      }
    } catch (error) {
      console.error(error);
      setMessage("Error in face recognition.");
    }
  };

  // Continuously check for faces
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading) {
        recognizeFace();
      }
    }, 2000); // Check every 2 seconds (adjust as needed)

    return () => clearInterval(interval); // Cleanup the interval on component unmount
  }, [isLoading, model]);

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-semibold mb-4">Face Recognition</h2>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        className="mb-4 rounded shadow"
      />
      {isLoading && <p className="text-lg">Loading model...</p>}
      {message && <p className="mt-4 text-lg">{message}</p>}
    </div>
  );
};

export default FaceRecognize;
