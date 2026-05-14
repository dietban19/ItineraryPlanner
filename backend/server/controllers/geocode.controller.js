import ApiLog from '../models/ApiLog.js';

async function logApiCall(apiName) {
  await ApiLog.findOneAndUpdate(
    { apiName },
    { $push: { calls: { calledAt: new Date() } } },
    { upsert: true },
  );
}

export const autocompleteDestination = async (req, res, next) => {
  try {
    const { text, limit = '8' } = req.query;

    if (!text?.trim()) {
      return res.status(400).json({ error: 'text query is required' });
    }

    const url = new URL('https://api.geoapify.com/v1/geocode/autocomplete');
    url.searchParams.set('text', text.trim());
    url.searchParams.set('limit', limit);
    url.searchParams.set('format', 'json');
    url.searchParams.set('apiKey', process.env.GEOAPIFY_KEY);

    await logApiCall('geoapify:autocomplete');
    const response = await fetch(url.toString());

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Geoapify API error ${response.status}: ${body}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    next(err);
  }
};
