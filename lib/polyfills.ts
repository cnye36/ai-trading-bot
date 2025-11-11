/**
 * Polyfills for deprecated Node.js util functions
 * TensorFlow.js 4.22.0 and earlier use util.isNullOrUndefined which was removed in Node.js 16+
 */

import * as util from 'util';

// Polyfill for util.isNullOrUndefined (removed in Node.js 16+)
if (typeof (util as any).isNullOrUndefined !== 'function') {
    (util as any).isNullOrUndefined = function isNullOrUndefined(value: any): boolean {
        return value === null || value === undefined;
    };
}

// Export to ensure this module is loaded
export const polyfillsLoaded = true;
