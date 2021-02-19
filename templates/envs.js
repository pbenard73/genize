module.exports = (es6 = false, dev = false) => {
    if (es6 === false) {
    if (dev === true) {
    return `module.exports = {
    env:'dev',
    api: 'http://localhost:5000'
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
    api: 'http://localhost:5000'
}`
    }

    return `export default {
    env:'prod',
    api: ''
}`


}
