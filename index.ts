
import express, { type Request, type Response } from 'express'
import fileUpload from 'express-fileupload'
import { v4 as uuidv4 } from 'uuid'

import * as path from "path"
import * as fs from 'fs'

import { config } from 'dotenv'
config()

const app = express()

app.use(fileUpload({
    limits: {
        fileSize: 25600 * 1024 // 20MB
    },
    abortOnLimit: true
}));

app.use('/files', express.static(path.join(__dirname, 'files'), {
    setHeaders: (res, path) => {
        res.set('Cache-Control', 'no-store')
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
        res.setHeader('Pragma', 'no-cache')
        res.setHeader('Expires', '0')
    }
}))

app.post('/v1/upload', (req, res) => {
    if (req.get('X-API-Key') !== process.env.API_KEY) {
        res.status(400).send({ res: "Nuh uh..." });
        return;
    }

    if (req.files && req.files.file) {
        const file = Array.isArray(req.files.file) ? req.files.file[0] : req.files.file;

        const extension = path.extname(file?.name as string);
        const uuid = uuidv4();

        file?.mv(path.join(__dirname, 'files', `${uuid}.${extension}`), (err) => {
            if (err) {
                res.status(400).send({ res: `Failed to save file` });
                return;
            }

            const dataFilePath = path.join(__dirname, 'data.json');
            let data: { filetypes: { [key: string]: number }, amountOfFiles: number } = {
                filetypes: {},
                amountOfFiles: 0
            };

            if (fs.existsSync(dataFilePath)) {
                const rawData = fs.readFileSync(dataFilePath, 'utf-8');
                data = JSON.parse(rawData);
            }

            data.filetypes[extension] = (data.filetypes[extension] || 0) + 1;
            data.amountOfFiles += 1;

            fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 4));
            res.status(200).send({ res: `${process.env.URL}/files/${uuid}.${extension}` });
        });

    } else {
        res.status(400).send({ res: "No files uploaded" });
    }
});

app.get('/v1/data', (req, res) => {
    const dataFilePath = path.join(__dirname, 'data.json');

    if (fs.existsSync(dataFilePath)) {
        const rawData = fs.readFileSync(dataFilePath, 'utf-8');
        const data = JSON.parse(rawData);
        res.status(200).send(data);
    } else {
        res.status(404).send({ res: "Data file not found" });
    }
});

app.get('/', (_req, res) => {
    res.redirect("https://github.com/Smiltent/storage-api")
})

app.listen(process.env.PORT, () => {
    console.log(`Server is running on 0.0.0.0:${process.env.PORT}`)
})