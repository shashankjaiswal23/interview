const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const nodemailer = require('nodemailer');
const router = new express.Router()

router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        //sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/users/me', auth,async (req, res) => {
    res.send(req.user)
})

router.patch('/users/me', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth,async (req, res) => {
    try {
        await req.user.remove()
        //sendCancelationEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/reset', function (req, res) {
    User.findOne({ email: req.body.email }, function (error, userData) {
        var transporter = nodemailer.createTransport({
            servive: 'gmail',
            auth: {
                users: 'aliasingh0705@gmail.com',
                pass: '23041994'
            }
        });

        
        var currentDateTime = new Date();
        var mailOptions = {
            from: 'shashankjaiswal2304@gmail.com',
            to: req.body.email,
            subject: 'Password Reset',

            html: "<h1>Welcome To Daily Task Report ! </h1><p>\
            <h3>Hello "+userData.name+"</h3>\
            If You are requested to reset your password then click on below link<br/>\
            <a href='http://localhost:3000/change-password/"+currentDateTime+"+++"+userData.email+"'>Click On This Link</a>\
            </p>"
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
                User.updateOne({email: userData.email}, {
                    token: currentDateTime, 
                    
                },  {multi:true},function(err, affected, resp) {
                    return res.status(200).json({
                        success: false,
                        msg: info.response,
                        userlist: resp
                    });
                })
            }
        });
    })
});

module.exports = router