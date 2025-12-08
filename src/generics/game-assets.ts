// Game asset and text configuration for Match & Fight Game
// This object is the single source of truth for all asset paths and customizable text.
// To override assets/text at runtime (e.g., from a game builder), set localStorage.matchFight (preferred) or window.matchFight before the game loads.
// Example:
//   localStorage.setItem('matchFight', JSON.stringify({ assets: { background: 'custom-bg.png' }, text: { winText: 'Victory!' } }))
//
// The game will merge these overrides with the defaults below.

import deepMerge from "./deep-merge";
import getOverrides from "./overriding-assets/get-overrides";

export const getFinalGameAssets = () =>
    deepMerge(structuredClone(window.base64Map), getOverrides());

//#region Builder Mappings

//#endregion

