import {
  getGooglePlaceDetails,
  getGooglePlaceImage,
  searchGooglePlaces,
} from '../services/googlePlaceImage.service.js';

export const getPlaceImage = async (req, res, next) => {
  try {
    const { placeName, destination, type } = req.query;

    const image = await getGooglePlaceImage({
      placeName,
      destination,
      type,
      maxWidthPx: 900,
    });

    res.json({ image });
  } catch (err) {
    next(err); // let your global errorHandler deal with it
  }
};

export const searchPlaces = async (req, res, next) => {
  try {
    const { query, destination, type, maxResults, pageToken } = req.query;

    const { results: places, nextPageToken } = await searchGooglePlaces({
      query: query ?? '',
      destination,
      type: type ?? 'activity',
      maxResults: Math.min(maxResults ? parseInt(maxResults, 10) : 8, 10),
      pageToken: pageToken ?? null,
    });

    res.json({ places, nextPageToken: nextPageToken ?? null });
  } catch (error) {
    next(error);
  }
};

export const getPlaceDetails = async (req, res, next) => {
  try {
    const { placeId } = req.query;

    const details = await getGooglePlaceDetails({ placeId });
    res.json({ details });
  } catch (error) {
    next(error);
  }
};
