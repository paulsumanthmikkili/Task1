import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { verifyActiveSession } from './Auth';

let socketServer: SocketServer | undefined;

export function attachSessionSockets(server: HttpServer): void {
	socketServer = new SocketServer(server, {
		cors: { origin: process.env.CLIENT_URL ?? '*' },
	});

	socketServer.use((socket, next) => {
		const authToken = socket.handshake.auth?.token;
		const authorization = socket.handshake.headers.authorization;
		const headerToken = authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined;
		const token = typeof authToken === 'string' && authToken ? authToken : headerToken;
		if (!token) {
			next(new Error('Bearer access token is required.'));
			return;
		}

		void verifyActiveSession(token).then((session) => {
			if (!session) {
				next(new Error('Session is no longer active. Please sign in again.'));
				return;
			}

			socket.data.userId = session.userId;
			socket.data.sessionId = session.sessionId;
			socket.join(sessionRoom(session.userId, session.sessionId));
			next();
		}).catch((error: unknown) => {
			console.error('Socket authentication failed:', error);
			next(new Error('Unable to authenticate socket connection.'));
		});
	});
}

function sessionRoom(userId: number, sessionId: string): string {
	return `user:${userId}:session:${sessionId}`;
}

export function requestLoginApproval(
	userId: number,
	activeSessionId: string,
	request: { requestId: string; expiresAt: Date },
): void {
	socketServer?.to(sessionRoom(userId, activeSessionId)).emit('login:requested', {
		requestId: request.requestId,
		expiresAt: request.expiresAt.toISOString(),
		message: 'A sign-in was requested for your account from another device.',
	});
}

export function terminateUserSessionSockets(userId: number, sessionId: string): void {
	const room = socketServer?.to(sessionRoom(userId, sessionId));
	if (!room) {
		return;
	}

	room.emit('session:terminated', {
		message: 'Your account signed in on another device. Please sign in again.',
	});
	room.disconnectSockets(true);
}

export function disconnectAllSessionSockets(): void {
	socketServer?.disconnectSockets(true);
}
