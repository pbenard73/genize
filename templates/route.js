module.exports = (es6 = false) => {
    if (es6 === false) {
    return `const express = require("express")
const router = express.Router()

router.get("/", (req, res) => {
    res.json({ valid: true })
})

module.exports = router`
} 
 
 return `import express from "express"
const router = express.Router()

router.get("/", (req, res) => {
    res.json({ valid: true })
})

export default router`
    
}
