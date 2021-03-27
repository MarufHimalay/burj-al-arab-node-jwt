const express = require('express')
const cors = require('cors');
const bodyParser = require('body-parser');

require('dotenv').config()
const app = express()

app.use(cors());
app.use(bodyParser.json());

const port = 5000

const password = 'arabianhorse';

const admin = require("firebase-admin");

const serviceAccount = require("./burj-al-arab-himalay-firebase-adminsdk-1ix4n-8c3f05b014.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vo54x.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    const bookings = client.db("burjAlArab").collection("bookings");
    app.post('/addBooking', (req, res) => {
        const newBooking = req.body;
        bookings.insertOne(newBooking)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
        console.log(newBooking);
    })
    app.get('/bookings', (req, res) => {
        const bearer = req.headers.authorization;
        if(bearer && bearer.startsWith('Bearer ') ){
            const idToken = bearer.split(' ')[1];
            console.log({idToken});
            admin
            .auth()
            .verifyIdToken(idToken)
            .then((decodedToken) => {
                const tokenEmail = decodedToken.email;
                const queryEmail = req.query.email;
                if ( tokenEmail ==queryEmail ) {
                    bookings.find({email: queryEmail})
                    .toArray((err, documents) => {
                        res.send(documents);
                    })
                }
                else {
                    res.status(401).send('unauthorized access');    
                }
            })
            .catch((error) => {
                res.status(401).send('unauthorized access');    
            });
        }
            else {
                res.status(401).send('unauthorized access');    
            }
    })
});


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})