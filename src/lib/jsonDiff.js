/**
 * Recursively computes a flat diff between two parsed JSON values.
 * Returns an array of diff entries, each with:
 *   { path, type: 'added' | 'removed' | 'changed' | 'unchanged', leftVal, rightVal }
 */
export function computeJsonDiff(left, right, path = '') {
    const results = [];

    if (left === right) {
        results.push({ path: path || '(root)', type: 'unchanged', leftVal: left, rightVal: right });
        return results;
    }

    const leftType = getType(left);
    const rightType = getType(right);

    // If types differ, treat as a changed scalar
    if (leftType !== rightType || leftType === 'scalar') {
        results.push({ path: path || '(root)', type: 'changed', leftVal: left, rightVal: right });
        return results;
    }

    if (leftType === 'object') {
        const allKeys = new Set([...Object.keys(left), ...Object.keys(right)]);
        for (const key of allKeys) {
            const childPath = path ? `${path}.${key}` : key;
            const inLeft  = Object.prototype.hasOwnProperty.call(left, key);
            const inRight = Object.prototype.hasOwnProperty.call(right, key);

            if (inLeft && !inRight) {
                results.push(...flattenRemoved(left[key], childPath));
            } else if (!inLeft && inRight) {
                results.push(...flattenAdded(right[key], childPath));
            } else {
                results.push(...computeJsonDiff(left[key], right[key], childPath));
            }
        }
        return results;
    }

    if (leftType === 'array') {
        const maxLen = Math.max(left.length, right.length);
        for (let i = 0; i < maxLen; i++) {
            const childPath = `${path || '(root)'}[${i}]`;
            if (i >= left.length) {
                results.push(...flattenAdded(right[i], childPath));
            } else if (i >= right.length) {
                results.push(...flattenRemoved(left[i], childPath));
            } else {
                results.push(...computeJsonDiff(left[i], right[i], childPath));
            }
        }
        return results;
    }

    return results;
}

function getType(val) {
    if (Array.isArray(val)) return 'array';
    if (val !== null && typeof val === 'object') return 'object';
    return 'scalar';
}

function flattenAdded(val, path) {
    const type = getType(val);
    if (type === 'scalar' || val === null) {
        return [{ path, type: 'added', leftVal: undefined, rightVal: val }];
    }
    const results = [];
    if (type === 'object') {
        for (const key of Object.keys(val)) {
            results.push(...flattenAdded(val[key], `${path}.${key}`));
        }
    } else if (type === 'array') {
        val.forEach((item, i) => results.push(...flattenAdded(item, `${path}[${i}]`)));
    }
    return results.length ? results : [{ path, type: 'added', leftVal: undefined, rightVal: val }];
}

function flattenRemoved(val, path) {
    const type = getType(val);
    if (type === 'scalar' || val === null) {
        return [{ path, type: 'removed', leftVal: val, rightVal: undefined }];
    }
    const results = [];
    if (type === 'object') {
        for (const key of Object.keys(val)) {
            results.push(...flattenRemoved(val[key], `${path}.${key}`));
        }
    } else if (type === 'array') {
        val.forEach((item, i) => results.push(...flattenRemoved(item, `${path}[${i}]`)));
    }
    return results.length ? results : [{ path, type: 'removed', leftVal: val, rightVal: undefined }];
}
