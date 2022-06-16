import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const app = express();

app.use(express.json());

//mock database
const customers = [];

/**
 * cpf - string
 * name - string
 * id - uuid
 * statement - []
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

app.listen(3333);
