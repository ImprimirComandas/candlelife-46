class AudioService {
  private audioContext: AudioContext | null = null;
  private notificationSound: HTMLAudioElement | null = null;

  constructor() {
    this.initializeAudio();
  }

  private initializeAudio() {
    try {
      // Try to load the notification sound file
      this.notificationSound = new Audio('/notification-sound.mp3');
      this.notificationSound.volume = 0.3;
      this.notificationSound.preload = 'auto';
    } catch (error) {
      console.warn('Could not load notification sound file');
    }

    // Initialize Web Audio API as fallback
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported');
    }
  }

  private createBeepSound(frequency: number = 800, duration: number = 200, volume: number = 0.1) {
    if (!this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration / 1000);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.warn('Error creating beep sound:', error);
    }
  }

  async playNotificationSound(): Promise<void> {
    try {
      // First try to play the audio file
      if (this.notificationSound) {
        const playPromise = this.notificationSound.play();
        if (playPromise) {
          await playPromise;
          return;
        }
      }
    } catch (error) {
      console.warn('Could not play notification sound file, using fallback beep');
    }

    // Fallback to generated beep sound
    this.createBeepSound();
  }

  async playMessageSound(): Promise<void> {
    await this.playNotificationSound();
  }

  async playSystemSound(): Promise<void> {
    // Different tone for system notifications
    this.createBeepSound(600, 150, 0.08);
  }

  setVolume(volume: number) {
    if (this.notificationSound) {
      this.notificationSound.volume = Math.max(0, Math.min(1, volume));
    }
  }
}

export const audioService = new AudioService();