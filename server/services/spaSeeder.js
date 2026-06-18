const SpaService = require('../models/SpaService');

const defaultSpaServices = [
  {
    name: 'Aroma Therapy Massage',
    category: 'Massages',
    duration: '60 Mins',
    price: 4500,
    description: 'A gentle therapy using selected therapeutic essential oils to promote complete body relaxation and mental ease.',
    image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80',
    isActive: true
  },
  {
    name: 'Deep Tissue Massage',
    category: 'Massages',
    duration: '75 Mins',
    price: 5000,
    description: 'Focused pressure targeting deep muscle layers to release chronic tension, sports soreness, and physical fatigue.',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    isActive: true
  },
  {
    name: 'Couple Spa',
    category: 'Packages',
    duration: '90 Mins',
    price: 8500,
    description: 'Indulge in mutual relaxation with a side-by-side aromatherapy session, hot stone touch, and private herbal tea lounge access.',
    image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80',
    isActive: true
  },
  {
    name: 'Facial Glow Therapy',
    category: 'Skin Care',
    duration: '60 Mins',
    price: 3500,
    description: 'A nutrient-dense facial treatment designed to restore glow, hydrate deep dermal layers, and brighten skin appearance.',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80',
    isActive: true
  },
  {
    name: 'Ayurvedic Relaxation',
    category: 'Holistic',
    duration: '90 Mins',
    price: 6000,
    description: 'Traditional holistic ritual utilizing warm custom-blended herbal oils to balance body energy and relieve persistent mental stress.',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
    isActive: true
  },
  {
    name: 'Body Polish',
    category: 'Body Care',
    duration: '75 Mins',
    price: 5500,
    description: 'Exfoliating scrub with mineral salts followed by a light moisturizing wrap, leaving skin satin-smooth and fully hydrated.',
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80',
    isActive: true
  }
];

const seedSpaServices = async () => {
  try {
    const count = await SpaService.countDocuments();
    if (count === 0) {
      await SpaService.insertMany(defaultSpaServices);
      console.log('Successfully seeded default spa services in database.');
    }
  } catch (error) {
    console.error('Error seeding default spa services:', error.message);
  }
};

module.exports = { seedSpaServices };
