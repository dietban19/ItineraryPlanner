import { getPrayerTimesForDestination } from '../services/prayer.service.js';

export const getPrayerTimes = async (req, res, next) => {
  try {
    const { destination, method } = req.query;

    if (!destination || !destination.trim()) {
      return res
        .status(400)
        .json({ error: 'destination query param is required.' });
    }

    const parsedMethod = method ? parseInt(method, 10) : 2;
    if (isNaN(parsedMethod)) {
      return res.status(400).json({ error: 'method must be a valid integer.' });
    }

    const prayerTimes = await getPrayerTimesForDestination(
      destination.trim(),
      parsedMethod,
    );
    res.json({ prayerTimes });
  } catch (err) {
    next(err);
  }
};
