import { getWeatherForDestination } from '../services/weather.service.js';

export const getWeather = async (req, res, next) => {
  try {
    const { destination } = req.query;

    if (!destination || !destination.trim()) {
      return res
        .status(400)
        .json({ error: 'destination query param is required.' });
    }

    const weather = await getWeatherForDestination(destination.trim());
    res.json({ weather });
  } catch (err) {
    next(err);
  }
};
