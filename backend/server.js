/* Packages required and port connection */
const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000;
const dotenv = require('dotenv');
dotenv.config()
/* Stablish the Database Connection */
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});
/* Show if the connection was succesful or could not connect */
connection.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL database:', err);
      return;
    }
    console.log('Connected to MySQL database');
});
/* Middleware to parse JSON in the request body */
app.use(express.json());
/* /newform API to create a table for the new form */
app.post('/newform', async (req, res) => {
    try {
      const { body } = req;
      /* JSON data received from the front end*/
      const tableName = body.tableName.replace(/[^a-zA-Z0-9_]/g, '');
      const formQuestions = body.formQuestions;
      const columns = Object.entries(formQuestions).map(([key, value]) =>
        `${value.replace(/[^a-zA-Z0-9_]/g, '')} VARCHAR(255)`
      ).join(', ');
      /* Concactenation of Client Name and Form Name to be assigned to the table name */
      /* Query to create the table and columns based on the iteration of formQuestions as Columns */
      /* i.e. JSON Format:
        {
            "tableName": "UPB_Form",
            "formQuestions": {
                "question1": "Name",
                "question2": "Surname",
                "question3": "Phone",
                "question4": "Course",
                "question5": "Rate"
            }
        }
      */
        const createTableQuery = `
        CREATE TABLE IF NOT EXISTS ${tableName} (
          id INT AUTO_INCREMENT PRIMARY KEY,
          ${columns}
        );
      `;
      /* Call query execution function */
      await executeQuery(createTableQuery);
      /* Return http status of the API call */
      res.status(200).send(`Table ${tableName} created successfully`);
    } catch (error) {
      /* If error return http 400 and console the error */
      console.error('Error during table creation:', error);
      res.status(400).send("Error during table creation");
    }
});
/* /newentry API to fill the form table with responses */
app.post('/newentry', async (req, res) => {
  try {
    const { body } = req;
    /* JSON data received from the front end*/
    const tableName = body.tableName.replace(/[^a-zA-Z0-9_]/g, '');
    const formQuestions = body.formQuestions;
    const columns = Object.keys(formQuestions).join(', ');
    const values = Object.values(formQuestions).map(value => `'${value}'`).join(', ');
    /* i.e. Insert into the corresponding table based on a JSON format
      {
        "tableName" : "UPB_Form",
        "formQuestions": {
            "Name": "Fabian",
            "Surname": "Ayala",
            "Phone": "65161667",
            "Course": "Algebra Lineal",
            "Rate": "8"
        }
      }
    */
    const insertQuery = `
      INSERT INTO ${tableName} (${columns})
      VALUES (${values});
    `;
    /* Call query execution function */
    await executeQuery(insertQuery);
    /* Return http status of the API call */
    res.status(200).send(`New entry added successfully`);
  } catch (error) {
    /* If error return http 400 and console the error */
    console.error('Error during entry adition:', error);
    res.status(400).send("Error during entry adition");
  }
});
app.get('/getEntries', async (req, res) => {
  try {
      const { body } = req;
      /* JSON data received from the front end*/
      const tableName = body.tableName;
      /* i.e. Table Name JSON Format
      {
        "tableName" : "UPB_Form"
      }
      */
      /* Validation for table name */
      if (!tableName || typeof tableName !== 'string') {
          return res.status(400).send("Invalid table name provided");
      }
      /* Construct the query to select all records from the specified table */
      const selectQuery = `SELECT * FROM ${tableName}`;
      /* Call query execution function */
      const results = await executeQuery(selectQuery);
      res.status(200).json(results);
  } catch (error) {
      /* If error return http 400 and console the error */
      console.error('Error fetching entries:', error);
      res.status(400).send("Error fetching entries");
  }
});
/* Asyng function to handle the SQL Query */
async function executeQuery(query) {
    return new Promise((resolve, reject) => {
        connection.query(query, (error, results, fields) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}
/* Stablish the backend connection and console the port thar is running */
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});