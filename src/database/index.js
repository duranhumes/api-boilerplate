import { createFixture } from './fixtures';
import userFactory from './factories/users';

const users = userFactory(10);
createFixture(users, 'default', 'development');
