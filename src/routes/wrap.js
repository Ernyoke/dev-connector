// Unwrap asynchronous exceptions to be able to handle them with the errorHandling middleware
// Usage app.get('/', wrap(async (req, res) => { ... }))
module.exports = fn => (...args) => fn(...args).catch(args[2]) 