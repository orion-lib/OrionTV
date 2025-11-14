import TcpSocket from 'react-native-tcp-socket';
import NetInfo from '@react-native-community/netinfo';
import Logger from '@/utils/Logger';
import '@/services/bufferFix';

const logger = Logger.withTag('TCPHttpServer');

const PORT = 12346;

interface HttpRequest {
  method: string;
  url: string;
  headers: { [key: string]: string };
  body: string;
}

interface HttpResponse {
  statusCode: number;
  headers: { [key: string]: string };
  body: string;
}

type RequestHandler = (request: HttpRequest) => HttpResponse | Promise<HttpResponse>;

class TCPHttpServer {
  private server: TcpSocket.Server | null = null;
  private isRunning = false;
  private requestHandler: RequestHandler | null = null;

  constructor() {
    this.server = null;
  }

  private parseHttpRequest(data: string): HttpRequest | null {
    try {
      const lines = data.split('\r\n');
      const requestLine = lines[0].split(' ');
      
      if (requestLine.length < 3) {
        return null;
      }

      const method = requestLine[0];
      const url = requestLine[1];
      const headers: { [key: string]: string } = {};
      
      let bodyStartIndex = -1;
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line === '') {
          bodyStartIndex = i + 1;
          break;
        }
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim().toLowerCase();
          const value = line.substring(colonIndex + 1).trim();
          headers[key] = value;
        }
      }

      const body = bodyStartIndex > 0 ? lines.slice(bodyStartIndex).join('\r\n') : '';

      return { method, url, headers, body };
    } catch (error) {
      logger.info('[TCPHttpServer] Error parsing HTTP request:', error);
      return null;
    }
  }

  private formatHttpResponse(response: HttpResponse): string {
    const statusTexts: { [key: number]: string } = {
      200: 'OK',
      400: 'Bad Request',
      404: 'Not Found',
      500: 'Internal Server Error'
    };

    const statusText = statusTexts[response.statusCode] || 'Unknown';
    const headers = {
      'Content-Length': new TextEncoder().encode(response.body).length.toString(),
      'Connection': 'close',
      ...response.headers
    };

    let httpResponse = `HTTP/1.1 ${response.statusCode} ${statusText}\r\n`;
    
    for (const [key, value] of Object.entries(headers)) {
      httpResponse += `${key}: ${value}\r\n`;
    }
    
    httpResponse += '\r\n';
    httpResponse += response.body;

    return httpResponse;
  }

  public setRequestHandler(handler: RequestHandler) {
    this.requestHandler = handler;
  }

  public async start(): Promise<string> {
    const netState = await NetInfo.fetch();
    let ipAddress: string | null = null;
    
    if (netState.type === 'wifi' || netState.type === 'ethernet') {
      ipAddress = (netState.details as any)?.ipAddress ?? null;
    }

    if (!ipAddress) {
      throw new Error('无法获取IP地址，请确认设备已连接到WiFi或以太网。');
    }

    if (this.isRunning) {
      logger.debug('[TCPHttpServer] Server is already running.');
      return `http://${ipAddress}:${PORT}`;
    }

    return new Promise((resolve, reject) => {
      try {
        this.server = TcpSocket.createServer((socket: TcpSocket.Socket) => {
          logger.debug('[TCPHttpServer] Client connected');
          
          let requestData = '';
          
          socket.on('data', async (data: string | Buffer) => {
            requestData += data.toString();
            
            // Check if we have a complete HTTP request
            if (requestData.includes('\r\n\r\n')) {
              try {
                const request = this.parseHttpRequest(requestData);
                if (request && this.requestHandler) {
                  const response = await this.requestHandler(request);
                  const httpResponse = this.formatHttpResponse(response);
                  socket.write(httpResponse);
                } else {
                  // Send 400 Bad Request for malformed requests
                  const errorResponse = this.formatHttpResponse({
                    statusCode: 400,
                    headers: { 'Content-Type': 'text/plain' },
                    body: 'Bad Request'
                  });
                  socket.write(errorResponse);
                }
              } catch (error) {
                logger.info('[TCPHttpServer] Error handling request:', error);
                const errorResponse = this.formatHttpResponse({
                  statusCode: 500,
                  headers: { 'Content-Type': 'text/plain' },
                  body: 'Internal Server Error'
                });
                socket.write(errorResponse);
              }
              
              socket.end();
              requestData = '';
            }
          });

          socket.on('error', (error: Error) => {
            logger.info('[TCPHttpServer] Socket error:', error);
          });

          socket.on('close', () => {
            logger.debug('[TCPHttpServer] Client disconnected');
          });
        });

        this.server.listen({ port: PORT, host: '0.0.0.0' }, () => {
          logger.debug(`[TCPHttpServer] Server listening on ${ipAddress}:${PORT}`);
          this.isRunning = true;
          resolve(`http://${ipAddress}:${PORT}`);
        });

        this.server.on('error', (error: Error) => {
          logger.info('[TCPHttpServer] Server error:', error);
          this.isRunning = false;
          reject(error);
        });

      } catch (error) {
        logger.info('[TCPHttpServer] Failed to start server:', error);
        reject(error);
      }
    });
  }

  public stop() {
    if (this.server && this.isRunning) {
      this.server.close();
      this.server = null;
      this.isRunning = false;
      logger.debug('[TCPHttpServer] Server stopped');
    }
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }
}

export default TCPHttpServer;