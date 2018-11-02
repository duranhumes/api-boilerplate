import { Router } from 'express';

import Controller from '../Controller';
import requireLogin from '../../lib/middleware/requireLogin';

class LogoutController extends Controller {
    constructor() {
        super();

        this.router = Router();
        this.routes();
    }

    routes() {
        this.router.post('/', requireLogin, this.logout);
    }

    logout = async (_, res) => {
        // TODO: Implement logout

        res.sendStatus(200);

        return;
    };
}

const logoutController = new LogoutController();
const controller = logoutController.router;

export default controller;
