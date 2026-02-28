import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Alert } from 'react-native';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';


let RTCPeerConnection: any = null;
let RTCIceCandidate: any = null;
let RTCSessionDescription: any = null;
let mediaDevices: any = null;
let MediaStreamType: any = null;
let isWebRTCAvailable = false;

try {
    const webrtc = require('react-native-webrtc');
    RTCPeerConnection = webrtc.RTCPeerConnection;
    RTCIceCandidate = webrtc.RTCIceCandidate;
    RTCSessionDescription = webrtc.RTCSessionDescription;
    mediaDevices = webrtc.mediaDevices;
    MediaStreamType = webrtc.MediaStream;
    // Test if native module is truly linked, by accessing a native constant or just assuming if require didn't throw
    if (RTCPeerConnection) isWebRTCAvailable = true;
} catch (error) {
    console.warn('react-native-webrtc is not available. Expo Go does not support custom native modules. Call features disabled.');
    isWebRTCAvailable = false;
}

// For typing purposes where MediaStream is used as a Type
type MediaStream = any;

interface CallState {
    active: boolean;
    isReceiving: boolean;
    from: string | null;
    name: string | null;
    type: 'audio' | 'video';
    roomId: string | null;
    status: 'idle' | 'ringing' | 'connected' | 'ended';
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
}

interface CallContextType {
    call: CallState;
    startCall: (targetId: string, name: string, type: 'audio' | 'video', isGroup?: boolean) => void;
    answerCall: () => void;
    rejectCall: () => void;
    endCall: () => void;
    toggleMic: () => void;
    toggleCamera: () => void;
}

const initialCallState: CallState = {
    active: false,
    isReceiving: false,
    from: null,
    name: null,
    type: 'audio',
    roomId: null,
    status: 'idle',
    localStream: null,
    remoteStream: null,
};

const CallContext = createContext<CallContextType | undefined>(undefined);

const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
    ],
};

