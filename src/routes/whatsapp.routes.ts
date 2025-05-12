import { Router } from 'express';
import whatsappClient from '../services/whatsapp.client';

const router = Router();

router.get('/', (req, res) => {
    res.send("Hello World");
});

router.post('/sendMessage', async (req, res) => {
    try {
        await whatsappClient.sendMessage(req.body.phoneNumber, req.body.message);
        console.log(`Message sent to ${req.body.phoneNumber}: ${req.body.message}`);
        res.send("Message sent");
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

export default router;
