const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'JokesDB'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Routes
// Home route to search jokes
// app.get('/', (req, res) => {
//     res.render('search');
// });

app.get('/', (req, res) => {
    res.render('search', { jokes: [] }); // Pass an empty array for jokes
});


// Fetch jokes from the API
app.post('/search', async (req, res) => {
    try {
        const { term } = req.body;
        const response = await axios.get(`https://icanhazdadjoke.com/search?term=${term}`, {
            headers: { Accept: 'application/json' }
        });
        const jokes = response.data.results.map(joke => ({
            id: joke.id,
            text: joke.joke,
            imageUrl: `https://icanhazdadjoke.com/j/${joke.id}.png`
        }));
        res.render('search', { jokes });
    } catch (err) {
        res.status(500).send('Error fetching jokes');
    }
});



// Save favourite joke
app.post('/favourite', (req, res) => {
    const { joke, joke_image_url } = req.body;
    db.query('INSERT INTO favourites (joke, joke_image_url) VALUES (?, ?)', [joke, joke_image_url], (err) => {
        if (err) {
            return res.status(500).send('Error saving favourite');
        }
        res.redirect('/favourites');
    });
});

// Favourites route
app.get('/favourites', (req, res) => {
    db.query('SELECT * FROM favourites', (err, results) => {
        if (err) {
            return res.status(500).send('Error fetching favourites');
        }
        res.render('favourites', { jokes: results });
    });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
