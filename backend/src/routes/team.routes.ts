import express from 'express';
import Team from '../models/team.model';
import upload from '../middleware/upload';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, alias, type, level, other_name, logo } = req.body;
    const team = new Team({ name, alias, type, level, other_name, logo });
    await team.save();
    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ message: 'Error creating team', error });
  }
});

router.get('/', async (_req, res) => {
  try {
    const teams = await Team.find();
    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teams', error });
  }
});

router.post('/upload-logo', upload.single('logo'), (req, res) => {
  if (!req.file) {
    res.status(400).send('No file uploaded');
    return;
  }

  res.json({ logoUrl: (req.file as any).location });
});


export default router;
