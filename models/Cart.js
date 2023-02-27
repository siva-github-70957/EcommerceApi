
const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
    }
})

const CartModel = mongoose.model('cartitem', CartSchema);

module.exports = CartModel;