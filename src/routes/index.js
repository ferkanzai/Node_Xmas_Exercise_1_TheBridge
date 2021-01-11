const express = require('express')

const wishesRouter = require('./wishes')

const router = express.Router()

router.use('/wishes', wishesRouter)

module.exports = router;