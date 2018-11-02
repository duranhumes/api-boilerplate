import fs from 'fs';

/**
 * Removes directories recursivly
 * @param {string} path - fully qualified file path
 */
export const clean = path => {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(file => {
            /**
             * Keep re-calling 'clean' until last directory in found
             * then remove it.
             */
            const currentPath = `${path}/${file}`;
            if (fs.lstatSync(currentPath).isDirectory()) {
                clean(currentPath);
            } else {
                fs.unlinkSync(currentPath);
            }
        });

        fs.rmdirSync(path);
    }
};
