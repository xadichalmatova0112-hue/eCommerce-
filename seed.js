const fs = require("fs");


async function getProducts() {

    let res = await fetch("https://dummyjson.com/products?limit=30");

    let data = await res.json();

    let products = [];

    for (let i = 0; i < data.products.length; i++) {

        let p = data.products[i];

        // Narxni so'mga o'girish (1$ = 12600 so'm)
        let price = Math.round(p.price * 12600);
        let oldPrice = Math.round(price * 1.1);
        let monthly = Math.round(price / 12);

        let mahsulot = {
            id: i + 1,
            title: p.title,
            price: price,
            oldPrice: oldPrice,
            monthlyPrice: monthly,
            rating: p.rating,
            reviews: p.reviews.length,
            category: p.category,
            thumbnail: p.thumbnail
        };

        products.push(mahsulot);
    }

    let db = {
        products: products
    };

    fs.writeFileSync("db.json", JSON.stringify(db, null, 4));

    console.log(products.length + " ta mahsulot saqlandi");
}


getProducts();