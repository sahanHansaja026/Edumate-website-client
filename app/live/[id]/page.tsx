"use client";

/**
 * MeetingRoom — fully client-side, no backend.
 *
 * Architecture:
 *  - A unique room ID is stored in the URL hash (e.g. /meeting#abc123).
 *  - The first person who loads a fresh hash becomes the HOST.
 *  - Subsequent visitors loading the same hash become GUESTS.
 *  - Peer signaling is done via BroadcastChannel (works across tabs/windows
 *    of the same origin — perfect for a demo without a signaling server).
 *  - Each peer creates a full-mesh RTCPeerConnection with every other peer.
 *  - Real camera / microphone are used via getUserMedia.
 *  - Host can mute / disable camera of any guest (via a control message over
 *    the data channel).
 *  - Whiteboard drawing is broadcast to all peers via the data channel.
 */

import {
  useState, useRef, useEffect, useCallback, useReducer,
} from "react";

// ─────────────────────────────── Types ────────────────────────────────────────

type Tool = "pen" | "eraser" | "highlighter";
type ViewMode = "gallery" | "spotlight" | "whiteboard";
type Tab = "participants" | "chat" | "settings";
type Role = "host" | "guest";

interface PeerInfo {
  peerId: string;
  name: string;
  role: Role;
  isMuted: boolean;
  isCameraOff: boolean;
  isHandRaised: boolean;
  /** Remote MediaStream once connected */
  stream?: MediaStream;
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  isMe: boolean;
}

interface DrawSegment {
  id: string;
  tool: Tool;
  color: string;
  size: number;
  points: { x: number; y: number }[];
  opacity: number;
}

// ─────────────────────── Signaling via BroadcastChannel ───────────────────────
// Each message has a `type` and a `from` (peerId).
// All peers subscribe to channel `meeting:<roomId>`.

type SignalMsg =
  | { type: "join"; from: string; name: string; role: Role }
  | { type: "leave"; from: string }
  | { type: "offer"; from: string; to: string; sdp: RTCSessionDescriptionInit }
  | { type: "answer"; from: string; to: string; sdp: RTCSessionDescriptionInit }
  | { type: "ice"; from: string; to: string; candidate: RTCIceCandidateInit }
  | { type: "state"; from: string; isMuted: boolean; isCameraOff: boolean; isHandRaised: boolean }
  | { type: "host-cmd"; from: string; to: string; cmd: "mute" | "unmute" | "cam-off" | "cam-on" | "kick" }
  | { type: "chat"; from: string; sender: string; text: string; time: string }
  | { type: "draw"; from: string; segment: DrawSegment }
  | { type: "draw-clear"; from: string };

// ───────────────────────────── Constants ──────────────────────────────────────

const PEN_COLORS = [
  "#FF3B5C", "#FF9500", "#FFD60A", "#34C759",
  "#00C7BE", "#007AFF", "#5856D6", "#FF2D55",
  "#FFFFFF", "#1C1C1E",
];

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

function genId(len = 8) {
  return Math.random().toString(36).substring(2, 2 + len);
}

function initials(name: string) {
  return name.split(" ").map(s => s[0]).join("").toUpperCase().slice(0, 2);
}

const AVATAR_COLORS: Record<string, string> = {};
const PALETTE = ["#FF3B5C", "#FF9500", "#34C759", "#007AFF", "#5856D6", "#FF2D55", "#00C7BE", "#FFD60A"];
function avatarColor(id: string) {
  if (!AVATAR_COLORS[id]) {
    AVATAR_COLORS[id] = PALETTE[Object.keys(AVATAR_COLORS).length % PALETTE.length];
  }
  return AVATAR_COLORS[id];
}

// ─────────────────────────── Peer State Reducer ───────────────────────────────

type PeerAction =
  | { type: "add"; peer: PeerInfo }
  | { type: "remove"; peerId: string }
  | { type: "update"; peerId: string; patch: Partial<PeerInfo> }
  | { type: "set-stream"; peerId: string; stream: MediaStream };

function peersReducer(state: PeerInfo[], action: PeerAction): PeerInfo[] {
  switch (action.type) {
    case "add":
      if (state.find(p => p.peerId === action.peer.peerId)) return state;
      return [...state, action.peer];
    case "remove":
      return state.filter(p => p.peerId !== action.peerId);
    case "update":
      return state.map(p => p.peerId === action.peerId ? { ...p, ...action.patch } : p);
    case "set-stream":
      return state.map(p => p.peerId === action.peerId ? { ...p, stream: action.stream } : p);
    default:
      return state;
  }
}

// ───────────────────── RemoteVideoTile ────────────────────────────────────────

