require('dotenv').config(); //allows access to info in .env file
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet')
const cors = require('cors')
const POKEDEX = require('./pokedex.json') //as JSON is a subset of javascript we can require this file directly and use it like a JS object
const app = express();

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common'
app.use(morgan('morganSetting'));
app.use(helmet()) //hides info that a malicious party can use for attacks, must be placed before cors
app.use(cors()); //allows req-response from differect origins (localhost 3000 to localhost 8000 vice versa)



//middleware to validate every request before other handler functions start
app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get('Authorization');

  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    return res.status(401).json({ error: 'Unauthorized request' });
  }
  //move to the next middleware, otherwise request will hang until there was a timeout
  next();
});

//hardcode array of validtypes
const validTypes = [
  `Bug`,
  `Dark`,
  `Dragon`,
  `Electric`,
  `Fairy`,
  `Fighting`,
  `Fire`,
  `Flying`,
  `Ghost`,
  `Grass`,
  `Ground`,
  `Ice`,
  `Normal`,
  `Poison`,
  `Psychic`,
  `Rock`,
  `Steel`,
  `Water`,
];

//begin to seperate callback functions into named function as the modularity and reusability of code becomes important
function handleGetTypes(req, res) {
  //sends hardcorded validtypes as json
  res.json(validTypes);
}

//app.get method constructs the endpoint '/types' and uses middleware function to handle request
app.get('/types', handleGetTypes);

//request handler aka middleware
function handleGetPokemon(req, res) {
  let response = POKEDEX.pokemon;
  const { name, type } = req.query;

  //filter pokemon by name if name query is present
  if(name){
    response = response.filter( pokemon => 
      //case insensitive searching
      pokemon.name.toLowerCase().includes(name.toLowerCase())
    )
  }

  //filter pokemon by type if type query is present
  if(type){
    response = response.filter(pokemon => 
      pokemon.type.includes(type)
    )
  }

  res.json(response);
}

app.get('/pokemon', handleGetPokemon);

//error handler should be last middleware in pipeline
//4 parameters in middleware, express knows to treat this as an error handler
app.use((error, req, res, next) => {
  let response
  if (process.env.NODE_ENV === 'production'){
    response = { error: { message: 'server error' }}
  } else {
    response = { error }
  }
  res.status(500).json(response)
})

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
