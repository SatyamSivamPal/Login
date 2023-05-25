import express from 'express'
import cors from 'cors'
import morgan from 'morgan';
import connect from './database/conn.js';
import router from './router/route.js';

const app = express();

// middle ware
app.use(express.json());
app.use(cors());
app.use(morgan('tiny'));
app.disable('x-powered-by')

const port = 8080;

//HTTP get request
app.get('/' , (req , res) => {
    res.status(201).json("Home GET request");
})

//api routes
app.use('/api',router)


//start server only when we have valid connection
connect().then(() => {
    try {
        app.listen(port , ()=>{
            console.log(`server connected to http://localhost:${port}`);
        })
    } catch (error) {
        console.log("Cannot connect to the server");
    }
}).catch(error => {
    console.log("Invalid database connected");
})

