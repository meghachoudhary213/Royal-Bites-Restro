const Room = require('../models/Room');

const defaultRooms = [
  // Deluxe Rooms
  {
    roomNumber: '101',
    roomType: 'Deluxe Room',
    status: 'Available',
    price: 18000,
    bed: 'Imperial King & Twin Beds',
    capacity: 'Up to 4 Guests',
    size: '110 m²',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
    description: 'Nestled amidst lush botanical landscaping, this sanctuary features a private garden, plunge pool, outdoor rain shower, and a beautiful shaded sun deck.',
    amenities: ['Private Plunge Pool', 'Outdoor Bath', 'Botanical Garden View', 'Sun Loungers', 'Hammock', 'In-villa Dining Setup']
  },
  {
    roomNumber: '102',
    roomType: 'Deluxe Room',
    status: 'Available',
    price: 18000,
    bed: 'Imperial King & Twin Beds',
    capacity: 'Up to 4 Guests',
    size: '110 m²',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
    description: 'Nestled amidst lush botanical landscaping, this sanctuary features a private garden, plunge pool, outdoor rain shower, and a beautiful shaded sun deck.',
    amenities: ['Private Plunge Pool', 'Outdoor Bath', 'Botanical Garden View', 'Sun Loungers', 'Hammock', 'In-villa Dining Setup']
  },
  {
    roomNumber: '103',
    roomType: 'Deluxe Room',
    status: 'Maintenance',
    price: 18000,
    bed: 'Imperial King & Twin Beds',
    capacity: 'Up to 4 Guests',
    size: '110 m²',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
    description: 'Nestled amidst lush botanical landscaping, this sanctuary features a private garden, plunge pool, outdoor rain shower, and a beautiful shaded sun deck.',
    amenities: ['Private Plunge Pool', 'Outdoor Bath', 'Botanical Garden View', 'Sun Loungers', 'Hammock', 'In-villa Dining Setup']
  },
  {
    roomNumber: '104',
    roomType: 'Deluxe Room',
    status: 'Available',
    price: 18000,
    bed: 'Imperial King & Twin Beds',
    capacity: 'Up to 4 Guests',
    size: '110 m²',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
    description: 'Nestled amidst lush botanical landscaping, this sanctuary features a private garden, plunge pool, outdoor rain shower, and a beautiful shaded sun deck.',
    amenities: ['Private Plunge Pool', 'Outdoor Bath', 'Botanical Garden View', 'Sun Loungers', 'Hammock', 'In-villa Dining Setup']
  },
  {
    roomNumber: '105',
    roomType: 'Deluxe Room',
    status: 'Cleaning',
    price: 18000,
    bed: 'Imperial King & Twin Beds',
    capacity: 'Up to 4 Guests',
    size: '110 m²',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
    description: 'Nestled amidst lush botanical landscaping, this sanctuary features a private garden, plunge pool, outdoor rain shower, and a beautiful shaded sun deck.',
    amenities: ['Private Plunge Pool', 'Outdoor Bath', 'Botanical Garden View', 'Sun Loungers', 'Hammock', 'In-villa Dining Setup']
  },

  // Executive Rooms
  {
    roomNumber: '201',
    roomType: 'Executive Room',
    status: 'Available',
    price: 25000,
    bed: 'Royal King Bed',
    capacity: 'Up to 2 Adults',
    size: '75 m²',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    description: 'Designed for discerning guests, combining contemporary business convenience with upscale comfort. Enjoy exclusive Club Lounge access, evening cocktails, and private check-in.',
    amenities: ['Club Lounge Access', 'Premium Workspace', 'Espresso Machine', 'Rain Shower', 'Free Airport Transfer', 'L\'Occitane Amenities']
  },
  {
    roomNumber: '202',
    roomType: 'Executive Room',
    status: 'Available',
    price: 25000,
    bed: 'Royal King Bed',
    capacity: 'Up to 2 Adults',
    size: '75 m²',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    description: 'Designed for discerning guests, combining contemporary business convenience with upscale comfort. Enjoy exclusive Club Lounge access, evening cocktails, and private check-in.',
    amenities: ['Club Lounge Access', 'Premium Workspace', 'Espresso Machine', 'Rain Shower', 'Free Airport Transfer', 'L\'Occitane Amenities']
  },
  {
    roomNumber: '203',
    roomType: 'Executive Room',
    status: 'Available',
    price: 25000,
    bed: 'Royal King Bed',
    capacity: 'Up to 2 Adults',
    size: '75 m²',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    description: 'Designed for discerning guests, combining contemporary business convenience with upscale comfort. Enjoy exclusive Club Lounge access, evening cocktails, and private check-in.',
    amenities: ['Club Lounge Access', 'Premium Workspace', 'Espresso Machine', 'Rain Shower', 'Free Airport Transfer', 'L\'Occitane Amenities']
  },
  {
    roomNumber: '204',
    roomType: 'Executive Room',
    status: 'Available',
    price: 25000,
    bed: 'Royal King Bed',
    capacity: 'Up to 2 Adults',
    size: '75 m²',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    description: 'Designed for discerning guests, combining contemporary business convenience with upscale comfort. Enjoy exclusive Club Lounge access, evening cocktails, and private check-in.',
    amenities: ['Club Lounge Access', 'Premium Workspace', 'Espresso Machine', 'Rain Shower', 'Free Airport Transfer', 'L\'Occitane Amenities']
  },

  // Premium Suites
  {
    roomNumber: '301',
    roomType: 'Premium Suite',
    status: 'Available',
    price: 32000,
    bed: 'Imperial King Bed',
    capacity: 'Up to 3 Guests',
    size: '95 m²',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    description: 'Wake up to the gentle sound of waves. This suite offers a spacious glass-railed balcony overlooking the ocean, an integrated lounge area, and customized pillow menu.',
    amenities: ['Ocean Panoramic Balcony', 'Customized Pillow Menu', 'Spacious Lounge Area', 'Deep-soaking Tub', 'Sound System', 'Priority Spa Booking']
  },
  {
    roomNumber: '302',
    roomType: 'Premium Suite',
    status: 'Available',
    price: 32000,
    bed: 'Imperial King Bed',
    capacity: 'Up to 3 Guests',
    size: '95 m²',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    description: 'Wake up to the gentle sound of waves. This suite offers a spacious glass-railed balcony overlooking the ocean, an integrated lounge area, and customized pillow menu.',
    amenities: ['Ocean Panoramic Balcony', 'Customized Pillow Menu', 'Spacious Lounge Area', 'Deep-soaking Tub', 'Sound System', 'Priority Spa Booking']
  },
  {
    roomNumber: '303',
    roomType: 'Premium Suite',
    status: 'Available',
    price: 32000,
    bed: 'Imperial King Bed',
    capacity: 'Up to 3 Guests',
    size: '95 m²',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    description: 'Wake up to the gentle sound of waves. This suite offers a spacious glass-railed balcony overlooking the ocean, an integrated lounge area, and customized pillow menu.',
    amenities: ['Ocean Panoramic Balcony', 'Customized Pillow Menu', 'Spacious Lounge Area', 'Deep-soaking Tub', 'Sound System', 'Priority Spa Booking']
  },

  // Presidential Suites
  {
    roomNumber: '401',
    roomType: 'Presidential Suite',
    status: 'Available',
    price: 45000,
    bed: 'Imperial King Bed',
    capacity: 'Up to 3 Adults',
    size: '180 m²',
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
    description: 'Our crown jewel offering unmatched luxury. Features a private heated infinity pool, 24/7 personalized butler service, state-of-the-art automation, and panoramic Indian Ocean views.',
    amenities: ['Private Pool', '24/7 Personal Butler', 'Oceanfront Terrace', 'Wine Cellar', 'Marble Jacuzzi', 'Walk-in Wardrobe']
  },
  {
    roomNumber: '402',
    roomType: 'Presidential Suite',
    status: 'Available',
    price: 45000,
    bed: 'Imperial King Bed',
    capacity: 'Up to 3 Adults',
    size: '180 m²',
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
    description: 'Our crown jewel offering unmatched luxury. Features a private heated infinity pool, 24/7 personalized butler service, state-of-the-art automation, and panoramic Indian Ocean views.',
    amenities: ['Private Pool', '24/7 Personal Butler', 'Oceanfront Terrace', 'Wine Cellar', 'Marble Jacuzzi', 'Walk-in Wardrobe']
  }
];

const seedRooms = async () => {
  try {
    const count = await Room.countDocuments();
    if (count === 0) {
      await Room.insertMany(defaultRooms);
      console.log('Successfully seeded default rooms in database.');
    }
  } catch (error) {
    console.error('Error seeding default rooms:', error.message);
  }
};

module.exports = { seedRooms };
