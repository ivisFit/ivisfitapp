interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface Window {
  __pwaDeferredPrompt?: BeforeInstallPromptEvent | null;
}

interface Navigator {
  standalone?: boolean;
}
