import axios from 'axios'

import { logger } from '../../lib/utils/logging'
import { promisify } from '../../lib/utils'

const FIELDS = 'email,name,picture'
const BASE_URL = `https://graph.facebook.com/me?fields=${FIELDS}`

async function authAsync(token) {
    const [response, responseErr] = await promisify(
        axios.get(`${BASE_URL}&access_token=${token}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            timeout: 5000,
        })
    )
    if (responseErr) {
        console.log(responseErr)
        logger('Facebook OAuth Error', responseErr, 500)

        return Promise.reject(new Error(responseErr))
    }

    if (response.status !== 200) {
        logger('Facebook OAuth Error', response, 500)

        return Promise.reject(
            new Error({ code: 500, message: 'Facebook OAuth Error' })
        )
    }

    return Promise.resolve(response.data)
}

export const Facebook = {
    authAsync,
}
