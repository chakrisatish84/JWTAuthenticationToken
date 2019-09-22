require('dotenv').config()

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

app.use(express.json())

const posts = [
    {
        username: 'Satish',
        title: 'Post 1'
    },
    {
        username: 'Chakri',
        title: 'Post 2'
    }
]


const users = []

app.get('/users', (req, res) => {
    res.json(users);
})

app.post('/users', async (req, res) => {
    try {
        // this will generate number if we give 20 it may take days
        // you can replace this with 10
        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(req.body.password, salt);
        const user = {
            username: req.body.username,
            password: hashPassword
        }
        users.push(user);
        res.status(201).send()
    }
    catch{
        res.status(500).send()
    }
})

// User Authentication
app.post('/login', async (req, res) => {
    const user = users.find((user) => user.username == req.body.username)

    if (user == null) {
        res.status(400).send("Cannot find")
    }
    try {
        if (await bcrypt.compare(req.body.password, user.password)) {
            res.send('Success')
        }
        else {
            res.send('Not allowed')
        }
    }
    catch{
        res.status(500).send()
    }
})

app.get('/posts',authenticateToken, (req, res) => {
    res.json(posts.filter((post)=>post.username == req.user.username));
})

app.post('/loginWithToken', (req, res) => {
    //Authenticate user
    const user = { username: req.body.username }

    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)

    res.json({ accessToken: accessToken })
})

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null)
        return res.sendStatus(401)
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err)
            return res.sendStatus(403)
        req.user = user
        next()
    })
}

app.listen(3000)