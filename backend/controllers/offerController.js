const Offer = require("../models/offer");

// @route   GET /api/offers
// @access  Public
// Search, filter, sort, paginate published offers
const getAllOffers = async (req, res) => {
  try {
    const {
      search,           // search by jobTitle, company name, skills
      internshipType,   // PFE, Seasonal, Part-time, Academic
      location,         // city or "remote"
      workType,         // on-site, remote, hybrid
      domain,           // Web Development, Data Science, etc.
      educationLevel,   // bachelor, master, phd
      minSalary,        // minimum salary
      maxSalary,        // maximum salary
      page = 1,         // pagination
      limit = 10,       // results per page
      sort = "newest",  // newest, oldest, deadline
    } = req.query;

    // Base filter - only published offers
    const filter = { status: "published" };

    // Search by keyword (jobTitle, domain, requiredSkills)
    if (search) {
      filter.$or = [
        { jobTitle: { $regex: search, $options: "i" } },
        { domain: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { requiredSkills: { $elemMatch: { $regex: search, $options: "i" } } },
      ];
    }

    // Filter by internship type
    if (internshipType && internshipType !== "all") {
      filter.internshipType = internshipType;
    }

    // Filter by location
    if (location) {
      if (location.toLowerCase() === "remote") {
        filter.workType = "remote";
      } else {
        filter.location = { $regex: location, $options: "i" };
      }
    }

    // Filter by work type
    if (workType) {
      filter.workType = workType;
    }

    // Filter by domain
    if (domain) {
      filter.domain = { $regex: domain, $options: "i" };
    }

    // Filter by education level
    if (educationLevel) {
      filter.educationLevel = educationLevel;
    }

    // Filter by salary range
    if (minSalary || maxSalary) {
      filter.salaryMin = {};
      if (minSalary) filter.salaryMin.$gte = Number(minSalary);
      if (maxSalary) filter.salaryMin.$lte = Number(maxSalary);
    }

    // Sort options
    let sortOption = {};
    if (sort === "newest") sortOption = { createdAt: -1 };
    else if (sort === "oldest") sortOption = { createdAt: 1 };
    else if (sort === "deadline") sortOption = { applicationDeadline: 1 };

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const total = await Offer.countDocuments(filter);
    const offers = await Offer.find(filter)
      .populate("company", "name email")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      hasNextPage: pageNum < Math.ceil(total / limitNum),
      hasPrevPage: pageNum > 1,
      offers,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   GET /api/offers/admin/all
// @access  Private (Admin only)
const getAllOffersAdmin = async (req, res) => {
  try {
    const offers = await Offer.find()
      .populate("company", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(offers);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   GET /api/offers/company/my
// @access  Private (Company)
const getMyOffers = async (req, res) => {
  try {
    const offers = await Offer.find({ company: req.user.id })
      .sort({ createdAt: -1 });
    res.status(200).json(offers);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   GET /api/offers/domains
// @access  Public - get all unique domains for filter
const getDomains = async (req, res) => {
  try {
    const domains = await Offer.distinct("domain", { status: "published" });
    res.status(200).json(domains);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   GET /api/offers/locations
// @access  Public - get all unique locations for filter
const getLocations = async (req, res) => {
  try {
    const locations = await Offer.distinct("location", { status: "published" });
    res.status(200).json(locations);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   GET /api/offers/:id
// @access  Public
const getOfferById = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id)
      .populate("company", "name email");

    if (!offer) return res.status(404).json({ message: "Offer not found" });

    res.status(200).json(offer);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   POST /api/offers
// @access  Private (Company only)
const createOffer = async (req, res) => {
  try {
    const {
      jobTitle, department, location, workType, duration,
      salary, numberOfPositions, startDate, applicationDeadline,
      educationLevel, experienceLevel, requiredSkills,
      additionalRequirements, description, keyResponsibilities,
      internshipType, domain, status
    } = req.body;

    const assignedStatus = status === "draft" ? "draft" : "pending";

    const offer = new Offer({
      jobTitle, department, location, workType, duration,
      salary, numberOfPositions, startDate, applicationDeadline,
      educationLevel, experienceLevel, requiredSkills,
      additionalRequirements, description, keyResponsibilities,
      internshipType, domain,
      company: req.user.id,
      status: assignedStatus,
    });

    await offer.save();

    const message = assignedStatus === "draft"
      ? "Offer saved as draft."
      : "Offer submitted for admin approval.";

    res.status(201).json({ message, offer });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   PUT /api/offers/:id
// @access  Private (Company owner only)
const updateOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: "Offer not found" });
    if (offer.company.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this offer" });
    }

    if (req.body.status === "published") req.body.status = "pending";

    const updatedOffer = await Offer.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );

    res.status(200).json({ message: "Offer updated successfully.", offer: updatedOffer });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   DELETE /api/offers/:id
// @access  Private (Company owner or Admin)
const deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: "Offer not found" });

    const isOwner = offer.company.toString() === req.user.id;
    const isAdmin = ["admin", "super_admin"].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to delete this offer" });
    }

    await offer.deleteOne();
    res.status(200).json({ message: "Offer deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   PUT /api/offers/:id/status
// @access  Private (Admin only)
const updateOfferStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["published", "rejected", "closed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const offer = await Offer.findByIdAndUpdate(
      req.params.id, { status }, { new: true }
    );
    if (!offer) return res.status(404).json({ message: "Offer not found" });

    res.status(200).json({ message: `Offer ${status} successfully.`, offer });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  getAllOffers,
  getAllOffersAdmin,
  getMyOffers,
  getDomains,
  getLocations,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
  updateOfferStatus,
};