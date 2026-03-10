import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import ChatBox from "../components/chat/ChatBox";
import AvatarUpload from "../components/AvatarUpload";
import {
  getCircleById,
  leaveCircle,
  inviteMember,
} from "../services/circle.service";

import "../styles/circleDetail.css";

const RTC_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

function CircleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocket();

  const [circle, setCircle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);

  const [incomingCall, setIncomingCall] = useState(null);
  const [inCall, setInCall] = useState(false);
  const [callType, setCallType] = useState("video");
  const [callStatus, setCallStatus] = useState("");

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteSocketIdRef = useRef("");

  const clearCallState = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.onconnectionstatechange = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    remoteSocketIdRef.current = "";
    setInCall(false);
    setCallStatus("");
  };

  const endCall = (notifyRemote = true) => {
    if (notifyRemote && socket?.connected) {
      socket.emit("end-call", {
        to: remoteSocketIdRef.current || undefined,
        circleId: circle?._id,
      });
    }

    setIncomingCall(null);
    clearCallState();
  };

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection(RTC_CONFIG);

    pc.onicecandidate = (event) => {
      if (!event.candidate || !remoteSocketIdRef.current) return;

      socket.emit("ice-candidate", {
        to: remoteSocketIdRef.current,
        candidate: event.candidate,
      });
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      if (state === "connected") {
        setCallStatus("In call");
      }
      if (["failed", "disconnected", "closed"].includes(state)) {
        clearCallState();
      }
    };

    return pc;
  };

  const startLocalMedia = async (nextCallType) => {
    const constraints =
      nextCallType === "video"
        ? { audio: true, video: true }
        : { audio: true, video: false };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    localStreamRef.current = stream;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    return stream;
  };

  const startCall = async (nextCallType) => {
    if (!socket?.connected) {
      alert("Socket not connected. Please refresh and try again.");
      return;
    }

    try {
      setIncomingCall(null);
      setCallType(nextCallType);
      setInCall(true);
      setCallStatus("Calling...");

      const stream = await startLocalMedia(nextCallType);

      const pc = createPeerConnection();
      peerConnectionRef.current = pc;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("call-user", {
        circleId: circle._id,
        callType: nextCallType,
        offer,
      });
    } catch (error) {
      console.error("Failed to start call", error);
      alert("Could not start call. Please allow mic/camera permissions.");
      clearCallState();
    }
  };

  const acceptCall = async () => {
    if (!incomingCall || !socket?.connected) return;

    try {
      setCallType(incomingCall.callType || "video");
      setInCall(true);
      setCallStatus("Connecting...");

      const stream = await startLocalMedia(incomingCall.callType || "video");

      remoteSocketIdRef.current = incomingCall.from;

      const pc = createPeerConnection();
      peerConnectionRef.current = pc;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("answer-call", {
        to: incomingCall.from,
        answer,
      });

      setIncomingCall(null);
      setCallStatus("In call");
    } catch (error) {
      console.error("Failed to accept call", error);
      alert("Could not accept call.");
      endCall(false);
    }
  };

  const declineCall = () => {
    if (incomingCall?.from && socket?.connected) {
      socket.emit("end-call", { to: incomingCall.from });
    }
    setIncomingCall(null);
  };

  useEffect(() => {
    const loadCircle = async () => {
      try {
        const res = await getCircleById(id);
        setCircle(res.data.circle);
      } catch {
        alert("Circle not found or access denied");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadCircle();
  }, [id, navigate]);

  useEffect(() => {
    if (!socket) return;

    const onIncomingCall = ({ offer, from, callType: incomingType }) => {
      if (inCall) {
        socket.emit("end-call", { to: from });
        return;
      }

      setIncomingCall({
        offer,
        from,
        callType: incomingType || "video",
      });
    };

    const onCallAnswered = async ({ answer, from }) => {
      if (!peerConnectionRef.current) return;

      remoteSocketIdRef.current = from;
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
      setCallStatus("In call");
    };

    const onIceCandidate = async ({ candidate, from }) => {
      if (!peerConnectionRef.current || !candidate) return;
      if (from && !remoteSocketIdRef.current) {
        remoteSocketIdRef.current = from;
      }

      try {
        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } catch (error) {
        console.error("ICE add failed", error);
      }
    };

    const onCallEnded = () => {
      clearCallState();
      setIncomingCall(null);
    };

    socket.on("incoming-call", onIncomingCall);
    socket.on("call-answered", onCallAnswered);
    socket.on("ice-candidate", onIceCandidate);
    socket.on("call-ended", onCallEnded);

    return () => {
      socket.off("incoming-call", onIncomingCall);
      socket.off("call-answered", onCallAnswered);
      socket.off("ice-candidate", onIceCandidate);
      socket.off("call-ended", onCallEnded);
    };
  }, [socket, inCall]);

  useEffect(() => {
    return () => {
      clearCallState();
    };
  }, []);

  if (loading) return <p className="loading-text">Loading...</p>;
  if (!circle) return null;

  const myMember = circle.members.find((m) => m.user._id === user._id);
  const isOwner = myMember?.role === "owner";

  const handleLeave = async () => {
    if (!window.confirm("Leave this circle?")) return;
    await leaveCircle(circle._id);
    navigate("/dashboard");
  };

  const handleInvite = async () => {
    if (!inviteEmail) return alert("Enter email");

    try {
      setSendingInvite(true);
      await inviteMember(circle._id, inviteEmail);
      alert("Invite sent successfully!");
      setInviteEmail("");
      setShowInvite(false);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to send invite");
    } finally {
      setSendingInvite(false);
    }
  };

  return (
    <div className="circle-layout">
      <aside className="members-panel">
        <h3 className="members-title">Members</h3>

        <input
          className="members-search"
          placeholder="Search members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <ul className="members-list">
          {circle.members
            .filter((m) =>
              m.user.name.toLowerCase().includes(search.toLowerCase())
            )
            .map((m) => (
              <li key={m.user._id} className="member-row">
                {m.user._id === user._id ? (
                  <AvatarUpload avatar={user.avatar} size={42} />
                ) : (
                  <img
                    src={
                      m.user.avatar ||
                      `https://ui-avatars.com/api/?name=${m.user.name}&background=6366f1&color=fff`
                    }
                    alt={m.user.name}
                    className="member-avatar"
                  />
                )}

                <div className="member-info">
                  <span className="member-name">{m.user.name}</span>
                  <span className={`member-role ${m.role}`}>{m.role}</span>
                </div>
              </li>
            ))}
        </ul>

        {isOwner && (
          <button className="invite-btn" onClick={() => setShowInvite(true)}>
            Invite Member
          </button>
        )}

        {!isOwner && (
          <button className="leave-btn" onClick={handleLeave}>
            Leave Circle
          </button>
        )}
      </aside>

      <main className="chat-panel">
        <header className="chat-header">
          <div className="chat-header-row">
            <div>
              <h2>{circle.name}</h2>
              {circle.description && <p>{circle.description}</p>}
            </div>

            <div className="call-actions">
              <button className="call-btn" onClick={() => startCall("audio")}>Audio</button>
              <button className="call-btn" onClick={() => startCall("video")}>Video</button>
              {inCall && (
                <button className="call-btn end" onClick={() => endCall(true)}>
                  End
                </button>
              )}
            </div>
          </div>
        </header>

        <ChatBox circleId={circle._id} />

        {(incomingCall || inCall) && (
          <div className="call-overlay">
            <div className="call-card">
              {incomingCall && !inCall ? (
                <>
                  <h3>Incoming {incomingCall.callType} call</h3>
                  <p>Someone from this circle is calling.</p>
                  <div className="call-overlay-actions">
                    <button className="call-btn" onClick={acceptCall}>Accept</button>
                    <button className="call-btn end" onClick={declineCall}>Decline</button>
                  </div>
                </>
              ) : (
                <>
                  <h3>{callType === "video" ? "Video call" : "Audio call"}</h3>
                  <p>{callStatus || "Connecting..."}</p>

                  <div className="call-media-grid">
                    <video
                      ref={remoteVideoRef}
                      autoPlay
                      playsInline
                      className={`call-video ${callType === "audio" ? "audio-only" : ""}`}
                    />

                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className={`call-video local ${callType === "audio" ? "audio-only" : ""}`}
                    />
                  </div>

                  <div className="call-overlay-actions">
                    <button className="call-btn end" onClick={() => endCall(true)}>
                      Hang up
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {showInvite && (
        <div className="modal-backdrop">
          <div className="invite-modal">
            <h3>Invite Member</h3>

            <input
              type="email"
              placeholder="Enter email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />

            <div className="modal-actions">
              <button onClick={() => setShowInvite(false)}>Cancel</button>
              <button onClick={handleInvite} disabled={sendingInvite}>
                {sendingInvite ? "Sending..." : "Send Invite"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CircleDetail;