function RemoteVideoTile({
  peer,
  isHost,
  onHostCmd,
}: {
  peer: PeerInfo;
  isHost: boolean;
  onHostCmd: (to: string, cmd: "mute" | "unmute" | "cam-off" | "cam-on" | "kick") => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const color = avatarColor(peer.peerId);

  useEffect(() => {
    if (videoRef.current && peer.stream) {
      videoRef.current.srcObject = peer.stream;
    }
  }, [peer.stream]);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-[#161622] border border-white/5 aspect-video group">
      {peer.stream && !peer.isCameraOff ? (
        <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2"
          style={{ background: `radial-gradient(circle at 50% 40%, ${color}22, transparent 70%)` }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold"
            style={{ background: `${color}33`, color, border: `2px solid ${color}55` }}>
            {initials(peer.name)}
          </div>
          <span className="text-xs text-white/40">Camera off</span>
        </div>
      )}

      {/* Name bar */}
      <div className="absolute bottom-0 left-0 right-0 px-2.5 py-1.5 bg-gradient-to-t from-black/70 to-transparent flex items-center gap-1.5">
        <span className="text-xs text-white/90 font-medium truncate flex-1">{peer.name}</span>
        {peer.isMuted && <span className="text-xs opacity-60">🔇</span>}
        {peer.isHandRaised && <span className="text-xs">✋</span>}
      </div>

      {peer.role === "host" && (
        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-[#FF3B5C]/80 text-white">HOST</div>
      )}

      {/* Host controls overlay */}
      {isHost && peer.role !== "host" && (
        <div className="absolute top-2 right-2 hidden group-hover:flex flex-col gap-1">
          <button onClick={() => onHostCmd(peer.peerId, peer.isMuted ? "unmute" : "mute")}
            title={peer.isMuted ? "Ask to unmute" : "Mute"}
            className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white/80 text-xs transition-colors">
            {peer.isMuted ? "🎤" : "🔇"}
          </button>
          <button onClick={() => onHostCmd(peer.peerId, peer.isCameraOff ? "cam-on" : "cam-off")}
            title={peer.isCameraOff ? "Ask to start cam" : "Stop cam"}
            className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white/80 text-xs transition-colors">
            {peer.isCameraOff ? "📹" : "📷"}
          </button>
          <button onClick={() => onHostCmd(peer.peerId, "kick")}
            title="Remove"
            className="p-1.5 rounded-lg bg-red-500/60 hover:bg-red-500/80 text-white text-xs transition-colors">
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

// ───────────────────── LocalVideoTile ─────────────────────────────────────────

function LocalVideoTile({
  videoRef,
  isCameraOff,
  isMuted,
  name,
  role,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isCameraOff: boolean;
  isMuted: boolean;
  name: string;
  role: Role;
}) {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-[#161622] border-2 border-[#007AFF]/40 aspect-video">
      <video ref={videoRef} autoPlay playsInline muted
        className={`absolute inset-0 w-full h-full object-cover ${isCameraOff ? "hidden" : "block"}`} />
      {isCameraOff && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2"
          style={{ background: "radial-gradient(circle at 50% 40%, #007AFF22, transparent 70%)" }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold"
            style={{ background: "#007AFF33", color: "#007AFF", border: "2px solid #007AFF55" }}>
            {initials(name)}
          </div>
          <span className="text-xs text-white/40">Camera off</span>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 px-2.5 py-1.5 bg-gradient-to-t from-black/70 to-transparent flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs text-white/90 font-medium truncate flex-1">You ({name})</span>
        {isMuted && <span className="text-xs opacity-60">🔇</span>}
      </div>
      {role === "host" && (
        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-[#FF3B5C]/80 text-white">HOST</div>
      )}
    </div>
  );
}

// ───────────────────── Whiteboard ─────────────────────────────────────────────

function Whiteboard({
  activeTool, activeColor, penSize, onBack,
  onSegment, onClear,
  incomingSegment, incomingClear,
}: {
  activeTool: Tool; activeColor: string; penSize: number; onBack: () => void;
  onSegment: (seg: DrawSegment) => void;
  onClear: () => void;
  incomingSegment: DrawSegment | null;
  incomingClear: number; // incremented to trigger clear
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [paths, setPaths] = useState<DrawSegment[]>([]);
  const [currentPath, setCurrentPath] = useState<DrawSegment | null>(null);
  const [history, setHistory] = useState<DrawSegment[][]>([[]]);
  const [histIdx, setHistIdx] = useState(0);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    const cx = "touches" in e ? e.touches[0].clientX : e.clientX;
    const cy = "touches" in e ? e.touches[0].clientY : e.clientY;
    return { x: (cx - r.left) * (c.width / r.width), y: (cy - r.top) * (c.height / r.height) };
  };

  const redraw = useCallback((ps: DrawSegment[]) => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, c.width, c.height);
    ps.forEach(seg => {
      if (seg.points.length < 2) return;
      ctx.beginPath(); ctx.globalAlpha = seg.opacity;
      ctx.strokeStyle = seg.tool === "eraser" ? "#1a1a2e" : seg.color;
      ctx.lineWidth = seg.tool === "eraser" ? seg.size * 3 : seg.size;
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.moveTo(seg.points[0].x, seg.points[0].y);
      seg.points.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke(); ctx.globalAlpha = 1;
    });
  }, []);

  useEffect(() => { redraw(paths); }, [paths, redraw]);

  // Receive remote segment
  useEffect(() => {
    if (!incomingSegment) return;
    setPaths(prev => { const n = [...prev, incomingSegment]; redraw(n); return n; });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingSegment]);

  // Receive remote clear
  useEffect(() => {
    if (incomingClear === 0) return;
    setPaths([]); redraw([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingClear]);

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const np: DrawSegment = {
      id: genId(), tool: activeTool, color: activeColor, size: penSize,
      points: [getPos(e)], opacity: activeTool === "highlighter" ? 0.35 : 1,
    };
    setCurrentPath(np); setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing || !currentPath) return;
    const updated = { ...currentPath, points: [...currentPath.points, getPos(e)] };
    setCurrentPath(updated);
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    ctx.beginPath(); ctx.globalAlpha = updated.opacity;
    ctx.strokeStyle = updated.tool === "eraser" ? "#1a1a2e" : updated.color;
    ctx.lineWidth = updated.tool === "eraser" ? updated.size * 3 : updated.size;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    const pts = updated.points;
    ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    ctx.stroke(); ctx.globalAlpha = 1;
  };

  const endDraw = () => {
    if (!isDrawing || !currentPath) return;
    const np = [...paths, currentPath];
    setPaths(np); redraw(np);
    const nh = [...history.slice(0, histIdx + 1), np];
    setHistory(nh); setHistIdx(nh.length - 1);
    onSegment(currentPath);
    setCurrentPath(null); setIsDrawing(false);
  };

  const undo = () => {
    if (histIdx <= 0) return;
    const ni = histIdx - 1; setHistIdx(ni); setPaths(history[ni]); redraw(history[ni]);
  };
  const redo = () => {
    if (histIdx >= history.length - 1) return;
    const ni = histIdx + 1; setHistIdx(ni); setPaths(history[ni]); redraw(history[ni]);
  };
  const clear = () => {
    setPaths([]); redraw([]);
    const nh = [...history.slice(0, histIdx + 1), []]; setHistory(nh); setHistIdx(nh.length - 1);
    onClear();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#0D0D14]/80">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white text-sm transition-colors">
            ← Back
          </button>
          <span className="text-sm font-semibold text-white/80">Collaborative Whiteboard</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={undo} disabled={histIdx <= 0} className="px-2.5 py-1.5 rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors">↩ Undo</button>
          <button onClick={redo} disabled={histIdx >= history.length - 1} className="px-2.5 py-1.5 rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors">↪ Redo</button>
          <button onClick={clear} className="px-2.5 py-1.5 rounded-lg text-xs text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-colors">🗑 Clear All</button>
        </div>
      </div>
      <div className="flex-1 relative overflow-hidden bg-[#1a1a2e]">
        <canvas ref={canvasRef} width={1400} height={900}
          className="absolute inset-0 w-full h-full touch-none"
          style={{ cursor: activeTool === "eraser" ? "cell" : "crosshair" }}
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw} />
        <div className="absolute inset-0 pointer-events-none opacity-[0.07]"
          style={{ backgroundImage: "linear-gradient(#4a4a6a 1px, transparent 1px), linear-gradient(90deg, #4a4a6a 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>
    </div>
  );
}

// ─────────────────────────── Join Screen ──────────────────────────────────────

function JoinScreen({ onJoin, roomId }: { onJoin: (name: string) => void; roomId: string }) {
  const [name, setName] = useState("");
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0D0D14] text-white p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#007AFF] to-[#5856D6] flex items-center justify-center text-2xl font-bold mx-auto mb-4">M</div>
          <h1 className="text-2xl font-bold mb-1">Join Meeting</h1>
          <p className="text-white/40 text-sm font-mono">Room: {roomId}</p>
        </div>
        <div className="space-y-3">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && name.trim() && onJoin(name.trim())}
            placeholder="Your display name…"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#007AFF]/50 transition-all"
            autoFocus
          />
          <button
            onClick={() => name.trim() && onJoin(name.trim())}
            disabled={!name.trim()}
            className="w-full py-3 rounded-xl bg-[#007AFF] hover:bg-[#0066DD] disabled:opacity-40 text-white font-bold transition-colors">
            Join Now
          </button>
        </div>
        <p className="text-center text-white/25 text-xs mt-6">Camera & microphone permissions may be requested after joining.</p>
      </div>
    </div>
  );
}

// ─────────────────────────── Main Component ───────────────────────────────────

export default function MeetingRoom() {
  // ── Room identity ──────────────────────────────────────────────────────────
  const [roomId, setRoomId] = useState<string>("");
  const [myId] = useState(() => genId());
  const [myName, setMyName] = useState<string>("");
  const [myRole, setMyRole] = useState<Role>("guest");
  const [joined, setJoined] = useState(false);

  // ── Media state ────────────────────────────────────────────────────────────
  const [isMuted, setIsMuted] = useState(true);
  const [isCameraOff, setIsCameraOff] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<ViewMode>("gallery");
  const [activeTab, setActiveTab] = useState<Tab>("participants");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [reactions, setReactions] = useState<{ id: string; emoji: string; x: number; y: number }[]>([]);

  // ── Peers ──────────────────────────────────────────────────────────────────
  const [peers, dispatch] = useReducer(peersReducer, []);
  const peersRef = useRef<PeerInfo[]>([]);
  peersRef.current = peers;

  // ── Chat ───────────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Whiteboard ─────────────────────────────────────────────────────────────
  const [activeTool, setActiveTool] = useState<Tool>("pen");
  const [activeColor, setActiveColor] = useState("#007AFF");
  const [penSize, setPenSize] = useState(3);
  const [incomingSegment, setIncomingSegment] = useState<DrawSegment | null>(null);
  const [incomingClearCount, setIncomingClearCount] = useState(0);

  // ── Media refs ─────────────────────────────────────────────────────────────
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // ── WebRTC / Signaling refs ─────────────────────────────────────────────────
  const channelRef = useRef<BroadcastChannel | null>(null);
  /** peerId → RTCPeerConnection */
  const pcsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  /** peerId → RTCDataChannel */
  const dcsRef = useRef<Map<string, RTCDataChannel>>(new Map());

  // ─────────────────────────── Helpers ──────────────────────────────────────

  const broadcastSignal = useCallback((msg: SignalMsg) => {
    channelRef.current?.postMessage(msg);
  }, []);

  const broadcastState = useCallback((
    muted?: boolean, camOff?: boolean, hand?: boolean
  ) => {
    broadcastSignal({
      type: "state", from: myId,
      isMuted: muted ?? isMuted,
      isCameraOff: camOff ?? isCameraOff,
      isHandRaised: hand ?? isHandRaised,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [broadcastSignal, myId, isMuted, isCameraOff, isHandRaised]);

  /** Send a data-channel message to one peer */
  const sendDC = useCallback((peerId: string, data: unknown) => {
    const dc = dcsRef.current.get(peerId);
    if (dc?.readyState === "open") dc.send(JSON.stringify(data));
  }, []);

  /** Broadcast over all open data channels */
  const broadcastDC = useCallback((data: unknown) => {
    dcsRef.current.forEach(dc => {
      if (dc.readyState === "open") dc.send(JSON.stringify(data));
    });
  }, []);

  // ─────────────────────────── WebRTC Setup ─────────────────────────────────

  const createPC = useCallback((remotePeerId: string, initiator: boolean) => {
    if (pcsRef.current.has(remotePeerId)) return pcsRef.current.get(remotePeerId)!;

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pcsRef.current.set(remotePeerId, pc);

    // Add local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => pc.addTrack(t, localStreamRef.current!));
    }

    // ICE candidates
    pc.onicecandidate = e => {
      if (e.candidate) {
        broadcastSignal({ type: "ice", from: myId, to: remotePeerId, candidate: e.candidate.toJSON() });
      }
    };

    // Remote stream
    pc.ontrack = e => {
      const stream = e.streams[0] || new MediaStream([e.track]);
      dispatch({ type: "set-stream", peerId: remotePeerId, stream });
    };

    // Data channel (initiator creates it)
    if (initiator) {
      const dc = pc.createDataChannel("data");
      dcsRef.current.set(remotePeerId, dc);
      dc.onmessage = ev => handleDCMessage(remotePeerId, ev.data);
      dc.onopen = () => {
        // Send current state
        dc.send(JSON.stringify({ type: "state", isMuted, isCameraOff, isHandRaised }));
      };
    } else {
      pc.ondatachannel = e => {
        const dc = e.channel;
        dcsRef.current.set(remotePeerId, dc);
        dc.onmessage = ev => handleDCMessage(remotePeerId, ev.data);
        dc.onopen = () => {
          dc.send(JSON.stringify({ type: "state", isMuted, isCameraOff, isHandRaised }));
        };
      };
    }

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
        dispatch({ type: "remove", peerId: remotePeerId });
        pcsRef.current.delete(remotePeerId);
        dcsRef.current.delete(remotePeerId);
      }
    };

    return pc;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [broadcastSignal, myId, isMuted, isCameraOff, isHandRaised]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleDCMessage = useCallback((fromPeerId: string, raw: string) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.type === "state") {
        dispatch({
          type: "update", peerId: fromPeerId, patch: {
            isMuted: msg.isMuted, isCameraOff: msg.isCameraOff, isHandRaised: msg.isHandRaised,
          }
        });
      } else if (msg.type === "host-cmd") {
        // This is a message from host to us
        if (msg.cmd === "mute") { stopMic(); }
        if (msg.cmd === "unmute") { /* can't force unmute — just notify */ }
        if (msg.cmd === "cam-off") { stopCamera(); }
        if (msg.cmd === "cam-on") { /* can't force cam on */ }
        if (msg.cmd === "kick") { window.location.href = "/"; }
      } else if (msg.type === "chat") {
        setMessages(prev => [...prev, {
          id: genId(), sender: msg.sender, text: msg.text, time: msg.time, isMe: false,
        }]);
      } else if (msg.type === "draw") {
        setIncomingSegment(msg.segment);
      } else if (msg.type === "draw-clear") {
        setIncomingClearCount(c => c + 1);
      }
    } catch { /* ignore */ }
  }, []); // stopMic / stopCamera referenced below via closure

  // ─────────────────────────── Camera / Mic ─────────────────────────────────

  const stopCamera = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(t => { t.stop(); t.enabled = false; });
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    setIsCameraOff(true);
    broadcastState(undefined, true);
  }, [broadcastState]);

  const startCamera = useCallback(async () => {
    setMediaError(null);
    try {
      const videoTrack = (await navigator.mediaDevices.getUserMedia({ video: true, audio: false })).getVideoTracks()[0];
      if (!localStreamRef.current) localStreamRef.current = new MediaStream();
      // Replace existing video tracks
      localStreamRef.current.getVideoTracks().forEach(t => localStreamRef.current!.removeTrack(t));
      localStreamRef.current.addTrack(videoTrack);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
        await localVideoRef.current.play().catch(() => { });
      }
      // Replace track in all PCs
      pcsRef.current.forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === "video");
        if (sender) sender.replaceTrack(videoTrack).catch(() => { });
        else pc.addTrack(videoTrack, localStreamRef.current!);
      });
      setIsCameraOff(false);
      broadcastState(undefined, false);
    } catch (err: unknown) {
      const e = err as Error;
      setMediaError(e.name === "NotAllowedError" ? "Camera permission denied." : `Camera error: ${e.message}`);
      setIsCameraOff(true);
    }
  }, [broadcastState]);

  const toggleCamera = useCallback(() => isCameraOff ? startCamera() : stopCamera(), [isCameraOff, startCamera, stopCamera]);

  const stopMic = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = false; });
    }
    setIsMuted(true);
    broadcastState(true);
  }, [broadcastState]);

  const startMic = useCallback(async () => {
    setMediaError(null);
    try {
      // Check if we already have an audio track
      const existingAudio = localStreamRef.current?.getAudioTracks()[0];
      if (existingAudio) {
        existingAudio.enabled = true;
        setIsMuted(false);
        broadcastState(false);
        return;
      }
      const audioTrack = (await navigator.mediaDevices.getUserMedia({ audio: true, video: false })).getAudioTracks()[0];
      if (!localStreamRef.current) localStreamRef.current = new MediaStream();
      localStreamRef.current.addTrack(audioTrack);
      // Add to all PCs
      pcsRef.current.forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === "audio");
        if (sender) sender.replaceTrack(audioTrack).catch(() => { });
        else pc.addTrack(audioTrack, localStreamRef.current!);
      });
      setIsMuted(false);
      broadcastState(false);
    } catch (err: unknown) {
      const e = err as Error;
      setMediaError(e.name === "NotAllowedError" ? "Mic permission denied." : `Mic error: ${e.message}`);
      setIsMuted(true);
    }
  }, [broadcastState]);

  const toggleMic = useCallback(() => isMuted ? startMic() : stopMic(), [isMuted, startMic, stopMic]);

  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) { setIsScreenSharing(false); return; }
    try {
      await navigator.mediaDevices.getDisplayMedia({ video: true });
      setIsScreenSharing(true);
    } catch { /* cancelled */ }
  }, [isScreenSharing]);

  // ─────────────────────────── Signaling Handler ────────────────────────────

  const handleSignal = useCallback(async (msg: SignalMsg) => {
    if (msg.from === myId) return; // ignore own messages

    if (msg.type === "join") {
      // New peer joined — add to list and initiate offer (if we're higher ID to avoid collision)
      dispatch({
        type: "add", peer: {
          peerId: msg.from, name: msg.name, role: msg.role,
          isMuted: true, isCameraOff: true, isHandRaised: false,
        }
      });
      // Lower peerId initiates
      if (myId < msg.from) {
        const pc = createPC(msg.from, true);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        broadcastSignal({ type: "offer", from: myId, to: msg.from, sdp: pc.localDescription! });
      }
      // Announce ourselves back to the new joiner
      broadcastSignal({ type: "join", from: myId, name: myName, role: myRole });

    } else if (msg.type === "leave") {
      dispatch({ type: "remove", peerId: msg.from });
      pcsRef.current.get(msg.from)?.close();
      pcsRef.current.delete(msg.from);
      dcsRef.current.delete(msg.from);

    } else if (msg.type === "offer" && msg.to === myId) {
      const pc = createPC(msg.from, false);
      await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      broadcastSignal({ type: "answer", from: myId, to: msg.from, sdp: pc.localDescription! });

    } else if (msg.type === "answer" && msg.to === myId) {
      const pc = pcsRef.current.get(msg.from);
      if (pc && pc.signalingState !== "stable") {
        await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
      }

    } else if (msg.type === "ice" && msg.to === myId) {
      const pc = pcsRef.current.get(msg.from);
      if (pc) await pc.addIceCandidate(new RTCIceCandidate(msg.candidate)).catch(() => { });

    } else if (msg.type === "state") {
      dispatch({
        type: "update", peerId: msg.from, patch: {
          isMuted: msg.isMuted, isCameraOff: msg.isCameraOff, isHandRaised: msg.isHandRaised,
        }
      });

    } else if (msg.type === "host-cmd" && msg.to === myId) {
      if (msg.cmd === "mute") stopMic();
      if (msg.cmd === "cam-off") stopCamera();
      if (msg.cmd === "kick") { window.location.href = "/"; }

    } else if (msg.type === "chat") {
      setMessages(prev => [...prev, {
        id: genId(), sender: msg.sender, text: msg.text, time: msg.time, isMe: false,
      }]);

    } else if (msg.type === "draw") {
      setIncomingSegment(msg.segment);

    } else if (msg.type === "draw-clear") {
      setIncomingClearCount(c => c + 1);
    }
  }, [myId, myName, myRole, createPC, broadcastSignal, stopMic, stopCamera]);

  // ─────────────────────────── Room Init / Join ──────────────────────────────

  useEffect(() => {
    // Parse / generate room ID from URL hash
    let hash = window.location.hash.replace("#", "").trim();
    if (!hash) {
      hash = genId(6);
      window.location.hash = hash;
    }
    setRoomId(hash);
  }, []);

  const handleJoin = useCallback((name: string) => {
    setMyName(name);
    // Determine role: if nobody else is in the room we become host.
    // We'll set role after checking; for simplicity, the first person
    // who joins (generates a fresh hash) is host. Others are guests.
    // We encode "host" token in sessionStorage per room.
    const hostKey = `meeting-host-${roomId}`;
    const isFirstJoiner = !sessionStorage.getItem(hostKey);
    const role: Role = isFirstJoiner ? "host" : "guest";
    if (isFirstJoiner) sessionStorage.setItem(hostKey, myId);
    setMyRole(role);
    setJoined(true);
  }, [roomId, myId]);

  // After joined, open BroadcastChannel and announce
  useEffect(() => {
    if (!joined || !roomId || !myName) return;

    const ch = new BroadcastChannel(`meeting:${roomId}`);
    channelRef.current = ch;

    ch.onmessage = (e: MessageEvent<SignalMsg>) => handleSignal(e.data);

    // Announce self
    broadcastSignal({ type: "join", from: myId, name: myName, role: myRole });

    // Timer
    const timer = setInterval(() => setElapsed(t => t + 1), 1000);

    return () => {
      broadcastSignal({ type: "leave", from: myId });
      ch.close();
      channelRef.current = null;
      clearInterval(timer);
      pcsRef.current.forEach(pc => pc.close());
      pcsRef.current.clear();
      dcsRef.current.clear();
      localStreamRef.current?.getTracks().forEach(t => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joined, roomId, myName]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // ─────────────────────────── Host Commands ────────────────────────────────

  const sendHostCmd = useCallback((to: string, cmd: "mute" | "unmute" | "cam-off" | "cam-on" | "kick") => {
    if (myRole !== "host") return;
    // Via BroadcastChannel signaling
    broadcastSignal({ type: "host-cmd", from: myId, to, cmd });
    // Also via data channel for reliability
    sendDC(to, { type: "host-cmd", cmd });
  }, [myRole, broadcastSignal, myId, sendDC]);

  // ─────────────────────────── Chat ─────────────────────────────────────────

  const sendMessage = useCallback(() => {
    if (!chatInput.trim()) return;
    const time = new Date().toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" });
    const msgData = {
      sender: myName,
      text: chatInput.trim(),
      time,
    };
    setMessages(prev => [...prev, { id: genId(), ...msgData, isMe: true }]);
    broadcastSignal({ type: "chat", from: myId, ...msgData });
    broadcastDC(msgData);
    setChatInput("");
  }, [chatInput, myName, myId, broadcastSignal, broadcastDC]);

  // ─────────────────────────── Whiteboard broadcast ─────────────────────────

  const onDrawSegment = useCallback((seg: DrawSegment) => {
    broadcastSignal({ type: "draw", from: myId, segment: seg });
    broadcastDC({ type: "draw", segment: seg });
  }, [broadcastSignal, broadcastDC, myId]);

  const onDrawClear = useCallback(() => {
    broadcastSignal({ type: "draw-clear", from: myId });
    broadcastDC({ type: "draw-clear" });
  }, [broadcastSignal, broadcastDC, myId]);

  // ─────────────────────────── Reactions ────────────────────────────────────

  const sendReaction = (emoji: string) => {
    const id = genId();
    setReactions(prev => [...prev, { id, emoji, x: Math.random() * 60 + 20, y: Math.random() * 40 + 30 }]);
    setTimeout(() => setReactions(prev => prev.filter(r => r.id !== id)), 2500);
  };

  // ─────────────────────────── Helpers ──────────────────────────────────────

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
      : `${m}:${String(sec).padStart(2, "0")}`;
  };

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}${window.location.pathname}#${roomId}`
    : "";

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const allParticipants = [
    { peerId: myId, name: myName, role: myRole, isMuted, isCameraOff, isHandRaised } as PeerInfo,
    ...peers,
  ];

  const tools: { id: Tool; icon: string; label: string }[] = [
    { id: "pen", icon: "✏️", label: "Pen" },
    { id: "highlighter", icon: "🖊", label: "Highlight" },
    { id: "eraser", icon: "⌫", label: "Eraser" },
  ];

  // ─────────────────────────── Join Screen ──────────────────────────────────

  if (!joined) {
    return <JoinScreen onJoin={handleJoin} roomId={roomId} />;
  }

  // ─────────────────────────── Meeting UI ───────────────────────────────────

  return (
    <div className="flex flex-col h-screen bg-[#0D0D14] text-white overflow-hidden font-sans select-none">

      {/* Media Error Banner */}
      {mediaError && (
        <div className="flex items-center justify-between px-4 py-2 bg-red-500/20 border-b border-red-500/30 text-red-300 text-xs z-40">
          <span>⚠️ {mediaError}</span>
          <button onClick={() => setMediaError(null)} className="text-red-400 hover:text-red-200 ml-4">✕</button>
        </div>
      )}

      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-[#0D0D14]/95 backdrop-blur-md z-30 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#007AFF] to-[#5856D6] flex items-center justify-center text-xs font-bold">M</div>
            <div>
              <div className="text-sm font-semibold text-white leading-none">Meeting Room</div>
              <div className="text-[11px] text-white/40 leading-none mt-0.5 font-mono hidden sm:block">{roomId}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-white/70">{formatTime(elapsed)}</span>
            </div>
            {isRecording && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/15 border border-red-500/30 animate-pulse">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span className="text-xs font-semibold text-red-400">REC</span>
              </div>
            )}
            {myRole === "host" && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FF3B5C]/20 border border-[#FF3B5C]/30 text-[#FF3B5C]">HOST</span>
            )}
          </div>
        </div>

        {/* View mode switcher */}
        <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/5">
          {(["gallery", "spotlight", "whiteboard"] as ViewMode[]).map(mode => (
            <button key={mode} onClick={() => setViewMode(mode)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${viewMode === mode ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"}`}>
              {mode === "gallery" ? "⊞ Gallery" : mode === "spotlight" ? "⊡ Spotlight" : "✏ Board"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 text-xs text-white/50">
            <span>👥</span> {allParticipants.length}
          </span>
          <button onClick={() => setShowInviteModal(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#007AFF]/20 hover:bg-[#007AFF]/30 border border-[#007AFF]/30 text-[#007AFF] text-xs font-semibold transition-colors">
            + Invite
          </button>
          <button onClick={() => setSidebarOpen(s => !s)}
            className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors text-sm">
            {sidebarOpen ? "⟩" : "⟨"}
          </button>
          <button onClick={() => setShowEndModal(true)}
            className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 text-xs font-bold transition-colors">
            {myRole === "host" ? "End" : "Leave"}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">

        {/* Whiteboard Toolbar */}
        {viewMode === "whiteboard" && (
          <aside className="flex flex-col items-center gap-3 px-2 py-4 border-r border-white/5 bg-[#0D0D14]/80 z-20 w-14 md:w-16">
            <div className="flex flex-col gap-1">
              {tools.map(t => (
                <button key={t.id} title={t.label} onClick={() => setActiveTool(t.id)}
                  className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-sm transition-all ${activeTool === t.id ? "bg-[#007AFF] text-white shadow-lg shadow-blue-500/30" : "hover:bg-white/10 text-white/50 hover:text-white"}`}>
                  {t.icon}
                </button>
              ))}
            </div>
            <div className="w-8 h-px bg-white/10" />
            <div className="flex flex-col gap-1.5">
              {PEN_COLORS.slice(0, 8).map(c => (
                <button key={c} onClick={() => setActiveColor(c)}
                  className={`w-5 h-5 rounded-full transition-all ${activeColor === c ? "ring-2 ring-white ring-offset-1 ring-offset-[#0D0D14] scale-110" : "opacity-70 hover:opacity-100"}`}
                  style={{ background: c }} />
              ))}
            </div>
            <div className="w-8 h-px bg-white/10" />
            {[2, 4, 7].map(s => (
              <button key={s} onClick={() => setPenSize(s)}
                className={`flex items-center justify-center w-9 h-6 rounded-lg transition-colors ${penSize === s ? "bg-white/15" : "hover:bg-white/5"}`}>
                <div className="rounded-full bg-white/80" style={{ width: s * 2, height: s * 2 }} />
              </button>
            ))}
          </aside>
        )}

        {/* Center Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {viewMode === "whiteboard" ? (
            <Whiteboard
              activeTool={activeTool} activeColor={activeColor} penSize={penSize}
              onBack={() => setViewMode("gallery")}
              onSegment={onDrawSegment} onClear={onDrawClear}
              incomingSegment={incomingSegment} incomingClear={incomingClearCount}
            />
          ) : viewMode === "spotlight" ? (
            <div className="flex-1 flex flex-col p-3 gap-3 overflow-hidden">
              <div className="flex-1 min-h-0">
                <LocalVideoTile videoRef={localVideoRef} isCameraOff={isCameraOff} isMuted={isMuted} name={myName} role={myRole} />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 flex-shrink-0">
                {peers.map(p => (
                  <div key={p.peerId} className="w-28 flex-shrink-0">
                    <RemoteVideoTile peer={p} isHost={myRole === "host"} onHostCmd={sendHostCmd} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Gallery view */
            <div className="flex-1 p-3 overflow-auto">
              {allParticipants.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-white/30">
                  <div className="text-4xl">👥</div>
                  <p className="text-sm">You're alone — share the link to invite others</p>
                  <button onClick={() => setShowInviteModal(true)}
                    className="px-4 py-2 rounded-xl bg-[#007AFF]/20 border border-[#007AFF]/30 text-[#007AFF] text-sm font-semibold hover:bg-[#007AFF]/30 transition-colors">
                    + Invite
                  </button>
                </div>
              ) : (
                <div className="grid gap-2 h-full"
                  style={{ gridTemplateColumns: `repeat(${Math.min(allParticipants.length <= 1 ? 1 : allParticipants.length <= 4 ? 2 : 3, 3)}, 1fr)` }}>
                  <LocalVideoTile videoRef={localVideoRef} isCameraOff={isCameraOff} isMuted={isMuted} name={myName} role={myRole} />
                  {peers.map(p => (
                    <RemoteVideoTile key={p.peerId} peer={p} isHost={myRole === "host"} onHostCmd={sendHostCmd} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bottom Controls */}
          <div className="flex-shrink-0 flex items-center justify-center gap-2 md:gap-3 px-4 py-3 border-t border-white/5 bg-[#0D0D14]/95 backdrop-blur-md flex-wrap">

            {/* Mic */}
            <button onClick={toggleMic} title={isMuted ? "Unmute" : "Mute"}
              className={`flex flex-col items-center gap-1 p-2.5 md:p-3 rounded-2xl transition-all ${isMuted ? "bg-red-500/20 border border-red-500/40 text-red-400" : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-transparent"}`}>
              <span className="text-lg">{isMuted ? "🔇" : "🎤"}</span>
              <span className="text-[10px] hidden sm:block">{isMuted ? "Unmute" : "Mute"}</span>
            </button>

            {/* Camera */}
            <button onClick={toggleCamera} title={isCameraOff ? "Start camera" : "Stop camera"}
              className={`flex flex-col items-center gap-1 p-2.5 md:p-3 rounded-2xl transition-all ${isCameraOff ? "bg-red-500/20 border border-red-500/40 text-red-400" : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-transparent"}`}>
              <span className="text-lg">{isCameraOff ? "📷" : "📹"}</span>
              <span className="text-[10px] hidden sm:block">{isCameraOff ? "Start Cam" : "Stop Cam"}</span>
            </button>

            {/* Screen Share */}
            <button onClick={toggleScreenShare} title={isScreenSharing ? "Stop sharing" : "Share screen"}
              className={`flex flex-col items-center gap-1 p-2.5 md:p-3 rounded-2xl transition-all ${isScreenSharing ? "bg-[#007AFF]/20 border border-[#007AFF]/40 text-[#007AFF]" : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-transparent"}`}>
              <span className="text-lg">🖥️</span>
              <span className="text-[10px] hidden sm:block">{isScreenSharing ? "Sharing" : "Share"}</span>
            </button>

            {/* Whiteboard */}
            <button onClick={() => setViewMode(v => v === "whiteboard" ? "gallery" : "whiteboard")}
              className={`flex flex-col items-center gap-1 p-2.5 md:p-3 rounded-2xl transition-all ${viewMode === "whiteboard" ? "bg-[#5856D6]/20 border border-[#5856D6]/40 text-[#5856D6]" : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-transparent"}`}>
              <span className="text-lg">✏️</span>
              <span className="text-[10px] hidden sm:block">Board</span>
            </button>

            {/* Record */}
            <button onClick={() => setIsRecording(r => !r)}
              className={`flex flex-col items-center gap-1 p-2.5 md:p-3 rounded-2xl transition-all ${isRecording ? "bg-red-500/20 border border-red-500/40 text-red-400 animate-pulse" : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-transparent"}`}>
              <span className="text-lg">⏺️</span>
              <span className="text-[10px] hidden sm:block">{isRecording ? "Stop Rec" : "Record"}</span>
            </button>

            {/* Hand raise */}
            <button onClick={() => {
              const next = !isHandRaised; setIsHandRaised(next);
              broadcastState(undefined, undefined, next);
            }}
              className={`flex flex-col items-center gap-1 p-2.5 md:p-3 rounded-2xl transition-all ${isHandRaised ? "bg-[#FF9500]/20 border border-[#FF9500]/40 text-[#FF9500]" : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-transparent"}`}>
              <span className="text-lg">✋</span>
              <span className="text-[10px] hidden sm:block">Raise</span>
            </button>

            {/* Reactions */}
            <div className="relative group">
              <button className="flex flex-col items-center gap-1 p-2.5 md:p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-transparent transition-all">
                <span className="text-lg">😊</span>
                <span className="text-[10px] hidden sm:block">React</span>
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex gap-1.5 bg-[#1C1C2E] border border-white/10 rounded-2xl px-2 py-2 shadow-2xl z-50">
                {["👍", "❤️", "😂", "🎉", "👏", "🔥"].map(e => (
                  <button key={e} onClick={() => sendReaction(e)} className="text-xl hover:scale-125 transition-transform">{e}</button>
                ))}
              </div>
            </div>

            {/* Invite (mobile) */}
            <button onClick={() => setShowInviteModal(true)}
              className="flex flex-col items-center gap-1 p-2.5 md:p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-transparent transition-all sm:hidden">
              <span className="text-lg">🔗</span>
              <span className="text-[10px]">Invite</span>
            </button>
          </div>
        </main>

        {/* Right Sidebar */}
        {sidebarOpen && (
          <aside className="w-72 md:w-80 flex flex-col border-l border-white/5 bg-[#0D0D14]/80 flex-shrink-0">
            <div className="flex border-b border-white/5 flex-shrink-0">
              {(["participants", "chat", "settings"] as Tab[]).map(t => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className={`flex-1 py-2.5 text-xs font-semibold capitalize transition-colors relative ${activeTab === t ? "text-white" : "text-white/40 hover:text-white/70"}`}>
                  {t === "participants" ? `👥 (${allParticipants.length})` : t === "chat" ? "💬 Chat" : "⚙ More"}
                  {activeTab === t && <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-[#007AFF] rounded-full" />}
                </button>
              ))}
            </div>

            {activeTab === "participants" && (
              <div className="flex-1 overflow-y-auto py-2">
                {allParticipants.map(p => {
                  const color = p.role === "host" ? "#FF3B5C" : p.role === "guest" ? "#007AFF" : "#007AFF";
                  return (
                    <div key={p.peerId} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors group">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: `${color}22`, border: `1.5px solid ${color}55`, color }}>
                        {initials(p.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm text-white/90 font-medium truncate">{p.name}{p.peerId === myId ? " (You)" : ""}</span>
                          {p.isHandRaised && <span className="text-xs">✋</span>}
                        </div>
                        <span className="text-xs capitalize" style={{ color }}>{p.role}</span>
                      </div>
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {p.isMuted && <span className="text-xs opacity-60">🔇</span>}
                        {myRole === "host" && p.peerId !== myId && (
                          <>
                            <button onClick={() => sendHostCmd(p.peerId, p.isMuted ? "unmute" : "mute")}
                              className="p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors text-xs"
                              title={p.isMuted ? "Unmute" : "Mute"}>
                              {p.isMuted ? "🎤" : "🔇"}
                            </button>
                            <button onClick={() => sendHostCmd(p.peerId, "kick")}
                              className="p-1 rounded-lg hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors text-xs"
                              title="Remove">✕</button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div className="px-4 pt-3 pb-2">
                  <button onClick={() => setShowInviteModal(true)}
                    className="w-full py-2 rounded-xl border border-dashed border-white/15 text-white/40 hover:text-white/70 hover:border-white/30 text-xs transition-colors">
                    + Invite participants
                  </button>
                </div>
              </div>
            )}

            {activeTab === "chat" && (
              <>
                <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
                  {messages.length === 0 && (
                    <p className="text-center text-white/25 text-xs pt-8">No messages yet — say hello!</p>
                  )}
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex gap-2 ${msg.isMe ? "flex-row-reverse" : ""}`}>
                      {!msg.isMe && (
                        <div className="w-7 h-7 rounded-full bg-[#007AFF]/20 border border-[#007AFF]/30 flex items-center justify-center text-[10px] font-bold text-[#007AFF] flex-shrink-0 mt-0.5">
                          {initials(msg.sender)}
                        </div>
                      )}
                      <div className={`max-w-[75%] ${msg.isMe ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                        {!msg.isMe && <span className="text-[10px] text-white/40 pl-0.5">{msg.sender}</span>}
                        <div className={`px-3 py-2 rounded-2xl text-sm leading-snug ${msg.isMe ? "bg-[#007AFF] text-white rounded-tr-sm" : "bg-white/[0.08] text-white/90 rounded-tl-sm"}`}>
                          {msg.text}
                        </div>
                        <span className="text-[9px] text-white/25 px-0.5">{msg.time}</span>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <div className="p-3 border-t border-white/5 flex-shrink-0">
                  <div className="flex gap-2">
                    <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && sendMessage()}
                      placeholder="Type a message…"
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#007AFF]/50 transition-all" />
                    <button onClick={sendMessage}
                      className="px-3 py-2 rounded-xl bg-[#007AFF] hover:bg-[#0066DD] text-white text-sm transition-colors">↑</button>
                  </div>
                </div>
              </>
            )}

            {activeTab === "settings" && (
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
                <div className="px-1 py-2">
                  <p className="text-xs text-white/30 mb-3">Room Link</p>
                  <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 flex items-center justify-between gap-2">
                    <span className="text-xs text-white/50 font-mono truncate">{shareUrl}</span>
                    <button onClick={copyLink}
                      className={`text-xs font-semibold flex-shrink-0 transition-colors ${copySuccess ? "text-emerald-400" : "text-[#007AFF] hover:text-[#5AC8FA]"}`}>
                      {copySuccess ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
                {[
                  { label: "Lock meeting", icon: "🔒", desc: "Prevent new participants" },
                  {
                    label: "Mute all guests", icon: "🔇", desc: "Host only",
                    action: () => peers.filter(p => p.role !== "host").forEach(p => sendHostCmd(p.peerId, "mute"))
                  },
                  { label: "Allow reactions", icon: "😊", desc: "Enable emoji reactions" },
                  { label: "Closed captions", icon: "💬", desc: "Show live captions" },
                  { label: "Noise suppression", icon: "🔈", desc: "Reduce background noise" },
                  { label: "Breakout rooms", icon: "🏠", desc: "Split into smaller groups" },
                ].map(item => (
                  <div key={item.label} onClick={item.action}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{item.icon}</span>
                      <div>
                        <div className="text-sm text-white/80 font-medium group-hover:text-white transition-colors">{item.label}</div>
                        <div className="text-xs text-white/35">{item.desc}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </aside>
        )}
      </div>

      {/* Floating Reactions */}
      {reactions.map(r => (
        <div key={r.id} className="fixed text-3xl pointer-events-none z-50"
          style={{ left: `${r.x}%`, top: `${r.y}%`, animation: "floatUp 2.5s ease-out forwards" }}>
          {r.emoji}
        </div>
      ))}

      {/* End / Leave Modal */}
      {showEndModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1C2E] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">{myRole === "host" ? "End Meeting?" : "Leave Meeting?"}</h3>
            <p className="text-sm text-white/50 mb-6">
              {myRole === "host" ? "This will end the meeting for everyone." : "You can rejoin with the same link."}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowEndModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-sm font-semibold transition-colors">Cancel</button>
              <button onClick={() => { broadcastSignal({ type: "leave", from: myId }); window.location.href = "/"; }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors">
                {myRole === "host" ? "End for All" : "Leave"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1C2E] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Invite People</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-white/40 hover:text-white text-xl transition-colors">✕</button>
            </div>
            <p className="text-xs text-white/40 mb-3">Share this link — anyone who opens it can join your meeting.</p>
            <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-3 flex items-center justify-between mb-3 gap-2">
              <span className="text-xs text-white/60 font-mono truncate">{shareUrl}</span>
              <button onClick={copyLink}
                className={`text-xs font-semibold flex-shrink-0 transition-colors ${copySuccess ? "text-emerald-400" : "text-[#007AFF]"}`}>
                {copySuccess ? "✓ Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-[11px] text-white/25 text-center">Works across tabs & windows on the same device, or across devices on the same network with a proper WebRTC setup.</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes floatUp {
          0%   { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-80px) scale(1.4); }
        }
      `}</style>
    </div>
  );
}
