// Script to update past paper subjects from biology to business/economics
// Run with: node server/scripts/update-paper-subjects.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function updateSubjects() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('pastpapers');

        // Update all papers with subject "Biology" to "business"
        const result = await collection.updateMany(
            { subject: { $regex: /^biology$/i } },
            { $set: { subject: 'business' } }
        );

        console.log(`Updated ${result.modifiedCount} papers from "biology" to "business"`);

        // Show current subjects
        const subjects = await collection.distinct('subject');
        console.log('Current subjects in database:', subjects);

        await mongoose.disconnect();
        console.log('Done!');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

updateSubjects();
