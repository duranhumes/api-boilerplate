import { Router } from 'express'

import Controller from '../Controller'
import requireLogin from '../../lib/middleware/requireLogin'

class LogoutController extends Controller {
    constructor() {
        super()

        this.router = Router()
        this.routes()
    }

    routes() {
        this.router.post('/', requireLogin, this.logout)
    }

    logout = (req, res) => {
        req.user = null
        delete req.user

        return res.sendStatus(200)
    }
}

export default new LogoutController().router
