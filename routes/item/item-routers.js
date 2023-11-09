import { Router } from 'express';
import itemsData from '../../db/items-data-db.js';
import { v4 } from 'uuid';
import upload from '../../controllers/multer-config.js';
import { extractFileName } from '../../controllers/extractFileName.js';
import * as path from 'path';
import { unlink } from 'fs';

const itemRouter = new Router();

itemRouter.get('/getAllItems', (req, res) => {
    res.json( {success: true, items: itemsData.data} );
})

itemRouter.get('/getmedia', (req, res) => {
    const id = req.query.id;
    const findedItem = itemsData.data.find(item => item.id === id);
    if (!findedItem) {
        res.json( { success: false, message: 'Item does not finded'} );
        return;
    }
    
    res.json( { success: true, content: findedItem.content, item: findedItem } )
})

itemRouter.get('/search', (req, res) => {
    const content = req.query.content;
    const findedItems = itemsData.data.filter(item => {
        if (item.content.toLowerCase().includes(content.toLowerCase())) {
            return item;
        }
        if (item.originalName && item.originalName.toLowerCase().includes(content.toLowerCase())) {
            return item;
        }
    });

    res.json({ success: true, items: findedItems });
})

itemRouter.get('/gettext', (req, res) => {
    const id = req.query.id;
    const findedItem = itemsData.data.find(item => item.id === id);
    if (!findedItem) {
        res.json( { success: false, message: 'Item does not finded'} );
        return;
    }

    res.json( { success: true, content: findedItem.content } )
})

itemRouter.get('/filter/:type', (req, res) => {
    const type = req.params.type;
    let filteredItems;
    if (type === 'all') {
        filteredItems = [...itemsData.data];
        res.json({ success: true, items: filteredItems });
        return;
    }

    filteredItems = itemsData.data.filter(item => item.type === type);

    if (!filteredItems.length) {
        res.json({ success: false, message: `There are no ${type}-type items` });
        return;
    }

    res.json({ success: true, items: filteredItems });
})

itemRouter.get('/download/:id', (req, res) => {
    const id = req.params.id;

    const findedItem = itemsData.data.find(item => item.id === id);
    if (!findedItem) {
        res.json( { success: false, message: 'Item does not finded'} );
        return;
    }

    const directoryPath = './public/media';
    const fileName = extractFileName(findedItem.content);
    const filePath = path.join(directoryPath, fileName);

    res.download(filePath, fileName, (err) => {
        if (err) {
          console.error('Error downloading file:', err);
          res.status(500).send('Error downloading file');
        } 
    });
})

itemRouter.post('/add/text', upload.none(), async (req, res) => {
    const { type, content } = req.body;
    const item = { content: content, type: type, id: v4() };
    
    itemsData.add(item);

    res.json({ success: 'Text added', itemData: item });
})

itemRouter.post('/add/image', upload.single('content'), async (req, res) => {
    const url = 'http://localhost:7070/media/' + req.file.filename;
    let id = v4();

    const item = { content: url, type: 'image', id: id };
    itemsData.add(item);
    
    res.json({ success: 'Image added', itemData: item });
})

itemRouter.post('/add/audio', upload.single('content'), async (req, res) => {
    const url = 'http://localhost:7070/media/' + req.file.filename;
    let id = v4();

    let originalName = req.file.originalname.replace('â\x80\x99', "'");
    const item = {
        content: url, 
        type: 'audio', 
        id: id, 
        originalName: originalName, 
        fileName: req.file.filename 
    };

    itemsData.add(item);
    res.json({ success: 'Audio added', itemData: item });
})

itemRouter.post('/add/video', upload.single('content'), async (req, res) => {
    const url = 'http://localhost:7070/media/' + req.file.filename;
    let id = v4();

    let originalName = req.file.originalname.replace('â\x80\x99', "'");
    const item = {
        content: url, 
        type: 'video', 
        id: id, 
        originalName: originalName, 
        fileName: req.file.filename 
    };

    itemsData.add(item);
    res.json({ success: 'Video added', itemData: item });
})

itemRouter.patch('/update/:id', async(req, res) => {
    const itemId = req.params.id;
    const itemToUpdate = itemsData.data.find(item => item.id === itemId);
    if (!itemToUpdate) {
        res.json({success: false, errorMessage: 'Cannot find item to update'})
    }

    Object.assign(itemToUpdate, req.body);
    res.json({success: true, item: itemToUpdate});
})

itemRouter.delete('/delete/:id', async(req, res) => {
    const id = req.params.id;
    const itemToDelete = itemsData.data.find(item => item.id === id);

    if (!itemToDelete) {
        res.json({success: false, errorMessage: 'Cannot find item to delete'})
    }

    const indexOfItem = itemsData.data.indexOf(itemToDelete);

    itemsData.data.splice(indexOfItem, 1);

    const directoryPath = './public/media';
    const fileName = extractFileName(itemToDelete.content);
    const filePath = path.join(directoryPath, fileName);

    unlink(filePath, (err) => {
        if (err) throw err;
        console.log(`File with path: ${filePath} was deleted`);
    }); 

    res.json({success: true, message: 'Item has been deleted successfully'})
})

export default itemRouter;