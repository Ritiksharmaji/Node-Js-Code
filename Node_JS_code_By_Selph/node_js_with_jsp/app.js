

const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = 3000;

const pool = new Pool({
    user: 'your_db_user',
    host: 'localhost',
    database: 'your_db_name',
    password: 'your_db_password',
    port: 5432,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/submit', async (req, res) => {
    const { name, email } = req.body;

    try {
        const client = await pool.connect();
        const result = await client.query('INSERT INTO users (name, email) VALUES ($1, $2)', [name, email]);
        const rowCount = result.rowCount;
        client.release();

        res.send(`User added successfully. Rows affected: ${rowCount}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
