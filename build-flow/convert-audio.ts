import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Get the ffmpeg binary path from the installer package
const ffmpegPath = ffmpegInstaller.path;

/**
 * Checks if ffmpeg is available
 */
function checkFfmpegInstalled(): boolean {
    try {
        execSync(`"${ffmpegPath}" -version`, { stdio: "pipe" });
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Converts a WAV file to MP3 format using ffmpeg
 * @param inputPath - Path to the input WAV file
 * @param outputPath - Path to the output MP3 file
 */
function convertWavToMp3(inputPath: string, outputPath: string): void {
    try {
        // Use ffmpeg to convert with good quality settings
        // -b:a 128k = 128kbps bitrate (good quality for game audio)
        // -q:a 2 = VBR quality level 2 (high quality)
        execSync(
            `"${ffmpegPath}" -i "${inputPath}" -b:a 128k -q:a 2 "${outputPath}" -y`,
            { stdio: "pipe" }
        );
        console.log(`✓ Converted: ${path.basename(inputPath)} → ${path.basename(outputPath)}`);
    } catch (error) {
        console.error(`✗ Failed to convert ${inputPath}:`, error);
        throw error;
    }
}

/**
 * Gets the file size in human-readable format
 */
function getFileSize(filePath: string): string {
    const stats = fs.statSync(filePath);
    const bytes = stats.size;
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

/**
 * Main function to convert all WAV files in the assets directory
 */
function convertAudioFiles(): void {
    console.log("\n🎵 Audio Conversion Script\n");

    // Check if ffmpeg is available
    if (!checkFfmpegInstalled()) {
        console.error(
            "❌ ffmpeg binary not found. Please ensure @ffmpeg-installer/ffmpeg is installed:\n" +
                "   pnpm install -D @ffmpeg-installer/ffmpeg"
        );
        process.exit(1);
    }

    console.log(`Using ffmpeg from: ${ffmpegPath}\n`);

    const assetsDir = path.join(__dirname, "../public/assets");

    if (!fs.existsSync(assetsDir)) {
        console.error(`❌ Assets directory not found: ${assetsDir}`);
        process.exit(1);
    }

    const files = fs.readdirSync(assetsDir);
    const wavFiles = files.filter(
        (file) => path.extname(file).toLowerCase() === ".wav"
    );

    if (wavFiles.length === 0) {
        console.log("✓ No WAV files found to convert.");
        return;
    }

    console.log(`Found ${wavFiles.length} WAV file(s) to convert:\n`);

    let totalSizeBefore = 0;
    let totalSizeAfter = 0;

    wavFiles.forEach((wavFile) => {
        const inputPath = path.join(assetsDir, wavFile);
        const baseName = path.basename(wavFile, ".wav");
        const outputPath = path.join(assetsDir, `${baseName}.mp3`);

        const sizeBefore = fs.statSync(inputPath).size;
        totalSizeBefore += sizeBefore;

        console.log(`  Converting: ${wavFile} (${getFileSize(inputPath)})`);

        try {
            convertWavToMp3(inputPath, outputPath);

            const sizeAfter = fs.statSync(outputPath).size;
            totalSizeAfter += sizeAfter;

            const savings =
                ((sizeBefore - sizeAfter) / sizeBefore) * 100;
            console.log(
                `    → ${path.basename(outputPath)} (${getFileSize(outputPath)}) - Saved ${savings.toFixed(1)}%`
            );

            // Delete the original WAV file after successful conversion
            fs.unlinkSync(inputPath);
            console.log(`    🗑️  Deleted: ${wavFile}\n`);
        } catch (error) {
            console.error(`    Failed to convert ${wavFile}\n`);
        }
    });

    const totalSavings =
        ((totalSizeBefore - totalSizeAfter) / totalSizeBefore) * 100;

    console.log("─".repeat(60));
    console.log(`\n📊 Conversion Summary:`);
    console.log(
        `   Total size before: ${(totalSizeBefore / (1024 * 1024)).toFixed(2)} MB`
    );
    console.log(
        `   Total size after:  ${(totalSizeAfter / (1024 * 1024)).toFixed(2)} MB`
    );
    console.log(
        `   Total savings:     ${((totalSizeBefore - totalSizeAfter) / (1024 * 1024)).toFixed(2)} MB (${totalSavings.toFixed(1)}%)`
    );
    console.log(
        `\n✅ Original WAV files have been automatically deleted after conversion.`
    );
    console.log("─".repeat(60) + "\n");
}

// Run the conversion if this script is executed directly
const isMain =
    process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
    convertAudioFiles();
}

export { convertAudioFiles };
