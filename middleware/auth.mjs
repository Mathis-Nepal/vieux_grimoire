import jwt from 'jsonwebtoken';

const middleware = (req, res, next) => {
    try{
        console.log("middleware");
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
        const userId = decodedToken.userId;
        req.auth = {
            userId: userId
        };
        next();

    } catch (error) {
        console.log(error);
        res.status(401).json({ error: error | 'Requête non authentifiée !'});
    }
};

export default middleware;