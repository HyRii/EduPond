// NEW FILE (Phase 4): HTTP boundary for Ask Course.
const service = require("../services/courseRequest.service");

const createRequest = async (req, res, next) => {
  try {
    const request = await service.createRequest({
      studentId: req.user.id,
      categoryId: req.body.categoryId,
      courseName: req.body.courseName,
      reason: req.body.reason,
    });
    return res.status(201).json({ success: true, message: "Course request created", data: { request } });
  } catch (error) { next(error); }
};

const getMyRequests = async (req, res, next) => {
  try {
    const requests = await service.getMyRequests(req.user.id);
    return res.status(200).json({ success: true, message: "Requests retrieved", data: { requests } });
  } catch (error) { next(error); }
};

const listRequests = async (req, res, next) => {
  try {
    const requests = await service.listAllRequests({
      status: req.query.status || undefined,
      categoryId: req.query.categoryId || undefined,
    });
    return res.status(200).json({ success: true, message: "Requests retrieved", data: { requests } });
  } catch (error) { next(error); }
};

const listAvailableRequests = async (req, res, next) => {
  try {
    const requests = await service.listAllRequests({ status: "APPROVED" });
    return res.status(200).json({ success: true, message: "Approved requests retrieved", data: { requests } });
  } catch (error) { next(error); }
};

const getDemand = async (req, res, next) => {
  try {
    const demand = await service.getAggregatedDemand();
    return res.status(200).json({ success: true, message: "Demand retrieved", data: { demand } });
  } catch (error) { next(error); }
};

const reviewRequest = async (req, res, next) => {
  try {
    const request = await service.reviewRequest(
      req.params.id,
      req.user.id,
      req.body.status,
      req.body.adminNote
    );
    return res.status(200).json({ success: true, message: "Request reviewed", data: { request } });
  } catch (error) { next(error); }
};

module.exports = {
  createRequest,
  getMyRequests,
  listRequests,
  listAvailableRequests,
  getDemand,
  reviewRequest,
};
