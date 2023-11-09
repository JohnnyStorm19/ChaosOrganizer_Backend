import express from 'express';
import cors from 'cors';
import ws from 'ws';
import itemRouter from './routes/item/item-routers.js';
import itemsData from './db/items-data-db.js';

const app = express();
const port = process.env.PORT || 7070;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'))


app.use('/item', itemRouter);

// тест для render.com
app.get('/test', (req, res) => {
  res.send(`Hello world from server on ${port}`)
})


const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}...`);
})

server.on('close', () => {
})

