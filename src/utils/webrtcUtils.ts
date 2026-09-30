import SimplePeer from 'simple-peer';
import { EventEmitter } from 'events';

export interface WebRTCPeerConfig {
  initiator: boolean;
  iceServers?: RTCIceServer[];
  offerOptions?: RTCOfferOptions;
  answerOptions?: RTCAnswerOptions;
}

export interface WebRTCSignalData {
  type: 'offer' | 'answer';
  sdp: string;
}

export interface WebRTCIceCandidate {
  type: 'candidate';
  candidate: RTCIceCandidateInit;
}

export class WebRTCPeer extends EventEmitter {
  private peer: SimplePeer.Instance | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private initiator: boolean;
  private iceServers: RTCIceServer[];
  private dataChannel: RTCDataChannel | null = null;

  constructor(config: WebRTCPeerConfig) {
    super();
    this.initiator = config.initiator;
    this.iceServers = config.iceServers || this.getDefaultIceServers();
  }

  /**
   * Initialize peer connection
   */
  async initialize(): Promise<void> {
    try {
      this.peer = new SimplePeer({
        initiator: this.initiator,
        trickleIce: true,
        config: {
          iceServers: this.iceServers,
        },
        streams: this.localStream ? [this.localStream] : undefined,
      });

      this.peer.on('signal', (data) => {
        this.emit('signal', data);
      });

      this.peer.on('connect', () => {
        console.log('[WebRTC] Connected');
        this.emit('connected');
      });

      this.peer.on('stream', (stream) => {
        console.log('[WebRTC] Received remote stream');
        this.remoteStream = stream;
        this.emit('stream', stream);
      });

      this.peer.on('data', (data) => {
        this.emit('data', data);
      });

      this.peer.on('error', (error) => {
        console.error('[WebRTC] Error:', error);
        this.emit('error', error);
      });

      this.peer.on('close', () => {
        console.log('[WebRTC] Connection closed');
        this.cleanup();
        this.emit('closed');
      });
    } catch (error) {
      console.error('[WebRTC] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Add local media stream
   */
  async addLocalStream(stream: MediaStream): Promise<void> {
    this.localStream = stream;
    if (this.peer) {
      stream.getTracks().forEach((track) => {
        this.peer?.addTrack(track, stream);
      });
    }
  }

  /**
   * Get local stream
   */
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  /**
   * Get remote stream
   */
  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  /**
   * Handle incoming signal (offer/answer/candidate)
   */
  signal(data: WebRTCSignalData | WebRTCIceCandidate): void {
    if (!this.peer) {
      console.warn('[WebRTC] Peer not initialized');
      return;
    }

    try {
      if (data.type === 'offer' || data.type === 'answer') {
        this.peer.signal(data);
      } else if (data.type === 'candidate') {
        this.peer.signal(data);
      }
    } catch (error) {
      console.error('[WebRTC] Signal error:', error);
    }
  }

  /**
   * Send data through data channel
   */
  send(data: string | ArrayBuffer): void {
    if (!this.peer) {
      console.warn('[WebRTC] Peer not initialized');
      return;
    }

    try {
      this.peer.send(data);
    } catch (error) {
      console.error('[WebRTC] Send error:', error);
    }
  }

  /**
   * Get connection state
   */
  isConnected(): boolean {
    return this.peer !== null && this.peer._connected;
  }

  /**
   * Get connection stats
   */
  async getStats(): Promise<RTCStatsReport | null> {
    if (!this.peer?._pc) return null;

    try {
      return await this.peer._pc.getStats();
    } catch (error) {
      console.error('[WebRTC] Error getting stats:', error);
      return null;
    }
  }

  /**
   * Close connection
   */
  disconnect(): void {
    if (this.peer) {
      this.peer.destroy();
    }
    this.cleanup();
  }

  /**
   * Clean up resources
   */
  private cleanup(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }

    this.peer = null;
  }

  /**
   * Get default STUN/TURN servers
   */
  private getDefaultIceServers(): RTCIceServer[] {
    return [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
    ];
  }
}

/**
 * Manager for multiple peer connections
 */
export class WebRTCManager extends EventEmitter {
  private peers: Map<string, WebRTCPeer> = new Map();

  /**
   * Create new peer connection
   */
  async createPeer(
    peerId: string,
    config: WebRTCPeerConfig
  ): Promise<WebRTCPeer> {
    if (this.peers.has(peerId)) {
      throw new Error(`Peer ${peerId} already exists`);
    }

    const peer = new WebRTCPeer(config);
    await peer.initialize();

    peer.on('signal', (data) => {
      this.emit('signal', { peerId, data });
    });

    peer.on('connected', () => {
      this.emit('peer:connected', peerId);
    });

    peer.on('closed', () => {
      this.peers.delete(peerId);
      this.emit('peer:closed', peerId);
    });

    peer.on('error', (error) => {
      this.emit('peer:error', { peerId, error });
    });

    this.peers.set(peerId, peer);
    return peer;
  }

  /**
   * Get peer by ID
   */
  getPeer(peerId: string): WebRTCPeer | undefined {
    return this.peers.get(peerId);
  }

  /**
   * Close peer connection
   */
  closePeer(peerId: string): void {
    const peer = this.peers.get(peerId);
    if (peer) {
      peer.disconnect();
      this.peers.delete(peerId);
    }
  }

  /**
   * Close all connections
   */
  closeAll(): void {
    this.peers.forEach((peer) => peer.disconnect());
    this.peers.clear();
  }

  /**
   * Get all active peers
   */
  getAllPeers(): Map<string, WebRTCPeer> {
    return new Map(this.peers);
  }
}

// Singleton instance
let rtcManager: WebRTCManager | null = null;

export function getRTCManager(): WebRTCManager {
  if (!rtcManager) {
    rtcManager = new WebRTCManager();
  }
  return rtcManager;
}
