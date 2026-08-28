const STORAGE_KEY = "ivis-alumna-created";

export function setAlumnaCreatedNotice(name: string) {
  sessionStorage.setItem(STORAGE_KEY, name);
}

export function consumeAlumnaCreatedNotice(): string | null {
  const name = sessionStorage.getItem(STORAGE_KEY);
  if (name) {
    sessionStorage.removeItem(STORAGE_KEY);
    return name;
  }
  return null;
}
