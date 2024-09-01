import { VideoCameraIcon } from "@heroicons/react/24/solid";
import PropTypes from "prop-types";
import { useEffect, useState, useRef } from "react";
import Peer from "peerjs";

const VideoCall = ({ userId, remotePeerId }) => {
  const [peer, setPeer] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [callActive, setCallActive] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);

  useEffect(() => {
    // Initialize PeerJS with userId
    const peerInstance = new Peer(userId, {
      host: "localhost",
      port: 9000,
      path: "/peerjs",
      secure: true,
    });

    setPeer(peerInstance);

    // Handle incoming call
    peerInstance.on("call", (call) => {
      setIncomingCall(call);
    });

    // Cleanup the PeerJS connection on unmount
    return () => {
      if (peerInstance) {
        peerInstance.destroy();
      }
    };
  }, [userId]);

  const startCall = () => {
    if (peer && remotePeerId) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          setMyStream(stream);

          // Set local stream to local video element
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
            localVideoRef.current.play();
          }

          const outgoingCall = peer.call(remotePeerId, stream);
          setCallActive(true);
          outgoingCall.on("stream", (remoteStream) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
              remoteVideoRef.current.play();
            }
          });
        })
        .catch((err) => {
          console.error("Failed to get local stream", err);
        });
    } else {
      console.error("Peer or remotePeerId not available");
    }
  };

  const acceptCall = () => {
    if (incomingCall && peer) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          setMyStream(stream);

          // Set local stream to local video element
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
            localVideoRef.current.play();
          }

          incomingCall.answer(stream);
          setCallActive(true);

          incomingCall.on("stream", (remoteStream) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
              remoteVideoRef.current.play();
            }
          });

          setIncomingCall(null); // Clear incoming call
        })
        .catch((err) => {
          console.error("Failed to get local stream", err);
        });
    }
  };

  const rejectCall = () => {
    if (incomingCall) {
      incomingCall.close(); // Close the incoming call
      setIncomingCall(null); // Clear incoming call
    }
  };

  return (
    <div>
      <div className="p-4 my-1 cursor-pointer" onClick={startCall}>
        <VideoCameraIcon className="h-6 w-6 text-white" />
      </div>

      {callActive && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="relative w-full max-w-3xl h-full md:h-3/4 rounded-lg overflow-hidden flex">
            {/* Local Video */}
            <video
              ref={localVideoRef}
              className="w-1/3 h-full object-cover border border-white"
              playsInline
              autoPlay
              muted
            />

            {/* Remote Video */}
            <video
              ref={remoteVideoRef}
              className="w-2/3 h-full object-cover"
              playsInline
              autoPlay
            />

            <button
              onClick={() => setCallActive(false)}
              className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition"
            >
              End Call
            </button>
          </div>
        </div>
      )}

      {incomingCall && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">Incoming Call</h2>
            <div className="flex justify-between">
              <button
                onClick={acceptCall}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Accept
              </button>
              <button
                onClick={rejectCall}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

VideoCall.propTypes = {
  userId: PropTypes.string.isRequired,
  remotePeerId: PropTypes.string.isRequired,
};

export default VideoCall;
