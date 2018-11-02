import fs from 'fs';
import path from 'path';

import { isEmpty } from '../../lib/helpers/isEmpty';

/**
 * Creates a fixture based on the params provided, should be used with data from a factory.
 *
 * @param {object} fixtureData The data used to create a fixture ex. data returned from a factory
 * @param {string} fixtureName The name of the file to create
 * @param {string} environment Specify the project env ex. 'development, production, test'
 */
export function createFixture(
    fixtureData,
    fixtureName = 'fixture.json',
    environment = process.env.NODE_ENV,
) {
    if (!fixtureData || isEmpty(fixtureData)) {
        throw new Error('Data must be provided.');
    }

    const allowedEnv = ['development', 'production', 'test'];
    const validEnv = allowedEnv.every(env => env.includes(environment));

    if (!validEnv) {
        throw new Error(
            `${environment} is not a valid environment. Must be either ${allowedEnv.join(
                ' ',
            )}`,
        );
    }

    const rootPath = path.resolve(__dirname);
    const fileDir = `${rootPath}/${environment}`;
    fixtureName = fixtureName.split('.')[0];
    const fileName = `${fileDir}/${fixtureName}.json`;

    if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir);
        console.log(`Created ${fileDir} directory.`);
    }

    if (!fs.existsSync(fileName)) {
        fs.writeFileSync(fileName, [], 'utf8');
        console.log(`Created ${fixtureName} fixture.`);
    }

    /**
     * Open file and insert data
     */
    fs.readFile(fileName, 'utf8', (err, fileData) => {
        if (err) throw err;

        let currentData = null;
        if (fileData.trim() === '') {
            fs.writeFileSync(fileName, [], 'utf8', err => {
                if (err) throw err;
            });

            currentData = [];
        } else {
            currentData = JSON.parse(fileData);
        }

        const currentEntries = currentData ? currentData.length : 0;
        console.log(
            `Starting with ${currentEntries} entries in the ${fixtureName} fixture.`,
        );

        /**
         * If array of objects are passed
         * loop through and append to current data
         * else just add to the current data
         */
        if (Array.isArray(fixtureData)) {
            fixtureData.forEach(d => currentData.push(d));
        } else {
            currentData.push(fixtureData);
        }

        const jsonData = JSON.stringify(currentData);
        fs.writeFileSync(fileName, jsonData, 'utf8', err => {
            if (err) throw err;
        });

        console.log(
            `There are now ${
                currentData.length
            } entries in the ${fixtureName} fixture.`,
        );
    });
}
