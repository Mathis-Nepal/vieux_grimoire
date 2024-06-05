import mongoose from 'mongoose';

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };
const uri = `mongodb+srv://non:non@grimoire.8arsgaz.mongodb.net/myDatabaseName?retryWrites=true&w=majority`;

async function connectDb() {
  try {
    mongoose.connect(uri, clientOptions);
    console.log("Successfully connected to MongoDB!");
  } catch (error) {
    console.error("There was an error connecting to MongoDB: ", error);
  }
}
export default connectDb;