
const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    user: mongoose.Schema.Types.ObjectId,
    productId: [mongoose.Schema.Types.ObjectId],
})

const CartModel = mongoose.model('cartitem', CartSchema);

module.exports = CartModel;