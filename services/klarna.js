import fetch from 'node-fetch';
import { config } from 'dotenv'; //this is to get acces to .env file and its variables
config();

const ngrokURL = 'b0a0-81-228-212-20.ngrok-free.app'; // https://d5db-81-228-212-20.ngrok-free.app

export function getKlarnaAuth() {
	const username = process.env.PUBLIC_KEY;
	const password = process.env.SECRET_KEY;
	const auth = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
	return auth;
}

// Skapar en order from klarna
export async function createOrder(product) {
	const path = '/checkout/v3/orders';
	const auth = getKlarnaAuth();
	const url = process.env.BASE_URL + path; // https://api.playground.klarna.com/checkout/v3/orders
	const method = 'POST';
	const headers = {
		'Content-Type': 'application/json',
		Authorization: auth
	};

	const quantity = 1;
	const price = product.price * 100; // ???
	const total_amount = price * quantity;
	const total_tax_amount = total_amount * 0.2;

	const payload = {
		purchase_country: 'SE',
		purchase_currency: 'SEK',
		locale: 'sv-SE',
		order_amount: total_amount,
		order_tax_amount: total_tax_amount,
		order_lines: [
			{
				type: 'physical',
				reference: product.id,
				name: product.title,
				quantity: quantity,
				unit_price: price,
				tax_rate: 2500,
				total_amount: total_amount,
				total_discount_amount: 0,
				total_tax_amount: total_tax_amount,
				image_url: product.image
			}
		],
		merchant_urls: {
			terms: `https://${ngrokURL}/terms.html`,
			checkout: `https://${ngrokURL}/checkout.html?order_id={checkout.order.id}`,
			confirmation: `https://${ngrokURL}/confirmation?order_id={checkout.order.id}`,
			push: `https://${ngrokURL}/api/push?order_id={checkout.order.id}`
		}
	};

	const body = JSON.stringify(payload);
	const response = await fetch(url, { method, headers, body });
	const jsonResponse = await response.json();

	// "200" is success from Klarna KCO docs
	if (response.status === 200 || response.status === 201) {
		return jsonResponse;
	} else {
		console.error('ERROR: ', jsonResponse);
		return { html_snippet: `<h1>${JSON.stringify(jsonResponse)}</h1>` };
	}
}

// Hämtar en order from klarna
export async function retrieveOrder(order_id) {
	const path = `/checkout/v3/orders/${order_id}`;
	const auth = getKlarnaAuth();
	const url = `${process.env.BASE_URL}${path}`;
	const method = 'GET';
	const headers = { Authorization: auth };
	const response = await fetch(url, { method: method, headers: headers });

	if (response.status === 200 || response.status === 201) {
		const json = await response.json();
		return json;
	} else {
		return { html_snippet: `<h1>${response.status} ${response.statusText}</h1>` };
	}
}

/*		BÅDE TERMINALER MÅSTE JOBBA SAMTIDIGT

ngrok config add-authtoken YOUR_AUTH_TOKEN
npm run dev

Run the following command in a new terminal:
ngrok http 3000

Use the ngrok URL
Forwarding    https://your-unique-url.ngrok.io -> http://localhost:3000

*/