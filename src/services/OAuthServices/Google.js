import axios from 'axios'

import { logger } from '../../lib/utils/logging'
import { promisify } from '../../lib/utils'

const BASE_URL = 'https://www.googleapis.com/userinfo/v2/me'

async function authAsync(token) {
    const [response, responseErr] = await promisify(
        axios.get(BASE_URL, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            timeout: 5000,
        })
    )

    if (responseErr) {
        logger('Google OAuth Error', responseErr, 500)

        return Promise.reject(new Error(responseErr))
    }

    if (response.status !== 200) {
        logger('Google OAuth Error', response, 500)

        return Promise.reject(
            new Error({ code: 500, message: 'Google OAuth Error' })
        )
    }

    return Promise.resolve(response.data)
}

export const Google = {
    authAsync,
}
