module.exports = function Cart(oldCart) {
  this.items = oldCart.items || {};
  this.totalQuantity = oldCart.totalQuantity || 0;
  this.totalPrice = oldCart.totalPrice || 0;
  this.add = function (item, id) {
    let storedItem = this.items[id];
    if (!storedItem) {
      storedItem = this.items[id] = { item: item, qty: 0, price: 0 };
    }
    storedItem.qty++;
    storedItem.price = storedItem.item.price * storedItem.qty;
    this.totalQuantity++;
    this.totalPrice += storedItem.item.price;
  };

  this.remove = function (item, id) {
    let itemToRemove = this.items[id];
    // console.log("yeh rahi total price", this.totalPrice);
    // console.log("yeh rahi itemToremove price ", itemToRemove.price);
    // console.log("yeh rahi qty ", itemToRemove.qty);
    // console.log(
    //   "yeh rahi qty se multiply karnay k baad ",
    //   itemToRemove.qty * itemToRemove.price
    // );
    this.totalQuantity -= itemToRemove.qty;
    this.totalPrice = this.totalPrice - itemToRemove.price;
    delete this.items[id];
  };

  this.generateArray = function () {
    let arr = [];
    for (let id in this.items) {
      arr.push(this.items[id]);
    }
    return arr;
  };
};
