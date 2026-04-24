export const CONFIG = {
    // For demo purposes: Change this to your public ngrok URL
    // Example: "https://your-session.ngrok-free.app"
    // Leave as empty string to default to window.location.origin
    BASE_URL: "",
    
    // RPC Endpoint for read-only blockchain access (Local Hardhat Node)
    RPC_URL: "http://127.0.0.1:7545",

    // Static Verification Page URL (GitHub Pages or similar)
    // Example: "https://yourname.github.io/WarrantyChain/verify.html"
    // Leave empty to default to local /verify.html
    PUBLIC_VERIFY_PAGE_URL: "https://k-deepak1610.github.io/warranty-verify-page/"
};

/**
 * Returns the configured base URL or falls back to window.location.origin.
 * Used for generating internal app links.
 */
export const getBaseURL = () => {
    if (CONFIG.BASE_URL && CONFIG.BASE_URL.trim() !== "") {
        return CONFIG.BASE_URL.trim().replace(/\/$/, "");
    }
    return window.location.origin;
};

/**
 * Returns the configured public verification page URL or defaults to local verify.html.
 */
export const getVerifyPageURL = () => {
    if (CONFIG.PUBLIC_VERIFY_PAGE_URL && CONFIG.PUBLIC_VERIFY_PAGE_URL.trim() !== "") {
        return CONFIG.PUBLIC_VERIFY_PAGE_URL.trim();
    }
    return `${window.location.origin}/verify.html`;
};
