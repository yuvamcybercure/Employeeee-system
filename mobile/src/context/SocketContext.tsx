import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import * as SecureStore from 'expo-secure-store';

interface SocketContextType {
    socket: Socket | null;
    connected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    connected: false,
});

// Replace with your actual backend URL
const SOCKET_URL = 'https://employee-api-wcak.onrender.com';

export function SocketProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (user) {
            const initSocket = async () => {
                const token = await SecureStore.getItemAsync('token');
                const newSocket = io(SOCKET_URL, {
                    auth: { token },
                    transports: ['websocket'],
                });

                newSocket.on('connect', () => {
                    setConnected(true);
                    console.log('Socket connected');
                });

                newSocket.on('disconnect', () => {
                    setConnected(false);
                    console.log('Socket disconnected');
                });

                setSocket(newSocket);
            };

            initSocket();

            return () => {
                if (socket) socket.disconnect();
            };
        } else {
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setConnected(false);
            }
        }
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, connected }}>
            {children}
        </SocketContext.Provider>
    );
}

export const useSocket = () => useContext(SocketContext);
