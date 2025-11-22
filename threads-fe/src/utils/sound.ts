class NotificationSound {
  private audioPool: HTMLAudioElement[] = [];
  private poolSize = 3;
  private volume = 0.5;

  constructor() {
    this.preloadAudio();
  }

  private preloadAudio() {
    for (let i = 0; i < this.poolSize; i++) {
      const audio = new Audio("/sounds/notification.mp3");
      audio.volume = this.volume;
      audio.preload = "auto";
      this.audioPool.push(audio);
    }
  }

  public play() {
    try {
      let audio = this.audioPool.find((a) => a.paused);

      if (!audio) {
        audio = this.audioPool[0];
        audio.currentTime = 0;
      }

      audio.play().catch((err) => {
        console.debug("Notification sound blocked:", err.message);
      });
    } catch (error) {
      console.debug("Audio not supported:", error);
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    this.audioPool.forEach((audio) => {
      audio.volume = this.volume;
    });
  }

  public cleanup() {
    this.audioPool.forEach((audio) => {
      audio.pause();
      audio.src = "";
    });
    this.audioPool = [];
  }
}

export const notificationSound = new NotificationSound();
export const playNotificationSound = () => notificationSound.play();
