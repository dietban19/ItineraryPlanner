import express from 'express';
import {
  getGooglePlaceImage,
  searchGooglePlaces,
  getGooglePlaceDetails,
} from '../services/googlePlaceImage.service.js';

const router = express.Router();

router.get('/place-image', async (req, res) => {
  try {
    const { placeName, destination, type } = req.query;

    if (!placeName && !destination) {
      return res.status(400).json({
        error: 'placeName or destination is required',
      });
    }

    const image = await getGooglePlaceImage({
      placeName,
      destination,
      type,
      maxWidthPx: 900,
    });

    res.json({ image });
  } catch (error) {
    console.error('Google place image error:', error);

    res.status(500).json({
      error: 'Failed to fetch Google place image',
    });
  }
});

router.get('/places/search', async (req, res) => {
  try {
    const { query, destination, type, maxResults } = req.query;
    if (!destination) {
      return res.status(400).json({ error: 'destination is required' });
    }

    const places = await searchGooglePlaces({
      query: query ?? '',
      destination,
      type: type ?? 'activity',
      maxResults: Math.min(maxResults ? parseInt(maxResults, 10) : 8, 10),
    });

    res.json({ places });
  } catch (error) {
    console.error('Google places search error:', error);
    res.status(500).json({ error: 'Failed to search places' });
  }
});

router.get('/places/details', async (req, res) => {
  try {
    const { placeId } = req.query;
    if (!placeId) {
      return res.status(400).json({ error: 'placeId is required' });
    }
    const details = await getGooglePlaceDetails({ placeId });
    res.json({ details });
  } catch (error) {
    console.error('Place details error:', error);
    res.status(500).json({ error: 'Failed to fetch place details' });
  }
});

export default router;
