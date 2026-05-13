import {
  persistPlaceImage,
  readCachedDetails,
} from '../services/placeCache.service.js';

export const cachePlace = async (req, res, next) => {
  try {
    await persistPlaceImage(req.body);
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};
export const getCachedPlaceDetails = async (req, res, next) => {
  console.log('Getting Details from cache with id: ', req.body?.placeId);
  try {
    const { placeId } = req.body;
    const details = await readCachedDetails(placeId);
    console.log('Details: ', details, '\n\n\n');
    res.status(200).json({ details });
  } catch (err) {
    next(err);
  }
};
