import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { chatHandler } from './routes/chat.js';
import { getProjects, searchProjects } from './routes/projects.js';
import { submitCitizenReport } from './routes/reports.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Routes
app.post('/api/agents/chat', chatHandler);
app.get('/api/projects', getProjects);
app.get('/api/projects/search', searchProjects);
app.post('/api/reports', submitCitizenReport);

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`INGEC Server running on port ${PORT}`);
});
