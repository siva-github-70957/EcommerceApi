const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');
const UserModel = require('./models/User');
const bcrypt = require('bcrypt');
const salt = bcrypt.genSaltSync(8);
const PORT = process.env.PORT || 4000
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const app = express();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const ProductModel = require('./models/Product');
const CartModel = require('./models/Cart');
var fs = require('fs');


app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
}))

cloudinary.config({
    cloud_name: "divohvzqy",
    api_key: process.env.CLOUDKEY,
    api_secret: process.env.CLOUDSECRET
});


mongoose.connect(process.env.Database, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log(" database connection successull"))
    .catch((err) => console.log('Connecting Database Error : ', err));

app.post('/register', async (req, res) => {
    let { fullName, email, password } = req.body;
    try {
        const userDoc = await UserModel.create({
            fullName, email,
            password: bcrypt.hashSync(password, salt)
        })
        res.json(userDoc);

    } catch (e) {
        res.status(422).json(e);
    }
})

app.post('/login', async (req, res) => {
    const { email, lpassword } = req.body;
    const userDoc = await UserModel.findOne({ email });
    if (userDoc) {
        const passOk = bcrypt.compareSync(lpassword, userDoc.password);
        if (passOk) {
            jwt.sign({ email: userDoc.email, id: userDoc._id },
                process.env.SKEY, {}, (err, token) => {
                    if (err) { throw err }
                    res.cookie('token', token, {
                        secure: true,
                        sameSite: 'none'
                    }).json(userDoc);
                })
        }
        else {
            res.status(401).json('incorrect password');
        }
    } else {
        res.status(401).json('No user found');
    }
})


app.get('/profile', (req, res) => {
    const { token } = req.cookies;
    if (token) {
        jwt.verify(token, process.env.SKEY, {}, async (err, userData) => {
            if (err) { res.json('no user found') }
            const { fullName, email, _id } = await UserModel.findById(userData.id);
            res.json({ fullName, email, _id });
        })
    }
    else {
        res.json(null);
    }
})

app.post('/logout', (req, res) => {
    res.cookie('token', '', { secure: true, sameSite: 'none' }).status(200).json('logged out success');
})


app.post('/uploadByLink', (req, res) => {
    const { link } = req.body;
    const response = cloudinary.uploader.upload(link, { public_id: "olympic_flag" })

    response.then((data) => {
        res.json(data.secure_url);
    }).catch((err) => {
        res.status(402).json('error in uploading image by link')
    });
})

const photosMiddleware = multer({});
// app.post('/normalupload', photosMiddleware.array('photos', 100), async (req, res) => {
//     for (let i = 0; i < req.files.length; i++) {
//         console.log(req.files[i]);
//     }

// });

app.post('/normalupload', (req, res) => {
    res.status(402).json('feature under development');
})


app.get('/myproducts', async (req, res) => {
    const { token } = req.cookies;
    if (token) {
        jwt.verify(token, process.env.SKEY, {}, async (err, userData) => {
            const products = await ProductModel.find({ UserId: userData._id })
            res.json(products);
        })
    }
    else {
        res.status(401).json('pls login  ');
    }

})

app.post('/addproduct', async (req, res) => {
    const { token } = req.cookies;
    const { name, category, images, price, description,
        highlights } = req.body;
    if (token) {
        jwt.verify(token, process.env.SKEY, {}, async (err, userData) => {
            if (err) { res.json(err); }
            const { _id } = await UserModel.findById(userData.id);
            ProductModel.create({
                user: _id, name, category, images, price, description, highlights
            }).then((doc) => res.json(doc))
                .catch((err) => res.json(err));
        })
    }
    else { res.json('no cookie found') };
})


app.post('/toCart', async (req, res) => {
    const { token } = req.cookies;
    const { id } = req.body;
    if (token) {
        jwt.verify(token, process.env.SKEY, {}, (err, userData) => {
            if (err) { res.json(null) }
            const cartDoc = CartModel.create({
                userId: userData._id,
                productId: id
            });
            res.json(cartDoc);
        })
    }
    else {
        res.json(null);
    }
})

app.get('/myproducts/:id', async (req, res) => {
    const { id } = req.params;
    const product = await ProductModel.findById({ _id: id });
    res.json(product);
})



app.get('/', (req, res) => {
    res.json("you are at home page");
})


app.listen(PORT, () => {
    console.log('server connected at port ', PORT);
})