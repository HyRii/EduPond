// NEW FILE (Phase 4): HTTP boundary for instructor proposals/admin review.
const service = require("../services/proposal.service");

const createProposal = async (req, res, next) => {
  try {
    const proposal = await service.createProposal(req.user.id, req.body);
    res.status(201).json({ success: true, message: "Proposal created", data: { proposal } });
  } catch (error) { next(error); }
};

const updateProposal = async (req, res, next) => {
  try {
    const proposal = await service.updateProposal(req.params.id, req.user.id, req.body);
    res.json({ success: true, message: "Proposal updated", data: { proposal } });
  } catch (error) { next(error); }
};

const addSection = async (req, res, next) => {
  try {
    const section = await service.addProposalSection(req.params.id, req.user.id, req.body);
    res.status(201).json({ success: true, message: "Proposal section added", data: { section } });
  } catch (error) { next(error); }
};

const addLesson = async (req, res, next) => {
  try {
    const lesson = await service.addProposalLesson(
      req.params.id, req.params.sectionId, req.user.id, req.body
    );
    res.status(201).json({ success: true, message: "Proposal lesson added", data: { lesson } });
  } catch (error) { next(error); }
};

const submitProposal = async (req, res, next) => {
  try {
    const proposal = await service.submitProposal(req.params.id, req.user.id);
    res.json({ success: true, message: "Proposal submitted for review", data: { proposal } });
  } catch (error) { next(error); }
};

const getMyProposals = async (req, res, next) => {
  try {
    const proposals = await service.getMyProposals(req.user.id);
    res.json({ success: true, message: "Proposals retrieved", data: { proposals } });
  } catch (error) { next(error); }
};

const listProposals = async (req, res, next) => {
  try {
    const proposals = await service.listProposals(req.query.status || undefined);
    res.json({ success: true, message: "Proposals retrieved", data: { proposals } });
  } catch (error) { next(error); }
};

const getMyProposalDetail = async (req, res, next) => {
  try {
    const proposal = await service.getMyProposalDetail(req.params.id, req.user.id);
    res.json({ success: true, message: "Proposal detail retrieved", data: { proposal } });
  } catch (error) { next(error); }
};

const getProposalDetail = async (req, res, next) => {
  try {
    const proposal = await service.getProposalDetail(req.params.id);
    res.json({ success: true, message: "Proposal detail retrieved", data: { proposal } });
  } catch (error) { next(error); }
};

const reviewProposal = async (req, res, next) => {
  try {
    const proposal = await service.reviewProposal(
      req.params.id, req.user.id, req.body.status, req.body.adminNote
    );
    res.json({ success: true, message: "Proposal reviewed", data: { proposal } });
  } catch (error) { next(error); }
};

const convertProposal = async (req, res, next) => {
  try {
    const proposal = await service.convertApprovedProposalToCourse(
      req.params.id, req.user.id
    );
    res.status(201).json({
      success: true,
      message: "Approved proposal converted to a published course",
      data: { proposal },
    });
  } catch (error) { next(error); }
};

module.exports = {
  createProposal, updateProposal, addSection, addLesson, submitProposal,
  getMyProposals, getMyProposalDetail, listProposals, getProposalDetail, reviewProposal, convertProposal,
};
