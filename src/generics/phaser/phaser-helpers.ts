/**
 * Loads assets (images/audio) from a key-path map into a Phaser scene.
 * Supports base64 data URLs and file extensions for type detection.
 * @param {Phaser.Scene} scene - The Phaser scene to load assets into (usually 'this' in preload)
 * @param {Record<string, string>} assets - Map of asset keys to paths (URL or base64)
 */

export const PHASER_HELPERS = {
    loadAssetsToPhaser,
};

function loadAssetsToPhaser(
    scene: Phaser.Scene,
    assets: Record<string, string>
): void {
    Object.entries(assets).forEach(([key, path]) => {
        if (typeof path === "string") {
            // Check if it's a base64 data URL
            if (path.startsWith("data:")) {
                // For base64 data URLs, we need to specify the type
                if (path.includes("image")) {
                    scene.load.image(key, path);
                } else if (path.includes("audio")) {
                    scene.load.audio(key, path);
                }
            } else {
                // For regular URLs, load based on file extension
                if (path.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) {
                    scene.load.image(key, path);
                } else if (path.match(/\.(mp3|ogg|wav)$/i)) {
                    scene.load.audio(key, path);
                }
            }
        }
    });
}

