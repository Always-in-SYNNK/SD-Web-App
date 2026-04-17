import {
  getDistinctLocations,
  getDistinctFields,
  getDistinctNqfLevels,
  getFilteredOpportunitiesAndQualifications,
} from '../services/opportunityService.js';

export async function fetchLocations(req, res, next) {
  try {
    const locations = await getDistinctLocations();
    res.status(200).json({ success: true, data: locations });
  } catch (error) {
    next(error);
  }
}

export async function fetchFields(req, res, next) {
  try {
    const fields = await getDistinctFields();
    res.status(200).json({ success: true, data: fields});
  } catch (error) {
    next(error);
  }
}

export async function fetchNqfLevels(req, res, next) {
  try {
    const nqfLevels = await getDistinctNqfLevels();
    res.status(200).json({ success: true, data: nqfLevels});
  } catch (error) {
    next(error);
  }
}

export async function fetchOpportunities(req, res, next) {
  try {
    const result = await getFilteredOpportunitiesAndQualifications({
      field: req.query.field,
      location: req.query.location,
      nqfLevel: req.query.nqfLevel,
      search: req.query.search,
      page: req.query.page,
      limit: req.query.limit,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}
