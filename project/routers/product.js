const express = require('express')
const Product = require('../models/product')
const auth = require('../middleware/auth')
const { $where } = require('../models/product')
const router = new express.Router()

router.post('/products', auth, async (req, res) => {
    const products = new Product({
        ...req.body,
        owner: req.user._id
    })

    try {
        await products.save()
        res.status(201).send(products)
    } catch (e) {
        res.status(400).send(e)
    }
})

//GET /products?category="shirts"
router.get('/products', auth,  async (req, res) => {
    const match = {}
    const sort = {}

    if (req.query.category) {
        match.category = req.query.category === 'clothes';
        
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        await req.user.populate({
            path: 'products',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.products)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/products/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const products = await Product.findOne({ _id, owner: req.user._id })

        if (!products) {
            return res.status(404).send()
        }

        res.send(products)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/products/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const products = await Product.findOne({ _id: req.params.id, owner: req.user._id})

        if (!products) {
            return res.status(404).send()
        }

        updates.forEach((update) => products[update] = req.body[update])
        await products.save()
        res.send(products)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/products/:id', auth, async (req, res) => {
    try {
        const products = await Product.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

        if (!products) {
            res.status(404).send()
        }

        res.send(products)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router