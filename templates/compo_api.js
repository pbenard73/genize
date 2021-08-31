const createTemplate = () => {
    const topHoc = `import useReactizy from './../hooks/useReactizy'`
    const bottomExport = `MyComponent`

		const template = `const MyComponent = () => {
    const [api, setApi] = useState(null)
    const _ = useReactizy()

    useEffect(() => {
      _.api.call('main')
        .then(() => setApi(true))
        .catch(() => setApi(false))
    }, [])
    

    if (api === null) {
        return <div>Api is calling</div>
    }

    if (api === true) {
        return <div>Api is Linked</div>
    }

    if (api === false) {
        return <div>Api is not linked, does your express server is running ?</div>
    }
}`

	return `import React, { useState, useEffect } from 'react'
${topHoc}

${template}

export default ${bottomExport}`
}

module.exports = createTemplate
