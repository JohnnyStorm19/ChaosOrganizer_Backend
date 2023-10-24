export default function extendTimeout (req, res, next) {
    // adjust the value for the timeout, here it's set to 3 minutes
    res.setTimeout(2000, () => { // you can handle the timeout error here })
    next();
  })
}  