import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';


interface CallState {
    active: boolean;
    isReceiving: boolean;
    from: string | null;
    name: string | null;
    type: 'audio' | 'video';
    roomId: string | null;
    status: 'idle' | 'ringing' | 'connected' | 'ended';
}

interface CallContextType {
    call: CallState;
    startCall: (targetId: string, name: string, type: 'audio' | 'video', isGroup?: boolean) => void;
    answerCall: () => void;
    rejectCall: () => void;
    endCall: () => void;
}

const initialCallState: CallState = {
    active: false,
    isReceiving: false,
    from: null,
    name: null,
    type: 'audio',
    roomId: null,
    status: 'idle',
};

const CallContext = createContext<CallContextType | undefined>(undefined);

export function CallProvider({ children }: { children: ReactNode }) {
    const { socket } = useSocket();
    const { user } = useAuth();
    const [call, setCall] = useState<CallState>(initialCallState);

    useEffect(() => {
        if (!socket) return;

        socket.on('incoming_call', (data) => {
            setCall({
                active: true,
                isReceiving: true,
                from: data.from,
                name: data.name,
                type: data.type,
                roomId: data.roomId,
                status: 'ringing'
            });
        });

        socket.on('call_accepted', (data) => {
            setCall(prev => ({ ...prev, status: 'connected' }));
        });

        socket.on('call_rejected', (data) => {
            setCall(initialCallState);
        });

        socket.on('call_ended', (data) => {
            setCall(initialCallState);
        });

        return () => {
            socket.off('incoming_call');
            socket.off('call_accepted');
            socket.off('call_rejected');
            socket.off('call_ended');
        };
    }, [socket]);

    const startCall = (targetId: string, targetName: string, type: 'audio' | 'video', isGroup = false) => {
        if (!socket || !user) return;
        const roomId = isGroup ? targetId : [user._id, targetId].sort().join('-');

        socket.emit('call_user', {
            userToCall: targetId,
            from: user._id,
            name: user.name,
            type,
            isGroup,
            roomId
        });

        setCall({
            active: true,
            isReceiving: false,
            from: targetId,
            name: targetName,
            type,
            roomId,
            status: 'ringing'
        });
    };

    const answerCall = () => {
        if (!socket || !user || !call.roomId) return;
        socket.emit('accept_call', {
            to: call.from,
            roomId: call.roomId,
            from: user._id
        });
        setCall(prev => ({ ...prev, status: 'connected' }));
    };

    const rejectCall = () => {
        if (!socket || !user || !call.roomId) return;
        socket.emit('reject_call', {
            to: call.from,
            roomId: call.roomId,
            from: user._id
        });
        setCall(initialCallState);
    };

    const endCall = () => {
        if (!socket || !user || !call.roomId) return;
        socket.emit('end_call', {
            to: call.from,
            roomId: call.roomId,
            from: user._id
        });
        setCall(initialCallState);
    };

    return (
        <CallContext.Provider value={{ call, startCall, answerCall, rejectCall, endCall }}>
            {children}
        </CallContext.Provider>
    );
}

export const useCall = () => {
    const context = useContext(CallContext);
    if (!context) throw new Error('useCall must be used within CallProvider');
    return context;
};
