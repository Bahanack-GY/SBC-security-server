import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Admin, { IAdmin } from '../models/admin';
import User from '../models/users';
import whatsappClient from '../services/whatsapp.client';

interface AdminResponse extends Omit<IAdmin, 'password'> {
    password?: string;
}

export const createAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password } = req.body;
        
        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            res.status(400).json({ message: 'Admin with this email already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = await Admin.create({ name, email, password: hashedPassword });
        
        // Remove password from response
        const adminResponse = admin.toObject() as AdminResponse;
        delete adminResponse.password;
        
        res.status(201).json(adminResponse);
    } catch (error) {
        res.status(500).json({ message: 'Error creating admin', error: (error as Error).message });
    }
};

export const loginAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        
        const admin = await Admin.findOne({ email });
        if (!admin) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        // Create JWT token
        const token = jwt.sign(
            { id: admin._id, email: admin.email },
            "sbc1324",
            { expiresIn: '1d' }
        );

        // Remove password from response
        const adminResponse = admin.toObject() as AdminResponse;
        delete adminResponse.password;
        res.status(200).json({ admin: adminResponse, token });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: (error as Error).message });
    }
};

export const createLink = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, phone, code } = req.body;
        const existingUser = await User.findOne({ code });
        if (existingUser) {
            res.status(400).json({ message: 'Un lien avec ce code existe deja' });
            return;
        }
        const link = `https://www.canal-de-vente.sniperbuisnesscenter.com/${code}/${phone}`;
        const user = await User.create({ name, phone, code, link });

        
        const waPhone = String(phone).replace(/\D/g, ''); // Remove non-digits
        const waId = waPhone.endsWith('@c.us') ? waPhone : `${waPhone}@c.us`;

        
        const customMessage = 'Bonjour, chere membre de la famille SBC, ' + name.toUpperCase() + ', voici le lien personnalisé de votre canal de vente: ';
        const endMessage = 'Merci pour votre confiance. Ensemble contre tous!';
        const fullMessage = `${customMessage}${link} ${endMessage}`;

   
        await whatsappClient.sendMessage(waId, fullMessage);

        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error creating link', error: (error as Error).message });
    }
}

export const editLink = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, phone, code } = req.body;
        const { id } = req.params;
        const link = `https://www.canal-de-vente.sniperbuisnesscenter.com/${code}/${phone}`
        const user = await User.findByIdAndUpdate(id, { name, phone, code, link });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error editing link', error: (error as Error).message });
    }
}

export const deleteLink = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error deleting link', error: (error as Error).message });
    }
}

export const getLinks = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error getting links', error: (error as Error).message });
    }
}

export const getLink = async (req: Request, res: Response): Promise<void> => {
    try {
        const { code, phone } = req.params;

        const user = await User.findOne({ code: { $regex: new RegExp(`^${code}$`, 'i') } });
        if (!user) {
            res.status(404).json({ message: 'Lien non trouvé' });
            return;
        }
        console.log(user);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error getting link', error: (error as Error).message });
    }
}






