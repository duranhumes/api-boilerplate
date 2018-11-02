/**
 *
 * @param {object} obj
 *
 * Check if object is empty
 *
 * @returns boolean
 */
export const isEmpty = obj => {
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) return false;
    }
    return true;
};
