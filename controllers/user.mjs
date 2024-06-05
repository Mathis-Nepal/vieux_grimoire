import bcrypt from 'bcrypt';
import User from '../models/user.mjs';
import jwt from 'jsonwebtoken';


export function signUp(req, res, next) {
    console.log(req.body);
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save()
                .then(() => res.status(201).json({ message: 'User added!' }))
                .catch(error =>{
                    console.log(error);
                     res.status(400).json({ error })
                    });
        })
        .catch(error => res.status(500).json({ error }));
}

export function login(req, res, next) {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: 'Email or password are not correct'});
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
return res.status(401).json({ message: 'Email or password are not correct' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            'RANDOM_TOKEN_SECRET',
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
 };