module.exports = (es6 = false, dev = false, port) => {
    if (es6 === false) {
    if (dev === true) {
    return `module.exports = {
    env:'dev',
    api: 'http://localhost:${port}'
}`
    }

    return `module.exports = {
    env:'prod',
    api: ''
}`
}

    if (dev === true) {
    return `export default {
    env:'dev',
    api: 'http://localhost:${port}'
}`
    }

    return `export default {
    env:'prod',
    api: ''
}`


}
