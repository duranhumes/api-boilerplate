export function testPromisify(func) {
    return async function(done) {
        try {
            await func()

            return done()
        } catch (err) {
            return done(err)
        }
    }
}
