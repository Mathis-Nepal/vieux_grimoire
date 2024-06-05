import { Schema, model } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const userSchema = Schema({
    email: { type: String, required: true, unique: true }, // adresse e-mail de l’utilisateur [unique]
    password: { type: String, required: true } // mot de passe haché de l’utilisateur
});
userSchema.plugin(uniqueValidator);
export default model('User', userSchema);
