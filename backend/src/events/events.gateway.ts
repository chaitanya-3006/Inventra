import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('EventsGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Emits an event to all connected clients
  broadcastToAll(event: string, data: any) {
    if (this.server) {
      this.server.emit(event, data);
    }
  }

  // Common wrapper methods
  emitInventoryUpdate(data?: any) {
    this.broadcastToAll('inventoryUpdate', data);
    this.broadcastToAll('analyticsUpdate', data); // Since inventory changes analytics too
  }

  emitReservationUpdate(data?: any) {
    this.broadcastToAll('reservationUpdate', data);
    this.broadcastToAll('analyticsUpdate', data);
  }

  emitSafeLockUpdate(data?: any) {
    this.broadcastToAll('safeLockUpdate', data);
    this.broadcastToAll('analyticsUpdate', data);
  }
}
