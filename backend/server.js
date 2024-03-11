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
      const tableName = body.tableName;
      const formQuestions = body.formQuestions;
      /* Concactenation of Client Name and Form Name to be assigned to the table name */
      /* Query to create the table and columns based on the iteration of formQuestions as Columns */
      /* JSON Format:
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
            ${Object.values(formQuestions).map(questionValue => `${questionValue} VARCHAR(255)`).join(', ')}
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
    const tableName = body.tableName;
    const formQuestions = body.formQuestions;
    /* Insert into the corresponding table based on a JSON format i.e.
      {
        "tableName" : "UPB_cuestionario",
        "formQuestions": {
            "Nombre": "Fabian",
            "Apellido": "Ayala",
            "Telefono": "65161667",
            "Curso": "Algebra Lineal",
            "Calificacion": "8"
        }
      }
    */
    const columns = Object.keys(formQuestions).join(', ');
    const values = Object.values(formQuestions).map(value => `'${value}'`).join(', ');
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