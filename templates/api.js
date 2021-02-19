const createTemplate = data => `const ${data.name} = {}

export default ${data.name}`

module.exports = createTemplate
