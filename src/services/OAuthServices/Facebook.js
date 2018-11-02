import axios from 'axios';

import { logger } from '../../lib/services/logging';

const FIELDS = 'email,name,picture';
const BASE_URL = `https://graph.facebook.com/me?fields=${FIELDS}`;

async function authAsync(token) {
    let response = null;
    try {
        response = await axios.get(`${BASE_URL}&access_token=${token}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            timeout: 5000,
        });
    } catch (error) {
        console.log(error);
        logger('Facebook OAuth Error', error, 500);

        return Promise.reject(new Error('Facebook OAuth Error'));
    }

    if (response.status !== 200) {
        logger('Facebook OAuth Error', response, 500);

        return Promise.reject(new Error('Facebook OAuth Error'));
    }

    return Promise.resolve(response.data);
}

export const Facebook = {
    authAsync,
};
