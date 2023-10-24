import { Router } from 'express';
import itemsData from '../../db/items-data-db.js';
import { v4 } from 'uuid';
import upload from '../../controllers/multer-config.js';

const itemRouter = new Router();

itemRouter.get('/getmedia', (req, res) => {
    const id = req.query.id;
    const findedItem = itemsData.data.find(item => item.id === id);
    if (!findedItem) {
        res.json( { success: false, message: 'Item does not finded'} );
        return;
    }
    
    console.log(itemsData);
    res.json( { success: true, mediaURL: findedItem.imageURL } )
})

itemRouter.get('/gettext', (req, res) => {
    const id = req.query.id;
    const findedItem = itemsData.data.find(item => item.id === id);
    if (!findedItem) {
        res.json( { success: false, message: 'Item does not finded'} );
        return;
    }

    console.log(itemsData);
    res.json( { success: true, content: findedItem.content } )
})

itemRouter.post('/add/text', upload.none(), async (req, res) => {
    const { type, content } = req.body;
    const item = { content: content, type: type, id: v4() };
    
    itemsData.add(item);

    res.json({ success: 'Text added', itemData: item });
})

itemRouter.post('/add/image', upload.single('content'), async (req, res) => {
    const url = 'http://localhost:7070/images/' + req.file.filename;
    let id = v4();

    const item = { imageURL: url, type: 'image', id: id };
    itemsData.add(item);

    const imageObject = {
        imgUrl: url,
        id: id,
        type: 'image'
      };
    
    res.json({ success: 'Image added', itemData: imageObject });
})


export default itemRouter;