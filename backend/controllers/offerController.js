const Offer = require("../models/offer");

// @route   GET /api/offers
// @access  Public
// Search, filter, sort, paginate published offers
const getAllOffers = async (req, res) => {
  try {
    const {
      search,
      internshipType,
      location,
      workType,
      domain,
      educationLevel,
      minSalary,
      maxSalary,
      page = 1,
      limit = 10,
      sort = "newest",
    } = req.query;

    const filter = { status: "published" };

    if (search) {
      filter.$or = [
        { jobTitle: { $regex: search, $options: "i" } },
        { domain: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { requiredSkills: { $elemMatch: { $regex: search, $options: "i" } } },
      ];
    }

    if (internshipType && internshipType !== "all") {
      filter.internshipType = internshipType;
    }

    if (location) {
      if (location.toLowerCase() === "remote") {
        filter.workType = "remote";
      } else {
        filter.location = { $regex: location, $options: "i" };
      }
    }

    if (workType) {
      filter.workType = workType;
    }

    if (domain) {
      filter.domain = { $regex: domain, $options: "i" };
    }

    if (educationLevel) {
      filter.educationLevel = educationLevel;
    }

    if (minSalary || maxSalary) {
      filter.salaryMin = {};
      if (minSalary) filter.salaryMin.$gte = Number(minSalary);
      if (maxSalary) filter.salaryMin.$lte = Number(maxSalary);
    }

    let sortOption = {};
    if (sort === "newest") sortOption = { createdAt: -1 };
    else if (sort === "oldest") sortOption = { createdAt: 1 };
    else if (sort === "deadline") sortOption = { applicationDeadline: 1 };

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

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
    console.error('GET ALL OFFERS ERROR:', err);
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
    console.error('GET ALL OFFERS ADMIN ERROR:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   GET /api/offers/company/my
// @access  Private (Company)
const getMyOffers = async (req, res) => {
  try {
    console.log('=== GET MY OFFERS DEBUG ===');
    console.log('req.user:', req.user);
    console.log('req.user.id:', req.user && req.user.id);
    
    const offers = await Offer.find({ company: req.user.id })
      .sort({ createdAt: -1 });
    
    console.log('Found offers:', offers.length);
    res.status(200).json(offers);
  } catch (err) {
    console.error('GET MY OFFERS ERROR:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   GET /api/offers/domains
// @access  Public
const getDomains = async (req, res) => {
  try {
    const domains = await Offer.distinct("domain", { status: "published" });
    res.status(200).json(domains);
  } catch (err) {
    console.error('GET DOMAINS ERROR:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   GET /api/offers/locations
// @access  Public
const getLocations = async (req, res) => {
  try {
    const locations = await Offer.distinct("location", { status: "published" });
    res.status(200).json(locations);
  } catch (err) {
    console.error('GET LOCATIONS ERROR:', err);
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
    console.error('GET OFFER BY ID ERROR:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   POST /api/offers
// @access  Private (Company only)
const createOffer = async (req, res) => {
  try {
    console.log('=== CREATE OFFER DEBUG ===');
    console.log('1. req.user:', req.user);
    console.log('2. req.user.id:', req.user && req.user.id);
    console.log('3. req.body:', JSON.stringify(req.body, null, 2));

    if (!req.user || !req.user.id) {
      console.error('ERROR: req.user or req.user.id is missing!');
      return res.status(401).json({ message: "Not authenticated - user data missing" });
    }

    const {
      jobTitle, department, location, workType, duration,
      salary, numberOfPositions, startDate, applicationDeadline,
      educationLevel, experienceLevel, requiredSkills,
      additionalRequirements, description, keyResponsibilities,
      internshipType, domain, status
    } = req.body;

    console.log('4. Destructured fields:', { 
      jobTitle: jobTitle, 
      department: department, 
      location: location, 
      internshipType: internshipType, 
      workType: workType 
    });

    if (!jobTitle || !department || !location || !duration) {
      console.error('ERROR: Missing required fields');
      return res.status(400).json({ 
        message: "Missing required fields: jobTitle, department, location, duration" 
      });
    }

    const assignedStatus = status === "draft" ? "draft" : "pending";
    console.log('5. assignedStatus:', assignedStatus);

    let skillsArray = [];
    if (requiredSkills) {
      if (Array.isArray(requiredSkills)) {
        skillsArray = requiredSkills;
      } else if (typeof requiredSkills === 'string') {
        skillsArray = requiredSkills.split(',').map(function(s) { return s.trim(); }).filter(Boolean);
      }
    }

    const offerData = {
      jobTitle: jobTitle.trim(),
      department: department.trim(),
      location: location.trim(),
      workType: workType || 'on-site',
      duration: duration.trim(),
      salary: salary || undefined,
      numberOfPositions: Number(numberOfPositions) || 1,
      startDate: startDate || undefined,
      applicationDeadline: applicationDeadline || undefined,
      educationLevel: educationLevel || 'bachelor',
      experienceLevel: experienceLevel || 'entry level',
      requiredSkills: skillsArray,
      additionalRequirements: additionalRequirements || '',
      description: description || '',
      keyResponsibilities: keyResponsibilities || '',
      internshipType: internshipType || 'PFE',
      domain: domain || '',
      company: req.user.id,
      status: assignedStatus,
    };
    
    console.log('6. offerData:', JSON.stringify(offerData, null, 2));

    const offer = new Offer(offerData);
    console.log('7. Offer instance created, validating...');

    const validationError = offer.validateSync();
    if (validationError) {
      console.error('VALIDATION ERROR:', validationError);
      return res.status(400).json({ 
        message: "Validation error", 
        errors: validationError.errors 
      });
    }

    await offer.save();
    console.log('8. Offer saved successfully! ID:', offer._id);

    const message = assignedStatus === "draft"
      ? "Offer saved as draft."
      : "Offer submitted for admin approval.";

    res.status(201).json({ message: message, offer: offer });
  } catch (err) {
    console.error('!!! CREATE OFFER ERROR !!!');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: err.errors 
      });
    }
    
    if (err.name === 'CastError') {
      return res.status(400).json({ 
        message: "Invalid data format", 
        error: err.message 
      });
    }
    
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
    console.error('UPDATE OFFER ERROR:', err);
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
    console.error('DELETE OFFER ERROR:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   PUT /api/offers/:id/status
// @access  Private (Admin only)
const updateOfferStatus = async (req, res) => {
  try {
    console.log('=== UPDATE OFFER STATUS DEBUG ===');
    console.log('User:', req.user);
    console.log('Offer ID:', req.params.id);
    console.log('Body:', req.body);

    const { status } = req.body;
    const validStatuses = ["published", "rejected", "closed"];
    
    if (!validStatuses.includes(status)) {
      console.error('Invalid status:', status);
      return res.status(400).json({ message: "Invalid status value. Must be: published, rejected, or closed" });
    }

    const offer = await Offer.findByIdAndUpdate(
      req.params.id, { status: status }, { new: true }
    );
    
    if (!offer) {
      console.error('Offer not found:', req.params.id);
      return res.status(404).json({ message: "Offer not found" });
    }

    console.log('Offer updated successfully:', offer._id, 'new status:', offer.status);
    res.status(200).json({ message: "Offer " + status + " successfully.", offer: offer });
  } catch (err) {
    console.error('UPDATE OFFER STATUS ERROR:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  getAllOffers: getAllOffers,
  getAllOffersAdmin: getAllOffersAdmin,
  getMyOffers: getMyOffers,
  getDomains: getDomains,
  getLocations: getLocations,
  getOfferById: getOfferById,
  createOffer: createOffer,
  updateOffer: updateOffer,
  deleteOffer: deleteOffer,
  updateOfferStatus: updateOfferStatus,
};