export function CallProvider({ children }: { children: ReactNode }) {
    const { socket } = useSocket();
    const { user } = useAuth();
    const [call, setCall] = useState<CallState>(initialCallState);
    const pc = useRef<any>(null);

    useEffect(() => {
        if (!socket) return;

        socket.on('incoming_call', async (data) => {
            setCall({
                ...initialCallState,
                active: true,
                isReceiving: true,
                from: data.from,
                name: data.name,
                type: data.type,
                roomId: data.roomId,
                status: 'ringing'
            });
            // Store the initial signal (offer)
            if (data.signalData) {
                (pc as any)._incomingSignal = data.signalData;
            }
        });

        socket.on('webrtc_signal', async (data) => {
            if (!pc.current) return;
            try {
                if (data.signal.type === 'offer' || data.signal.type === 'answer') {
                    await pc.current.setRemoteDescription(new RTCSessionDescription(data.signal));
                } else if (data.signal.candidate) {
                    await pc.current.addIceCandidate(new RTCIceCandidate(data.signal));
                }
            } catch (e) {
                console.error('Signal error', e);
            }
        });

        socket.on('call_accepted', async (data) => {
            setCall(prev => ({ ...prev, status: 'connected' }));
            if (data.signalData && pc.current) {
                try {
                    await pc.current.setRemoteDescription(new RTCSessionDescription(data.signalData));
                } catch (e) { console.error('Error setting remote answer', e); }
            }
        });

        socket.on('call_rejected', (data) => {
            cleanupCall();
        });

        socket.on('call_ended', (data) => {
            cleanupCall();
        });

        return () => {
            socket.off('incoming_call');
            socket.off('webrtc_signal');
            socket.off('call_accepted');
            socket.off('call_rejected');
            socket.off('call_ended');
        };
    }, [socket]);

    const setupPeerConnection = (stream: MediaStream, targetId: string) => {
        const peer = new RTCPeerConnection(configuration);

        stream.getTracks().forEach((track: any) => {
            peer.addTrack(track, stream);
        });

        const p = peer as any;
        p.onicecandidate = (event: any) => {
            if (event.candidate && socket) {
                socket.emit('webrtc_signal', {
                    to: targetId,
                    from: user?._id,
                    signal: event.candidate,
                    roomId: call.roomId
                });
            }
        };

        p.ontrack = (event: any) => {
            setCall(prev => ({ ...prev, remoteStream: event.streams[0] }));
        };


        pc.current = peer;
        return peer;
    };

    const cleanupCall = () => {
        if (pc.current) {
            pc.current.close();
            pc.current = null;
        }
        if (call.localStream) {
            call.localStream.getTracks().forEach((track: any) => track.stop());
        }
        setCall(initialCallState);
    };

    const startCall = async (targetId: string, targetName: string, type: 'audio' | 'video', isGroup = false) => {
        if (!isWebRTCAvailable) {
            Alert.alert('Unsupported', 'Calling is not supported in Expo Go. Please use a development build.');
            return;
        }
        if (!socket || !user) return;
        try {
            const stream = await mediaDevices.getUserMedia({
                audio: true,
                video: type === 'video'
            }) as MediaStream;

            const roomId = isGroup ? targetId : [user._id, targetId].sort().join('-');

            setCall({
                active: true,
                isReceiving: false,
                from: targetId,
                name: targetName,
                type,
                roomId,
                status: 'ringing',
                localStream: stream,
                remoteStream: null
            });

            const peer = setupPeerConnection(stream, targetId);
            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);

            socket.emit('call_user', {
                userToCall: targetId,
                from: user._id,
                name: user.name,
                type,
                isGroup,
                roomId,
                signalData: offer
            });
        } catch (e) {
            Alert.alert('Error', 'Could not access camera/microphone');
        }
    };

    const answerCall = async () => {
        if (!isWebRTCAvailable) {
            Alert.alert('Unsupported', 'Calling is not supported in Expo Go. Please use a development build.');
            return;
        }
        if (!socket || !user || !call.roomId) return;
        try {
            const stream = await mediaDevices.getUserMedia({
                audio: true,
                video: call.type === 'video'
            }) as MediaStream;

            setCall(prev => ({ ...prev, localStream: stream, status: 'connected' }));

            const peer = setupPeerConnection(stream, call.from!);

            // Set remote offer
            const incomingSignal = (pc as any)._incomingSignal;
            if (incomingSignal) {
                await peer.setRemoteDescription(new RTCSessionDescription(incomingSignal));
                const answer = await peer.createAnswer();
                await peer.setLocalDescription(answer);

                socket.emit('accept_call', {
                    to: call.from,
                    roomId: call.roomId,
                    from: user._id,
                    signalData: answer
                });
            } else {
                socket.emit('accept_call', {
                    to: call.from,
                    roomId: call.roomId,
                    from: user._id
                });
            }
        } catch (e) {
            Alert.alert('Error', 'Could not access camera/microphone');
        }
    };

    const rejectCall = () => {
        if (!socket || !user || !call.roomId) return;
        socket.emit('reject_call', {
            to: call.from,
            roomId: call.roomId,
            from: user._id
        });
        cleanupCall();
    };

    const endCall = () => {
        if (!socket || !user || !call.roomId) return;
        socket.emit('end_call', {
            to: call.from,
            roomId: call.roomId,
            from: user._id
        });
        cleanupCall();
    };

    const toggleMic = () => {
        if (call.localStream) {
            const audioTrack = call.localStream.getAudioTracks()[0];
            if (audioTrack) audioTrack.enabled = !audioTrack.enabled;
        }
    };

    const toggleCamera = () => {
        if (call.localStream) {
            const videoTrack = call.localStream.getVideoTracks()[0];
            if (videoTrack) videoTrack.enabled = !videoTrack.enabled;
        }
    };

    return (
        <CallContext.Provider value={{ call, startCall, answerCall, rejectCall, endCall, toggleMic, toggleCamera }}>
            {children}
        </CallContext.Provider>
    );
}

export const useCall = () => {
    const context = useContext(CallContext);
    if (!context) throw new Error('useCall must be used within CallProvider');
    return context;
};
