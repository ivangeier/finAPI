import express, { request, response } from 'express';
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
 * UTILS
 */
function getBalance(statement) {
	const balance = statement.reduce((acc, operation) => {
		if (operation.type === 'credit') {
			return acc + operation.amount;
		} else {
			return acc - operation.amount;
		}
	}, 0);

	return balance;
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
		id,
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

/**
 * DEPOSIT IN ACCOUNT
 */
app.post('/deposit', accountExists, (request, response) => {
	const { amount, description } = request.body;
	const { customer } = request;

	const statementOperation = {
		description,
		amount,
		created_at: new Date(),
		type: 'credit',
	};

	customer.statement.push(statementOperation);

	return response.status(200).send();
});

/**
 * WITHDRAW FROM ACCOUNT
 */
app.post('/withdraw', accountExists, (request, response) => {
	const { amount } = request.body;
	const { customer } = request;

	const balance = getBalance(customer.statement);

	if (balance < amount) {
		return response.status(400).json({ error: 'Non-Sufficient Funds (NSF)' });
	}

	const statementOperation = {
		amount,
		created_at: new Date(),
		type: 'debit',
	};

	customer.statement.push(statementOperation);

	return response.status(200).send();
});

/**
 * STATEMENT BY DATE
 */
app.get('/statement/date', accountExists, (request, response) => {
	const { customer } = request;
	const { date } = request.query;

	const dateFormat = new Date(date + ' 00:00');

	const statement = customer.statement.filter(
		(statement) =>
			statement.created_at.toDateString() ===
			new Date(dateFormat).toDateString()
	);

	return response.status(200).json(statement);
});

/**
 * UPDATE ACCOUNT
 */
app.put('/account', accountExists, (request, response) => {
	const { name } = request.body;
	const { customer } = request;

	customer.name = name;

	return response.status(201).send();
});

/**
 * GET ACCOUNT
 */
app.get('/account', accountExists, (request, response) => {
	const { customer } = request;

	return response.status(200).json(customer);
});

/**
 * DELETE ACCOUNT
 */
app.delete('/account', accountExists, (request, response) => {
	const { customer } = request;

	customers.splice(customers.indexOf(customer), 1);

	return response.status(200).json(customers);
});

app.listen(3333);
