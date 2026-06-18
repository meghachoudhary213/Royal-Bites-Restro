const EventPackage = require('../models/EventPackage');

const defaultEventPackages = [
  {
    name: 'Royal Wedding Package',
    category: 'Wedding',
    description: 'The ultimate fairytale experience on our sea-facing lawns. Includes premium catering, complete floral decor, bridal suite, stage set, and sound.',
    capacity: 500,
    price: 1500000,
    image: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=800&q=80',
    isActive: true
  },
  {
    name: 'Premium Wedding Package',
    category: 'Wedding',
    description: 'Elegant celebration in the grand ballroom. Includes standard decor, buffet dining by Royal Bites, guest seating, and stage setup.',
    capacity: 300,
    price: 800000,
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
    isActive: true
  },
  {
    name: 'Corporate Conference Package',
    category: 'Corporate',
    description: 'Outfitted with high-speed video conferencing suites, automated projector systems, executive seating, and connection to private pantry.',
    capacity: 50,
    price: 150000,
    image: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=800&q=80',
    isActive: true
  },
  {
    name: 'Birthday Celebration Package',
    category: 'Birthday',
    description: 'Vibrant birthday setup with balloon decorations, custom cake option, DJ system, and live food counters by Royal Bites.',
    capacity: 150,
    price: 250000,
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80',
    isActive: true
  },
  {
    name: 'Luxury Banquet Package',
    category: 'Conference',
    description: 'Grand gala dinners and award ceremonies. Features high-definition LED backdrops, customized seating styles, and multi-cuisine dining.',
    capacity: 400,
    price: 600000,
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
    isActive: true
  }
];

const seedEventPackages = async () => {
  try {
    const count = await EventPackage.countDocuments();
    if (count === 0) {
      await EventPackage.insertMany(defaultEventPackages);
      console.log('Successfully seeded default event packages in database.');
    }
  } catch (error) {
    console.error('Error seeding default event packages:', error.message);
  }
};

module.exports = { seedEventPackages };
