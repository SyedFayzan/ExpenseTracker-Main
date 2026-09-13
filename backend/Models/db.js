const mongoose = require('mongoose');

const mongo_url = process.env.MONGODB_CONN;

if (!mongo_url) {
    console.error("❌ MONGODB_CONN environment variable is missing!");
}

const connectDB = async () => {
    try {
        await mongoose.connect(mongo_url, {
            serverSelectionTimeoutMS: 15000,
            socketTimeoutMS: 45000,
        });
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error('MongoDB Connection Error: ', err.message || err);
    }
};

connectDB();

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected, attempting reconnect...');
    connectDB();
});

module.exports = mongoose;