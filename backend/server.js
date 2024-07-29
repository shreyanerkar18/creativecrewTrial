const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
//const jwtDecode = require('jwt-decode');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;
const routes = require('./routes/routes');
const models = require('./models/models');

const jwt = require('jsonwebtoken');
const JWT_SECRET = '2343434asaflajsdfkljalsibkei'; // Hardcoded JWT secret

app.use(bodyParser.json());

app.use(cors({
  /*origin : 'http://34.46.69.235'*/
}));

/*function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
}

/*app.post('/signup', (req, res) => {
  const { firstName, lastName, email, password, role, bu, transport } = req.body;
  console.log(firstName, lastName, email, password, role, bu, transport);
  const token = jwt.sign({ email }, JWT_SECRET);

  console.log(firstName, lastName, email, password, role, bu, transport);

  // const tokenGenerated = token;
  // const decoded = jwtDecode(tokenGenerated);
  // console.log(decoded);

  const decodedPayload = parseJwt(token);
  console.log(decodedPayload);



  models.insertUser(firstName, lastName, email, password, role, bu, transport, (err, result) => {
    if (err) {
      console.error("Error inserting user:", err.message);
      return res.status(500).json({ error: 'Error inserting data into the database' });
    }
    res.status(201).json({ message: 'Data inserted successfully', token });
  })
});*/

app.use(routes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});