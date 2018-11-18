import passport from 'passport'
import './passport'

export default passport.authenticate('jwt', { session: false })
