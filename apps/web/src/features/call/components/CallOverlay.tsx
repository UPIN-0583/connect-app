import React from 'react';
import { useCallContext } from '../context/CallContext';

// Simple UI Components
const IncomingCall = () => {
  const { session, acceptCall, rejectCall } = useCallContext();
  if (!session) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-80 text-center">
        <h3 className="text-xl font-bold mb-2">Cuộc gọi đến</h3>
        <p className="text-gray-500 mb-6">Từ: {session.callerId}</p>
        <div className="flex gap-4 justify-center">
          <button onClick={rejectCall} className="px-6 py-2 bg-red-500 text-white rounded-full font-bold">Từ chối</button>
          <button onClick={acceptCall} className="px-6 py-2 bg-green-500 text-white rounded-full font-bold">Nghe</button>
        </div>
      </div>
    </div>
  );
};

const OutgoingCall = () => {
  const { session, cancelCall } = useCallContext();
  if (!session) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-80 text-center">
        <h3 className="text-xl font-bold mb-2">Đang gọi...</h3>
        <p className="text-gray-500 mb-6">Đến: {session.receiverId}</p>
        <button onClick={cancelCall} className="px-6 py-2 bg-red-500 text-white rounded-full font-bold">Hủy</button>
      </div>
    </div>
  );
};

const ActiveCall = () => {
  const { session, endCall, toggleMute, isMuted } = useCallContext();
  const [duration, setDuration] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!session) return null;

  return (
    <div className="fixed top-4 right-4 bg-gray-900 text-white p-4 rounded-2xl shadow-2xl z-50 flex items-center gap-4">
      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center animate-pulse">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
      </div>
      <div>
        <div className="font-bold">{formatTime(duration)}</div>
        <div className="text-xs text-gray-400">Đang trong cuộc gọi</div>
      </div>
      <div className="flex gap-2 ml-4">
        <button onClick={toggleMute} className={`p-3 rounded-full font-medium transition-colors ${isMuted ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
           {isMuted ? 'Unmute' : 'Mute'}
        </button>
        <button onClick={endCall} className="p-3 bg-red-500 hover:bg-red-600 rounded-full text-white">
           End
        </button>
      </div>
    </div>
  );
};

export const CallOverlay = () => {
  const { session } = useCallContext();
  if (!session || session.status === "IDLE") return null;

  if (session.status === "RINGING") return <IncomingCall />;
  if (session.status === "CALLING") return <OutgoingCall />;
  if (session.status === "CONNECTING") return <OutgoingCall />; // Can reuse for CONNECTING
  if (session.status === "CONNECTED") return <ActiveCall />;
  
  return null;
};

export const CallButton = ({ receiverId, conversationId }: { receiverId: string, conversationId: string }) => {
  const { startCall } = useCallContext();
  return (
    <button 
      onClick={() => startCall(conversationId, receiverId)}
      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"
      title="Gọi thoại"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
    </button>
  );
};
