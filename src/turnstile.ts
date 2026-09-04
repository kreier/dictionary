export const TURNSTILE_SITE_KEY = "0x4AAAAAAEdFv-13Hc5iBLS8";

export function loadTurnstile(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (window.turnstile) {
            resolve();
            return;
        }

        const script = document.createElement("script");
        script.src =
            "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;

        script.onload = () => resolve();
        script.onerror = () =>
            reject(new Error("Could not load Cloudflare Turnstile."));

        document.head.appendChild(script);
    });
}
