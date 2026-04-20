import {
  getDistinctLocations,
  getDistinctFields,
  getDistinctNqfLevels,
  getFilteredOpportunitiesAndQualifications,
  createOpportunity,
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

export async function publishOpportunity(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const data = req.body;

    const result = await createOpportunity({
      userId,
      data,
      status: "pending",
    });

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function saveDraft(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const data = req.body;

    const result = await createOpportunity({
      userId,
      data,
      status: "draft",
    });

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}