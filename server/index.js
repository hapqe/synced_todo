const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { createServer } = require('http');
const { json } = require('body-parser');
const Fingerprint = require('express-fingerprint');
const nodemailer = require('nodemailer');
const { env } = require('process');
const { v4 } = require('uuid');

const app = express();
const server = createServer(app);
app.use(Fingerprint());

const jsonParser = json();

const address = 'http://localhost:3002'
// const address =  'https://todo.hapke.me';

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal server error');
});

const emailFingerprints = [];

const userData = [];

const verifyInfo = [];

app.post('/api/set', jsonParser, (req, res, next) => {
    let fingerprint = req.fingerprint.hash;

    if (Object.keys(emailFingerprints).includes(fingerprint)) {
        const mail = emailFingerprints[fingerprint];
        userData[mail] = req.body;
    }
    else {
        userData[fingerprint] = req.body;
    }


    res.send('suceess');
    next();
});

app.post('/api/mail', jsonParser, async (req, res, next) => {
    const fingerprint = req.fingerprint.hash;

    const transporter = nodemailer.createTransport({
        host: 'mail.spacemail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'hello@hapke.me',
            pass: env.EMAIL_PASSWORD,
        },
    });

    let uuid = v4();

    try {
        await transporter.sendMail({
            from: '"Konrad Hapke" <hello@hapke.me>',
            to: req.body.mail,
            subject: 'Verifiy for hapke.me todo app',
            html: `Click <a href="${address}/verify/${uuid}">here</a> to verify your email!`,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Invalid mail!');
        return;
    }

    verifyInfo[uuid] = {
        mail: req.body.mail,
        fingerprint,
    };

    setTimeout(() => {
        delete verifyInfo[uuid];
    }
        , 1000 * 60 * 5);

    res.send('suceess');
    next();
});

app.get('/api/get', (req, res, next) => {
    let fingerprint = req.fingerprint.hash;
    if (Object.keys(emailFingerprints).includes(fingerprint)) {
        res.send(
            {
                ...userData[emailFingerprints[fingerprint]],
                mail: emailFingerprints[fingerprint]
            }
        );
    }
    else {
        res.send(userData[fingerprint]);
    }

    next();
});

app.get('/verify/:id', (req, res, next) => {
    const id = req.params.id;

    if (!Object.keys(verifyInfo).includes(id)) {
        res.send('Invalid verify link');
        next();
        return;
    }

    res.send(
        `
            <head>
                <title>Thanks for verifying</title>
            </head>
            <body>
                <h1>Thanks for verifying</h1>
                <a href="${address}">Go back</a>
            </body>
            <style>
                body {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex-direction: column;
                    height: 100vh;
                    font-family: Arial, sans-serif;
                }
            </style>
        `
    );

    emailFingerprints[verifyInfo[id].fingerprint] = verifyInfo[id].mail;

    const currentData = userData[verifyInfo[id].fingerprint];
    const mailData = userData[verifyInfo[id].mail];

    userData[verifyInfo[id].mail] = {
        doing: [...currentData?.doing ?? [], ...mailData?.doing ?? []],
        done: [...currentData?.done ?? [], ...mailData?.done ?? []],
    }

    delete verifyInfo[id];

    next();
});

app.use('/', createProxyMiddleware({ target: 'http://localhost:8002', ws: true }));

server.listen(3002, () => {
    console.log('Server is running on port 3oo2');
});