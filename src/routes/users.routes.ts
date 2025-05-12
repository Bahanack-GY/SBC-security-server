import { Router } from 'express';
import { createAdmin, createLink, deleteLink, editLink, getLink, getLinks, loginAdmin } from '../controllers/users.controllers';

const router = Router();

router.post('/admin/create', createAdmin);
router.post('/admin/login', loginAdmin);
router.post('/create-link', createLink);
router.put('/edit-link/:id', editLink);
router.delete('/delete-link/:id', deleteLink);
router.get('/get-links', getLinks);
router.get('/get-link/:code/:phone', getLink);
export default router;



