const mongoose = require('mongoose');
const Offer = require('./models/offer');
const User = require('./models/User');
const bcrypt = require('bcrypt');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB for seeding...');

    // Create Super Admin user first
    const superAdminExists = await User.findOne({ role: 'super_admin' });
    if (!superAdminExists) {
      console.log('Creating super admin user...');
      const superAdminPass = await bcrypt.hash('superadmin123', 12);
      const superAdmin = new User({
        name: 'Super Admin',
        email: 'superadmin@stag.io',
        password: superAdminPass,
        role: 'super_admin',
        isApproved: true
      });
      await superAdmin.save();
      console.log('Super Admin created! Email: superadmin@stag.io | Password: superadmin123');
    }

    // Sample companies
    const companyUsers = await User.find({ role: 'company', isApproved: true });
    if (companyUsers.length === 0) {
      console.log('Creating sample approved company...');
      const companyPass = await bcrypt.hash('company123', 12);
      const company = new User({
        name: 'Tech Corp',
        email: 'company@techcorp.com',
        password: companyPass,
        role: 'company',
        isApproved: true
      });
      await company.save();
    }

    // Create sample admin user
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      console.log('Creating admin user...');
      const adminPass = await bcrypt.hash('admin123', 12);
      const admin = new User({
        name: 'Admin User',
        email: 'admin@stag.io',
        password: adminPass,
        role: 'admin',
        isApproved: true
      });
      await admin.save();
      console.log('Admin created! Email: admin@stag.io | Password: admin123');
    }

    // Create sample student user
    const studentExists = await User.findOne({ role: 'student' });
    if (!studentExists) {
      console.log('Creating sample student...');
      const studentPass = await bcrypt.hash('student123', 12);
      const student = new User({
        name: 'John Doe',
        email: 'student@example.com',
        password: studentPass,
        role: 'student',
        isApproved: true,
        institution: 'Tech University',
        major: 'Computer Science'
      });
      await student.save();
      console.log('Student created! Email: student@example.com | Password: student123');
    }

    // Sample offers
    const offers = await Offer.find({ status: 'published' });
    if (offers.length === 0) {
      console.log('Creating sample published offers...');
      const company = await User.findOne({ role: 'company', isApproved: true });
      if (company) {
        await Offer.insertMany([
          {
            jobTitle: 'Frontend Developer Intern',
            department: 'IT',
            location: 'Remote',
            workType: 'remote',
            duration: '6 months',
            salary: '€800/month',
            salaryMin: 800,
            numberOfPositions: 3,
            startDate: new Date('2024-06-01'),
            applicationDeadline: new Date('2024-05-15'),
            educationLevel: 'bachelor',
            experienceLevel: 'entry level',
            requiredSkills: ['React', 'JavaScript', 'Tailwind CSS'],
            description: 'Build modern web apps with React.',
            keyResponsibilities: 'Develop UI components',
            internshipType: 'PFE',
            domain: 'Web Development',
            company: company._id,
            status: 'published'
          },
          {
            jobTitle: 'Data Science Intern',
            department: 'Data',
            location: 'Casablanca',
            workType: 'on-site',
            duration: '3 months',
            salary: '€600/month',
            salaryMin: 600,
            numberOfPositions: 2,
            startDate: new Date('2024-07-01'),
            applicationDeadline: new Date('2024-06-01'),
            educationLevel: 'master',
            experienceLevel: 'entry level',
            requiredSkills: ['Python', 'Pandas', 'Machine Learning'],
            description: 'Work on data analysis projects.',
            keyResponsibilities: 'Clean and analyze data',
            internshipType: 'seasonal',
            domain: 'Data Science',
            company: company._id,
            status: 'published'
          }
        ]);
        console.log('Sample offers created!');
      }
    }

    console.log('Seeding complete!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });

