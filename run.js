/* global process */
/**
 * Electron.js application entry point
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
process.on("uncaughtException", exc => {
    "development" === process.env.NODE_ENV && console.debug(exc);
});
