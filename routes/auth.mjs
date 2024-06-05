import { Router } from 'express';
import { signUp, login } from '../controllers/user.mjs';

const auth = Router();

auth.post('/signup', signUp );
auth.post('/login', login );




export default auth;