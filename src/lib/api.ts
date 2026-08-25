"use client";

// Klient tarafidagi API yordamchisi — har bir so'rovga Telegram initData ni biriktiradi.

export interface TgWebApp {
  initData: string;
  initDataUnsafe?: { user?: { id: number; first_name?: string; username?: string } };
  ready: () => void;
  expand: () => void;
  colorScheme?: string;
  themeParams?: Record<string, string>;
  MainButton?: unknown;
  version?: string;
  isVersionAtLeast?: (v: string) => boolean;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
}

export function tg(): TgWebApp | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { Telegram?: { WebApp?: TgWebApp } }).Telegram
    ?.WebApp;
}

export function getInitData(): string {
  return tg()?.initData || "";
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-telegram-init-data": getInitData(),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    let msg = `Xatolik (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) msg = data.error;
      if (res.status === 401) msg = "unauthorized";
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
