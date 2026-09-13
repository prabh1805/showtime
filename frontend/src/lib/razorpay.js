const CHECKOUT_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

/** Cached load promise so the script is only ever injected once per page. */
let loadPromise = null;

/**
 * Loads Razorpay's Checkout.js script (which defines the global
 * `window.Razorpay` constructor) if it isn't already present, and returns
 * a promise that resolves once it's ready to use.
 *
 * @returns {Promise<void>}
 * @throws {Error} if the script fails to load (e.g. offline, ad-blocker).
 */
export function loadRazorpayCheckout() {
  if (window.Razorpay) {
    return Promise.resolve();
  }
  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = CHECKOUT_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Couldn't load Razorpay Checkout. Check your connection and try again."));
    };
    document.body.appendChild(script);
  });

  return loadPromise;
}
