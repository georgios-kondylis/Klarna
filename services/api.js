import fetch from 'node-fetch';

import { config } from 'dotenv'; //this is to get acces to .env file and its variables
config();

export async function getProducts() {
	const res = await fetch(`${process.env.FAKE_STORE_API_URL}/products`); // all products saved in a variable
	const products = await res.json();  // all products in json objects
	return products;
}
export async function getProduct(id) {
	const res = await fetch(`${process.env.FAKE_STORE_API_URL}/products/${id}`);
	const product = await res.json();
	return product;
}
