let audioInitialized = false;
let audio: HTMLAudioElement | null = null;

export const initAudio = () => {
  if (!audioInitialized) {
    audio = new Audio("/sounds/notification.mp3");
    audio.volume = 0.5;
    audioInitialized = true;
  }
};

export const playNotificationSound = () => {
  try {
    if (!audio) {
      initAudio();
    }

    audio?.play().catch((err) => {
      console.debug("Notification sound blocked:", err.message);
    });
  } catch (error) {
    console.debug("Audio not supported");
  }
};
