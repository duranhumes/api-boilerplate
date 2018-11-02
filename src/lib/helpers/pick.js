/**
 *
 * @param {object} obj
 * @param {array} keys
 *
 * Returns new object with only keys
 * specified in keys param
 */
export const pick = (obj, keys) => {
    if (!obj || !keys) {
        throw new Error('Both parameters must be supplied.');
    }
    if (typeof obj !== 'object') {
        throw new Error('First parameter must be an object.');
    }
    if (!Array.isArray(keys)) {
        throw new Error('Second parameter must be an array.');
    }

    return Object.assign(
        {},
        ...keys.map(k => (k in obj ? { [k]: obj[k] } : {})),
    );
};
