import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

export const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Converts a PNG file to a base64-encoded string.
 * @param filePath - The path to the PNG file.
 * @returns The base64 string representation of the PNG.
 */
export function pngToBase64(filePath: string): string {
    const imageBuffer = fs.readFileSync(filePath);
    return imageBuffer.toString("base64");
}

function writeAssetConfigJS(
    assets: Record<string, string | object>,
    outputPath: string
) {
    const jsContent = `window.base64Map = ${JSON.stringify(
        { assets },
        null,
        2
    )};\n`;
    fs.writeFileSync(outputPath, jsContent, "utf-8");
    console.log(`Asset config JS written to ${outputPath}`);
}

function moveAssetConfigToConfigs(srcPath: string) {
    const configsDir = path.join(__dirname, "../src/configs");
    const destPath = path.join(configsDir, "ASSET_CONFIG.js");
    if (!fs.existsSync(configsDir)) {
        fs.mkdirSync(configsDir, { recursive: true });
    }
    fs.renameSync(srcPath, destPath);
    console.log(`ASSET_CONFIG.js moved to ${destPath}`);
}

/**
 * Processes a file and adds it to assets with appropriate naming
 */
function processFile(
    filePath: string,
    fileName: string,
    folderPrefix: string,
    assets: Record<string, string | object>,
    skipFiles: Set<string> = new Set()
) {
    // Skip files that should be ignored (e.g., .wav when .mp3 exists)
    // Check against full file path to handle subdirectory cases correctly
    if (skipFiles.has(filePath)) {
        return;
    }

    const ext = path.extname(fileName).toLowerCase();
    const baseName = path.basename(fileName, ext);

    // Handle atlas files with special naming
    let assetName = baseName;
    if (folderPrefix && fileName === "atlas.json") {
        assetName = `${folderPrefix}-atlas-json`;
    } else if (folderPrefix && fileName === "atlas.png") {
        assetName = `${folderPrefix}-atlas`;
    } else if (folderPrefix) {
        assetName = `${folderPrefix}-${baseName}`;
    }

    if (ext === ".json") {
        const jsonContent = fs.readFileSync(filePath, "utf-8");
        const jsonData = JSON.parse(jsonContent);
        if (!folderPrefix || fileName !== "atlas.json") {
            assets[assetName + "-json"] = jsonData;
        } else {
            assets[assetName] = jsonData;
        }
    } else {
        let prefix = "";
        if (ext === ".png") {
            prefix = "data:image/png;base64,";
        } else if (ext === ".svg") {
            prefix = "data:image/svg+xml;base64,";
        } else if (ext === ".jpg" || ext === ".jpeg") {
            prefix = "data:image/jpeg;base64,";
        } else if (ext === ".gif") {
            prefix = "data:image/gif;base64,";
        } else if (ext === ".webp") {
            prefix = "data:image/webp;base64,";
        } else if (ext === ".wav") {
            prefix = "data:audio/wav;base64,";
        } else if (ext === ".mp3") {
            prefix = "data:audio/mp3;base64,";
        } else if (ext === ".ogg") {
            prefix = "data:audio/ogg;base64,";
        } else {
            return;
        }
        const base64 = pngToBase64(filePath);
        assets[assetName] = prefix + base64;
    }
}

/**
 * Recursively processes a directory
 */
function processDirectory(
    dirPath: string,
    folderPrefix: string,
    assets: Record<string, string | object>,
    skipFiles: Set<string> = new Set()
) {
    const items = fs.readdirSync(dirPath);

    items.forEach((item) => {
        const itemPath = path.join(dirPath, item);
        const stat = fs.statSync(itemPath);

        if (stat.isFile()) {
            processFile(itemPath, item, folderPrefix, assets, skipFiles);
        } else if (stat.isDirectory()) {
            // Recursively process subdirectories
            processDirectory(itemPath, folderPrefix, assets, skipFiles);
        }
    });
}

/**
 * Detects duplicate audio files (same basename with different extensions) recursively
 * Returns a Set of full file paths to skip (prefers .mp3 over .wav)
 */
function detectAudioDuplicates(dirPath: string): Set<string> {
    const skipFiles = new Set<string>();
    // Map of "dirPath/baseName" to array of full file paths
    const audioFiles = new Map<string, string[]>();

    // Recursively scan directory for audio files
    function scanDirectory(currentPath: string) {
        const items = fs.readdirSync(currentPath);
        items.forEach((item) => {
            const itemPath = path.join(currentPath, item);
            const stat = fs.statSync(itemPath);

            if (stat.isFile()) {
                const ext = path.extname(item).toLowerCase();
                if ([".mp3", ".wav", ".ogg"].includes(ext)) {
                    const baseName = path.basename(item, ext);
                    // Use directory-specific key to avoid cross-directory collisions
                    const key = path.join(currentPath, baseName);
                    if (!audioFiles.has(key)) {
                        audioFiles.set(key, []);
                    }
                    audioFiles.get(key)!.push(itemPath);
                }
            } else if (stat.isDirectory()) {
                // Recursively scan subdirectories
                scanDirectory(itemPath);
            }
        });
    }

    scanDirectory(dirPath);

    // Check for duplicates and prefer .mp3
    audioFiles.forEach((filePaths, key) => {
        if (filePaths.length > 1) {
            const hasMp3 = filePaths.some((f) => f.endsWith(".mp3"));
            const hasWav = filePaths.some((f) => f.endsWith(".wav"));

            if (hasMp3 && hasWav) {
                const wavFilePath = filePaths.find((f) => f.endsWith(".wav"))!;
                const mp3FileName = path.basename(
                    filePaths.find((f) => f.endsWith(".mp3"))!
                );
                const wavFileName = path.basename(wavFilePath);
                const relativePath = path.relative(dirPath, wavFilePath);

                skipFiles.add(wavFilePath);
                console.warn(
                    `⚠️  Found duplicate audio formats in "${path.dirname(relativePath)}":`
                );
                console.warn(`   - Using: ${mp3FileName}`);
                console.warn(`   - Skipping: ${wavFileName}`);
                console.warn(
                    `   💡 Consider deleting ${relativePath} to avoid confusion.\n`
                );
            }
        }
    });

    return skipFiles;
}

/**
 * Converts all files in the given directory to base64 and writes to ASSET_CONFIG.js.
 */
function convertAssetsToBase64() {
    const assetsDir = path.join(__dirname, "../public/assets");
    const jsOutputPath = path.join(__dirname, "../ASSET_CONFIG.js");
    const items = fs.readdirSync(assetsDir);
    const assets: Record<string, string | object> = {};

    // Detect and warn about duplicate audio files (prefer .mp3 over .wav)
    const skipFiles = detectAudioDuplicates(assetsDir);

    if (skipFiles.size > 0) {
        console.log(
            "📝 Asset processing: Preferring .mp3 over .wav for duplicate audio files.\n"
        );
    }

    items.forEach((item) => {
        const itemPath = path.join(assetsDir, item);
        const stat = fs.statSync(itemPath);

        if (stat.isFile()) {
            processFile(itemPath, item, "", assets, skipFiles);
        } else if (stat.isDirectory()) {
            // Use the directory name as prefix for atlas files
            processDirectory(itemPath, item, assets, skipFiles);
        }
    });

    writeAssetConfigJS(assets, jsOutputPath);
    moveAssetConfigToConfigs(jsOutputPath);
}

const isMain =
    process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
    convertAssetsToBase64();
}

