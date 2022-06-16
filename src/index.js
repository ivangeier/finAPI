import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const app = express();

app.use(express.json());

//mock database
const customers = [];

/**
 * MIDDLEWARE
 */
function accountExists(request, response, next) {
	const { cpf } = request.headers;
	const customer = customers.find((customer) => customer.cpf === cpf);

	if (!customer) {
		return response.status(400).json({ error: 'Customer not found.' });
	}

	request.customer = customer;

	return next();
}

/**
 * CREATE ACCOUNT
 */
app.post('/account', (request, response) => {
	const { cpf, name } = request.body;
	const id = uuidv4();

	//check if cpf already exist
	const customerAlreadyExist = customers.some(
		(customer) => customer.cpf === cpf
	);

	if (customerAlreadyExist) {
		return response.status(400).json({ error: 'Customer already exists!' });
	}

	customers.push({
		cpf,
		name,
		id: uuidv4,
		statement: [],
	});

	return response.status(201).send();
});

/**
 * GET USER STATEMENT
 */
app.get('/statement', accountExists, (request, response) => {
	const { customer } = request;
	return response.status(200).json(customer.statement);
});

app.listen(3333);
