/**
 * Hook for electron-builder
 *
 * @architect Mark Jivko <mark@uindow.com>
 * @copyright © 2024-2026 Uindow™ (https://uindow.com)
 *
 * Licensed under the Uindow™ Source-Available License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://github.com/uindow/uindow/blob/main/LICENSE.txt
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const asar = require("asar");
const path = require("path");
const fs = require("fs-extra");

/**
 * @param {Object} context Context
 */
module.exports = async context => {
    const { packager, appOutDir } = context;

    // Prepare the resources path, relative to the app output directory
    let pathResRelative = ["resources"];

    // MacOS has a different folder structure
    if ("darwin" === process.platform) {
        let dirNameApp = null;
        for (const file of fs.readdirSync(appOutDir, { withFileTypes: true })) {
            if (file.isDirectory() && file.name.endsWith(".app")) {
                dirNameApp = file.name;
                break;
            }
        }
        if (null !== dirNameApp) {
            pathResRelative = [dirNameApp, "Contents", "Resources"];
        }
    }

    // Prepare app paths
    const pathAppDir = path.join(appOutDir, ...pathResRelative, "app");
    const pathAppAsar = path.join(appOutDir, ...pathResRelative, "app.asar");
    const pathDist = path.join(packager.appInfo.info.projectDir, "dist");

    // ASAR mode
    const isAsar = fs.existsSync(pathAppAsar);

    // Clean-up
    fs.rmSync(isAsar ? pathAppAsar : pathAppDir, { recursive: true });

    // Copy files
    fs.emptyDirSync(pathAppDir);
    fs.cpSync(pathDist, pathAppDir, { recursive: true });

    // Remove artifacts
    const pathLock = path.join(appOutDir, ...pathResRelative, "app", "package-lock.json");
    fs.existsSync(pathLock) && fs.removeSync(pathLock);
    console.log("  • Updated app resources");

    // Re-create archive
    if (isAsar) {
        await asar.createPackage(pathAppDir, pathAppAsar);
        fs.rmSync(pathAppDir, { recursive: true });
        console.log("  • Repacked app.asar");
    }
};
