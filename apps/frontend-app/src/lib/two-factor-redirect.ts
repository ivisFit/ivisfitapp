type TwoFactorRedirectHandler = () => void;

let onTwoFactorRedirectHandler: TwoFactorRedirectHandler | null = null;

export function setTwoFactorRedirectHandler(
  handler: TwoFactorRedirectHandler | null,
) {
  onTwoFactorRedirectHandler = handler;
}

export function notifyTwoFactorRedirect() {
  onTwoFactorRedirectHandler?.();
}
