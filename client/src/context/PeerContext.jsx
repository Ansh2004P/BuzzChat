// src/contexts/PeerContext.js
import { createContext, useContext, useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import PropTypes from "prop-types";

const PeerContext = createContext();

export const PeerProvider = ({ children }) => {
  const [peer, setPeer] = useState(null);
  const [peerId, setPeerId] = useState(null);
  const peerRef = useRef(null);

  useEffect(() => {
    // Initialize PeerJS
    peerRef.current = new Peer(undefined, {
      host: "localhost", // Replace with your server's address
      port: 9000,
      path: "",
      secure: false, // Set to true if using HTTPS
    });

    // When peer is open
    peerRef.current.on("open", (id) => {
      setPeerId(id);
      console.log("My peer ID is:", id);
    });

    // Handle incoming connections
    peerRef.current.on("connection", (conn) => {
      conn.on("data", (data) => {
        console.log("Received data:", data);
        // Handle incoming data here
      });
    });

    // Handle incoming calls
    peerRef.current.on("call", (call) => {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          call.answer(stream); // Answer the call with your media stream
          call.on("stream", (remoteStream) => {
            // Display remote video stream
            const video = document.createElement("video");
            video.srcObject = remoteStream;
            video.play();
            document.body.appendChild(video);
          });
        });
    });

    setPeer(peerRef.current);

    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, []);

  return (
    <PeerContext.Provider value={{ peer, peerId }}>
      {children}
    </PeerContext.Provider>
  );
};

export const usePeer = () => useContext(PeerContext);

PeerProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
