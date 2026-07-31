import { Note } from "../models/Note.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

export const getNotes = asyncHandler(async (req, res) => {
  const { lead, contact, search } = req.query;
  const filter = { owner: req.user._id };

  if (lead) filter.lead = lead;
  if (contact) filter.contact = contact;
  if (search) filter.content = new RegExp(search, "i");

  const notes = await Note.find(filter)
    .sort({ pinned: -1, createdAt: -1 })
    .populate("lead", "name company")
    .populate("contact", "name company");

  res.json({
    success: true,
    count: notes.length,
    notes,
  });
});