/**
 *
 * @param {object} obj
 *
 * Check if object is empty
 *
 * @returns boolean
 */
export function isEmpty(obj) {
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) return false
    }

    return true
}

/**
 *
 * @param {object} obj
 * @param {array} keys
 *
 * Returns new object with only keys
 * specified in keys param
 */
export function pick(obj, keys) {
    if (!obj || !keys) {
        throw new Error('Both parameters must be supplied.')
    }
    if (typeof obj !== 'object') {
        throw new Error('First parameter must be an object.')
    }
    if (!Array.isArray(keys)) {
        throw new Error('Second parameter must be an array.')
    }

    return Object.assign(
        {},
        ...keys.map(k => (k in obj ? { [k]: obj[k] } : {}))
    )
}

/**
 *
 * @param {promise} promise
 *
 * Returns the value from a promise and an error if it exists.
 *
 * @returns {array} [value, error]
 */
export async function promisify(promise) {
    try {
        return [await promise, null]
    } catch (e) {
        return [null, e]
    }
}

/**
 *
 * @param {object} obj
 * @param {array} keys
 *
 * Returns new object without keys
 * specified in keys param
 */
export function reject(obj, keys) {
    if (!obj || !keys) {
        throw new Error('Both parameters must be supplied.')
    }
    if (typeof obj !== 'object') {
        throw new Error('First parameter must be an object.')
    }
    if (!Array.isArray(keys)) {
        throw new Error('Second parameter must be an array.')
    }

    return Object.assign(
        {},
        ...Object.keys(obj)
            .filter(k => !keys.includes(k))
            .map(k => ({ [k]: obj[k] }))
    )
}
