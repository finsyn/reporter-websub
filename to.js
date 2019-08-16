// from:
// https://blog.grossman.io/how-to-write-async-await-without-try-catch-blocks-in-javascript/
module.exports = function to(promise) {
   return promise.then(data => {
      return [null, data]
   })
   .catch(err => [err])
}
