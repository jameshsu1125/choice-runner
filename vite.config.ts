import { execSync } from "child_process";
import { promises as fs } from "fs";
import { resolve } from "path";
import type { PluginOption } from "vite";
import { defineConfig } from "vite";

// Plugin to copy fonts to _ASSETS_ folder
const copyFonts = (): PluginOption => {
    return {
        name: "copy-fonts",
        apply: "build",
        async writeBundle(options) {
            const outDir = options.dir;
            if (!outDir) {
                this.warn(
                    "vite-plugin-copy-fonts: `dir` option is not defined in the Rollup output options."
                );
                return;
            }
            const fontsSourceDir = resolve(__dirname, "public/assets/fonts");
            const destDir = resolve(outDir, "_ASSETS_/fonts");

            try {
                await fs.mkdir(destDir, { recursive: true });
                const files = await fs.readdir(fontsSourceDir);
                for (const file of files) {
                    if (file.match(/\.(ttf|otf|woff|woff2|eot)$/i)) {
                        const sourceFile = resolve(fontsSourceDir, file);
                        const destFile = resolve(destDir, file);
                        await fs.copyFile(sourceFile, destFile);
                        console.log(`Copied font: ${file}`);
                    }
                }
            } catch (err) {
                this.error(`Error copying fonts: ${err}`);
            }
        },
    };
};

// Plugin to copy ASSET_CONFIG.ts
const copyAssetConfig = (): PluginOption => {
    return {
        name: "copy-asset-config",
        apply: "build",
        async writeBundle(options) {
            const outDir = options.dir;
            if (!outDir) {
                this.warn(
                    "vite-plugin-copy-asset-config: `dir` option is not defined in the Rollup output options."
                );
                return;
            }
            const source = resolve(__dirname, "src/configs/ASSET_CONFIG.js");
            const destDir = resolve(outDir, "_ASSETS_");
            const destFile = resolve(destDir, "ASSET_CONFIG.js");

            try {
                await fs.mkdir(destDir, { recursive: true });
                await fs.copyFile(source, destFile);
            } catch (err) {
                this.error(`Error copying ASSET_CONFIG.js: ${err}`);
            }
        },
    };
};

const copyIconAppierLogoStylesPhaserToAssetsFolder = (): PluginOption => {
    return {
        name: "copy-icon-appier-logo-styles-phaser-to-assets-folder",
        apply: "build",
        async writeBundle(options) {
            const outDir = options.dir;
            if (!outDir) {
                this.warn(
                    "vite-plugin-copy-icon-appier-logo-styles-phaser-to-assets-folder: `dir` option is not defined in the Rollup output options."
                );
                return;
            }
            const iconSource = resolve(__dirname, "public/assets/icon.png");
            const iconDestDir = resolve(outDir, "_ASSETS_");
            const iconDestFile = resolve(iconDestDir, "icon.png");

            const appierLogoSource = resolve(__dirname, "public/assets/appier-logo.svg");
            const appierLogoDestDir = resolve(outDir, "_ASSETS_");
            const appierLogoDestFile = resolve(appierLogoDestDir, "appier-logo.svg");

            const stylesSource = resolve(__dirname, "loading-styles.css");
            const stylesDestDir = resolve(outDir, "_ASSETS_");
            const stylesDestFile = resolve(stylesDestDir, "loading-styles.css");

            const phaserSource = resolve(__dirname, "phaser-custom.min.js");
            const phaserDestDir = resolve(outDir, "_ASSETS_");
            const phaserDestFile = resolve(phaserDestDir, "phaser-custom.min.js");

            try {
                await fs.copyFile(iconSource, iconDestFile);
                await fs.copyFile(appierLogoSource, appierLogoDestFile);
                await fs.copyFile(stylesSource, stylesDestFile);
                await fs.copyFile(phaserSource, phaserDestFile);
            } catch (err) {
                this.error(
                    `Error copying icon.png and appier-logo.svg and loading-styles.css and phaser-custom.min.js: ${err}`
                );
            }
        },
    };
};

// Plugin to inject ASSET_CONFIG in dev mode
const injectAssetConfigDev = (): PluginOption => {
    return {
        name: "inject-asset-config-dev",
        apply: "serve", // Only apply during dev
        transformIndexHtml(html) {
            return html.replace(
                "</body>",
                `    <script src="/src/configs/ASSET_CONFIG.js"></script>
    </body>`
            );
        },
    };
};

const replaceIconAppierLogoStylesPathDev = (): PluginOption => {
    return {
        name: "replace-icon-appier-logo-styles-path-dev",
        apply: "serve", // Only apply during dev
        transformIndexHtml(html) {
            const iconTemp = html.replaceAll("_ASSETS_/icon.png", "public/assets/icon.png");

            const stylesTemp = iconTemp.replaceAll(
                "_ASSETS_/loading-styles.css",
                "loading-styles.css"
            );

            return stylesTemp.replaceAll(
                "_ASSETS_/appier-logo.svg",
                "public/assets/appier-logo.svg"
            );
        },
    };
};

// Plugin to move scripts to body
const moveAssetConfigToBody = (): PluginOption => {
    return {
        name: "move-script-to-body",
        apply: "build", // Only apply during build
        transformIndexHtml(html) {
            // Remove scripts from head and add them to body
            return html.replace(/<script\b[^>]*type="module"[^>]*>.*?<\/script>/g, "").replace(
                "</body>",
                `    <script src="_ASSETS_/ASSET_CONFIG.js"></script>
                    <script src="_ASSETS_/index.js"></script>  
    </body>`
            );
        },
    };
};

const replacePhaserCustomBuild = (): PluginOption => {
    return {
        name: "replace-phaser-custom-build",
        apply: "build",
        transformIndexHtml(html) {
            return html.replaceAll(
                '<script id="phaser-custom-build"></script>',
                '<script id="phaser-custom-build" src="_ASSETS_/phaser-custom.min.js"></script>'
            );
        },
    };
};

let commitHash = "unknown";
let branchName = "unknown";

try {
    commitHash = execSync("git rev-parse --short HEAD").toString().trim();
    branchName = execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
} catch (error) {
    // Ignore git errors during build process
    console.warn("Warning: Unable to retrieve git information");
}

export default defineConfig({
    root: "./",
    base: "",
    publicDir: false,
    server: {
        open: true,
    },
    define: {
        __DEV__: true,
        __COMMIT_HASH__: JSON.stringify(commitHash),
        __BRANCH_NAME__: JSON.stringify(branchName),
    },
    build: {
        outDir: "dist",
        rollupOptions: {
            // NOTE: To reduce creative serving index.js bundle size.
            //       We use custom build phaser-custom.min.js in index.html
            //       https://medium.com/@louigi.verona/reducing-phasers-filesize-custom-phaser-builds-4a0314819a38
            external: ["./src/configs/ASSET_CONFIG.js", "phaser"],
            output: {
                format: "iife",
                name: "index",
                entryFileNames: "_ASSETS_/index.js",
                chunkFileNames: "[name].js",
                assetFileNames: "assets/[name].[ext]",
                globals: {
                    phaser: "Phaser",
                },
            },
        },
    },
    plugins: [
        injectAssetConfigDev(),
        moveAssetConfigToBody(),
        copyAssetConfig(),
        copyIconAppierLogoStylesPhaserToAssetsFolder(),
        copyFonts(),
        replacePhaserCustomBuild(),
        replaceIconAppierLogoStylesPathDev(),
    ],
});
