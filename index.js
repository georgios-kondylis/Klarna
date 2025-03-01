import { getProducts, getProduct } from './services/api.js';
import { createOrder, retrieveOrder } from './services/klarna.js';
import express from 'express';
const app = express();

import { config } from 'dotenv'; //this is to get acces to .env file and its variables
config();
const PORT = process.env.PORT || 3000;


app.get('/', async (req, res) => {
  const products = await getProducts();
  const markup = products
    .map(
      (p) => `
      <div style="display: flex; justify-content: center; margin: 20px;">
        <div style="border: 1px solid #ddd; border-radius: 10px; padding: 20px; width: 250px; height: 500px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); transition: transform 0.3s ease-in-out;">
          <div style="width: 100%; height: 250px; background-image: url('${p.image}'); background-size: cover; background-position: center; border-radius: 5px;"></div>
          <div style="text-align: center; padding-top: 10px; height: 250px; display: flex; flex-direction: column; justify-content: space-between;">
            <a href="products/${p.id}" style="font-size: 18px; font-weight: bold; color: #333; text-decoration: none; margin-bottom: 10px;">${p.title}</a>
            <p style="font-size: 36px; color: #555; margin: 5px 0;">${p.price} kr</p>
            <button style="padding: 10px 15px; background-color: #008CBA; color: white; border: none; border-radius: 5px; cursor: pointer; transition: background-color 0.3s;">
              <a href="products/${p.id}" style="font-size: 18px; font-weight: bold; color: white; text-decoration: none;">Buy</a>
            </button>
          </div>
        </div>
      </div>
    `
    )
    .join('');
  
  res.send(`
    <html>
      <head>
        <title>Georgios eShop</title>
      </head>
      <body style="margin: 0; font-family: Arial, sans-serif;">
        <!-- Navbar -->
        <div style="background-color: #008CBA; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Georgios eShop</h1>
        </div>

        <h1 style="text-align: center; margin-top: 20px;">Welcome to my Klarna checkout Project</h1>
        <h2 style="text-align: center;">Our Products</h2>
        
        <div style="display: flex; flex-wrap: wrap; justify-content: center;">
          ${markup}
        </div>
      </body>
    </html>
  `);
});


app.get('/products/:id', async (req, res) => {
	try {
		// const id = req.params.id OR destructure
		const { id } = req.params;
		const product = await getProduct(id);
		const klarnaResponse = await createOrder(product);
		const markup = klarnaResponse.html_snippet;
		res.send(markup);
	} catch (error) {
		res.send(error.message);
	}
});

app.get('/confirmation', async (req, res) => {
	const { order_id } = req.query;
	const klarnaResponse = await retrieveOrder(order_id);
	const { html_snippet } = klarnaResponse;
	res.send(html_snippet);
});

console.log('Hello world kaula your url is localhost:3000');

app.listen(PORT);
