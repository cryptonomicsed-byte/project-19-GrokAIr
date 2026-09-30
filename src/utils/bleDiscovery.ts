import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import { EventEmitter } from 'events';

export interface BLEDevice {
  id: string;
  name: string;
  language: string;
  distance?: number; // In meters, estimated from RSSI
  rssi: number;
  discoveredAt: number;
}

export interface BLEBeaconConfig {
  serviceUUID: string;
  characteristicUUID: string;
  advertisingInterval: number; // milliseconds
  txPower: number; // dBm
}

const DEFAULT_CONFIG: BLEBeaconConfig = {
  serviceUUID: '550e8400-e29b-41d4-a716-446655440000',
  characteristicUUID: '550e8400-e29b-41d4-a716-446655440001',
  advertisingInterval: 1000,
  txPower: -55, // Default BLE TX power
};

export class BLEDiscovery extends EventEmitter {
  private isScanning: boolean = false;
  private discoveredDevices: Map<string, BLEDevice> = new Map();
  private scanTimeout: NodeJS.Timeout | null = null;
  private config: BLEBeaconConfig;

  constructor(config: Partial<BLEBeaconConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start BLE scanning for nearby devices
   */
  async startDiscovery(durationMs: number = 30000): Promise<void> {
    if (this.isScanning) {
      console.warn('[BLE] Scan already in progress');
      return;
    }

    try {
      console.log('[BLE] Starting scan...');
      this.isScanning = true;
      this.discoveredDevices.clear();

      // Platform-specific scanning
      if (Platform.OS === 'ios') {
        await this.startIOSScan();
      } else if (Platform.OS === 'android') {
        await this.startAndroidScan();
      } else {
        // Web/other: Use mock data
        this.startMockScan();
      }

      // Auto-stop after duration
      this.scanTimeout = setTimeout(() => {
        this.stopDiscovery();
      }, durationMs);

      this.emit('scan:started');
    } catch (error) {
      console.error('[BLE] Scan failed:', error);
      this.isScanning = false;
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Stop BLE scanning
   */
  stopDiscovery(): void {
    if (!this.isScanning) return;

    console.log('[BLE] Stopping scan...');
    this.isScanning = false;

    if (this.scanTimeout) {
      clearTimeout(this.scanTimeout);
      this.scanTimeout = null;
    }

    this.emit('scan:stopped');
  }

  /**
   * Get discovered devices within radius
   */
  getDiscoveredUsers(radiusMeters: number = 50): BLEDevice[] {
    const now = Date.now();
    const expiredMs = 10000; // Devices older than 10s are stale

    return Array.from(this.discoveredDevices.values())
      .filter((device) => now - device.discoveredAt < expiredMs)
      .filter((device) => {
        if (!device.distance) return true;
        return device.distance <= radiusMeters;
      })
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }

  /**
   * Estimate distance from RSSI
   * Formula: distance = 10^((TxPower - RSSI) / (10 * N))
   * where N = path loss exponent (typically 2-4)
   */
  private estimateDistance(rssi: number): number {
    const txPower = this.config.txPower;
    const pathLossExponent = 2.0; // Adjust based on environment

    if (rssi === 0) return -1; // Cannot calculate

    const ratio = (txPower - rssi) / (10 * pathLossExponent);
    return Math.pow(10, ratio);
  }

  /**
   * Check if device is valid (matches service UUID)
   */
  private isValidDevice(device: any): boolean {
    if (!device.uuid) return false;

    // On iOS: Check serviceUUIDs
    if (Platform.OS === 'ios' && device.advertising?.kCBAdvDataServiceUUIDs) {
      return device.advertising.kCBAdvDataServiceUUIDs.includes(
        this.config.serviceUUID
      );
    }

    // On Android: Check services
    if (Platform.OS === 'android' && device.serviceUUIDs) {
      return device.serviceUUIDs.includes(this.config.serviceUUID);
    }

    return true; // Web/mock
  }

  /**
   * Parse device name to extract language
   */
  private parseLanguageFromDevice(device: BLEDevice): string {
    // Format: "GrokAir_ES_abc123" → "es"
    const match = device.name.match(/GrokAir_([A-Z]{2})/);
    return match ? match[1].toLowerCase() : 'en';
  }

  // ---- Platform-specific implementations ----

  private async startIOSScan(): Promise<void> {
    try {
      const BLEManager = NativeModules.BLEManager || NativeModules.RNBluetooth;
      if (!BLEManager) {
        console.warn('[BLE] BLE module not available, using mock data');
        this.startMockScan();
        return;
      }

      const eventEmitter = new NativeEventEmitter(BLEManager);

      // Listen for discovered peripherals
      eventEmitter.addListener('BLEDiscoverPeripheral', (peripheral) => {
        if (this.isValidDevice(peripheral)) {
          const device: BLEDevice = {
            id: peripheral.id || peripheral.uuid,
            name: peripheral.name || `Device_${peripheral.id}`,
            language: this.parseLanguageFromDevice({
              id: peripheral.id,
              name: peripheral.name || '',
              language: 'en',
              rssi: peripheral.rssi || 0,
              discoveredAt: Date.now(),
            }),
            rssi: peripheral.rssi || 0,
            discoveredAt: Date.now(),
          };

          device.distance = this.estimateDistance(device.rssi);
          this.discoveredDevices.set(device.id, device);
          this.emit('device:found', device);
        }
      });

      // Start scan
      await BLEManager.scan(
        [this.config.serviceUUID],
        5, // Scan duration
        true,
        { scanMode: 2 } // Low latency mode
      );
    } catch (error) {
      console.error('[BLE] iOS scan error:', error);
      this.startMockScan();
    }
  }

  private async startAndroidScan(): Promise<void> {
    try {
      const BLEManager = NativeModules.BLEManager || NativeModules.RNBluetooth;
      if (!BLEManager) {
        console.warn('[BLE] BLE module not available, using mock data');
        this.startMockScan();
        return;
      }

      const eventEmitter = new NativeEventEmitter(BLEManager);

      // Listen for discovered devices
      eventEmitter.addListener('BLEDiscoverPeripheral', (device) => {
        if (this.isValidDevice(device)) {
          const bleDevice: BLEDevice = {
            id: device.id || device.address,
            name: device.name || `Device_${device.address}`,
            language: this.parseLanguageFromDevice({
              id: device.id,
              name: device.name || '',
              language: 'en',
              rssi: device.rssi || 0,
              discoveredAt: Date.now(),
            }),
            rssi: device.rssi || 0,
            discoveredAt: Date.now(),
          };

          bleDevice.distance = this.estimateDistance(bleDevice.rssi);
          this.discoveredDevices.set(bleDevice.id, bleDevice);
          this.emit('device:found', bleDevice);
        }
      });

      // Start scan
      await BLEManager.scan(
        [this.config.serviceUUID],
        30, // Scan duration in seconds
        true
      );
    } catch (error) {
      console.error('[BLE] Android scan error:', error);
      this.startMockScan();
    }
  }

  /**
   * Mock scan for testing (returns sample devices)
   */
  private startMockScan(): void {
    console.log('[BLE] Using mock scan data');

    const mockDevices: BLEDevice[] = [
      {
        id: 'device_001',
        name: 'GrokAir_ES_alice123',
        language: 'es',
        rssi: -65,
        discoveredAt: Date.now(),
        distance: 15,
      },
      {
        id: 'device_002',
        name: 'GrokAir_FR_bob456',
        language: 'fr',
        rssi: -72,
        discoveredAt: Date.now(),
        distance: 25,
      },
      {
        id: 'device_003',
        name: 'GrokAir_DE_carol789',
        language: 'de',
        rssi: -80,
        discoveredAt: Date.now(),
        distance: 35,
      },
    ];

    mockDevices.forEach((device) => {
      this.discoveredDevices.set(device.id, device);
      this.emit('device:found', device);
    });
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stopDiscovery();
    this.discoveredDevices.clear();
    this.removeAllListeners();
  }
}

/**
 * Beacon advertiser (for device discovery)
 */
export class BLEBeacon extends EventEmitter {
  private isAdvertising: boolean = false;
  private config: BLEBeaconConfig;
  private userId: string;
  private language: string;

  constructor(
    userId: string,
    language: string,
    config: Partial<BLEBeaconConfig> = {}
  ) {
    super();
    this.userId = userId;
    this.language = language;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start advertising beacon
   */
  async startAdvertising(): Promise<void> {
    if (this.isAdvertising) return;

    try {
      console.log(`[BLE] Starting beacon for ${this.language}`);
      this.isAdvertising = true;

      // Format: GrokAir_LANG_USERID
      const deviceName = `GrokAir_${this.language.toUpperCase()}_${this.userId.substring(0, 8)}`;

      if (Platform.OS === 'ios') {
        await this.startIOSBeacon(deviceName);
      } else if (Platform.OS === 'android') {
        await this.startAndroidBeacon(deviceName);
      }

      this.emit('advertising:started');
    } catch (error) {
      console.error('[BLE] Failed to start beacon:', error);
      this.isAdvertising = false;
      this.emit('error', error);
    }
  }

  /**
   * Stop advertising beacon
   */
  async stopAdvertising(): Promise<void> {
    if (!this.isAdvertising) return;

    try {
      console.log('[BLE] Stopping beacon');
      this.isAdvertising = false;

      const BLEManager = NativeModules.BLEManager;
      if (BLEManager) {
        await BLEManager.stopAdvertising?.();
      }

      this.emit('advertising:stopped');
    } catch (error) {
      console.error('[BLE] Failed to stop beacon:', error);
    }
  }

  private async startIOSBeacon(deviceName: string): Promise<void> {
    const BLEManager = NativeModules.BLEManager;
    if (!BLEManager?.startAdvertising) {
      console.warn('[BLE] iOS advertising not available');
      return;
    }

    await BLEManager.startAdvertising([this.config.serviceUUID], {
      deviceName,
      txPowerLevel: this.config.txPower,
    });
  }

  private async startAndroidBeacon(deviceName: string): Promise<void> {
    const BLEManager = NativeModules.BLEManager;
    if (!BLEManager?.startAdvertising) {
      console.warn('[BLE] Android advertising not available');
      return;
    }

    await BLEManager.startAdvertising([this.config.serviceUUID], {
      deviceName,
      txPower: this.config.txPower,
    });
  }

  isActive(): boolean {
    return this.isAdvertising;
  }

  destroy(): void {
    this.stopAdvertising();
    this.removeAllListeners();
  }
}
