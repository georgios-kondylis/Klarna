import { getProducts, getProduct } from './services/api.js';
import { createOrder, retrieveOrder } from './services/klarna.js';
import express from 'express';
const app = express();

import { config } from 'dotenv'; //this is to get acces to .env file and its variables
config();

// process.env. we use it before the variable to acces it
// ex. console.log(process.env.PORT); outcome is 3000
// ex. console.log(process.env.BASE_URL); outcome is https://api.playground.klarna.com

app.get('/', async (req, res) => {
	const products = await getProducts();
	const markup = products
		.map(
			(p) =>
				`<a style ="display: block; margin: 10px; color: black" href="products/${p.id}">${p.title} - €${p.price}</a>`
		)
		.join(' ');
	res.send(markup);
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

app.listen(process.env.PORT);
