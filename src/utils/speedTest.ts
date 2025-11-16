export interface SpeedTestResult {
  downloadSpeed: number; // Mbps
  uploadSpeed: number; // Mbps
  ping: number; // ms
}

export class SpeedTest {
  private static readonly TEST_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly TEST_DURATION = 5000; // 5 seconds

  static async measurePing(): Promise<number> {
    const startTime = performance.now();
    try {
      await fetch('https://www.google.com/generate_204', { 
        method: 'HEAD',
        cache: 'no-cache' 
      });
      const endTime = performance.now();
      return Math.round(endTime - startTime);
    } catch (error) {
      console.error('Ping test failed:', error);
      return -1;
    }
  }

  static async measureDownloadSpeed(): Promise<number> {
    try {
      // Use a larger file from a CDN for more accurate testing
      const testUrl = 'https://speed.cloudflare.com/__down?bytes=10000000'; // 10MB
      const startTime = performance.now();
      
      const response = await fetch(testUrl, { cache: 'no-cache' });
      const reader = response.body?.getReader();
      
      if (!reader) {
        throw new Error('Failed to get reader');
      }

      let receivedBytes = 0;
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          receivedBytes += value.length;
        }
        
        // Stop after TEST_DURATION
        if (performance.now() - startTime > this.TEST_DURATION) {
          reader.cancel();
          break;
        }
      }

      const endTime = performance.now();
      const durationInSeconds = (endTime - startTime) / 1000;
      const bitsReceived = receivedBytes * 8;
      const speedMbps = (bitsReceived / durationInSeconds) / (1024 * 1024);
      
      return Math.round(speedMbps * 100) / 100;
    } catch (error) {
      console.error('Download speed test failed:', error);
      return -1;
    }
  }

  static async measureUploadSpeed(): Promise<number> {
    try {
      // Generate random data for upload
      const dataSize = 1024 * 1024; // 1MB
      const data = new Uint8Array(dataSize);
      crypto.getRandomValues(data);
      const blob = new Blob([data]);

      const startTime = performance.now();
      
      // Use httpbin.org echo service
      await fetch('https://httpbin.org/post', {
        method: 'POST',
        body: blob,
        cache: 'no-cache',
      });

      const endTime = performance.now();
      const durationInSeconds = (endTime - startTime) / 1000;
      const bitsSent = dataSize * 8;
      const speedMbps = (bitsSent / durationInSeconds) / (1024 * 1024);
      
      return Math.round(speedMbps * 100) / 100;
    } catch (error) {
      console.error('Upload speed test failed:', error);
      return -1;
    }
  }

  static async runFullTest(
    onProgress?: (step: string) => void
  ): Promise<SpeedTestResult> {
    onProgress?.('Measuring ping...');
    const ping = await this.measurePing();
    
    onProgress?.('Testing download speed...');
    const downloadSpeed = await this.measureDownloadSpeed();
    
    onProgress?.('Testing upload speed...');
    const uploadSpeed = await this.measureUploadSpeed();
    
    return {
      downloadSpeed,
      uploadSpeed,
      ping,
    };
  }
}
