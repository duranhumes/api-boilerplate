import axios from 'axios';

import { logger } from '../../lib/services/logging';

const BASE_URL = 'https://www.googleapis.com/userinfo/v2/me';

async function authAsync(token) {
    let response = null;
    try {
        response = await axios.get(BASE_URL, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            timeout: 5000,
        });
    } catch (error) {
        console.log(error);
        logger('Google OAuth Error', error, 500);

        return Promise.reject(new Error('Google OAuth Error'));
    }

    if (response.status !== 200) {
        logger('Google OAuth Error', response, 500);

        return Promise.reject(new Error('Google OAuth Error'));
    }

    return Promise.resolve(response.data);
}

export const Google = {
    authAsync,
};
