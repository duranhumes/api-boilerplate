/**
 *
 * @param {object} obj
 * @param {array} keys
 *
 * Returns new object without keys
 * specified in keys param
 */
export const reject = (obj, keys) => {
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
        ...Object.keys(obj)
            .filter(k => !keys.includes(k))
            .map(k => ({ [k]: obj[k] })),
    );
};
