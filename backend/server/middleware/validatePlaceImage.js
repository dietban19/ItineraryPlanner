export const validatePlaceImage = (req, res, next) => {
  const { placeName, destination } = req.query;

  if (!placeName && !destination) {
    return res.status(400).json({
      error: 'placeName or destination is required',
    });
  }

  next();
};

export const validatePlaceSearch = (req, res, next) => {
  const { destination } = req.query;

  if (!destination) {
    return res.status(400).json({
      error: 'destination is required',
    });
  }

  next();
};

export const validatePlaceDetails = (req, res, next) => {
  console.log('\n\nGetting Place Details, Middleware');
  const { placeId } = req.query;
  if (!placeId) {
    return res.status(400).json({ error: 'placeId is required' });
  }
  next();
};
