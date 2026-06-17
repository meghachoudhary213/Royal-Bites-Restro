export const roomsData = [
  {
    id: "presidential-suite",
    name: "Presidential Infinity Suite",
    price: 45000,
    size: "180 m²",
    capacity: "Up to 3 Adults",
    bed: "Imperial King Bed",
    image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
    description: "Our crown jewel offering unmatched luxury. Features a private heated infinity pool, 24/7 personalized butler service, state-of-the-art automation, and panoramic Indian Ocean views.",
    amenities: ["Private Pool", "24/7 Personal Butler", "Oceanfront Terrace", "Wine Cellar", "Marble Jacuzzi", "Walk-in Wardrobe"],
    rating: 5.0,
    featured: true
  },
  {
    id: "royal-executive",
    name: "Royal Executive Room",
    price: 25000,
    size: "75 m²",
    capacity: "Up to 2 Adults",
    bed: "Royal King Bed",
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
    description: "Designed for discerning guests, combining contemporary business convenience with upscale comfort. Enjoy exclusive Club Lounge access, evening cocktails, and private check-in.",
    amenities: ["Club Lounge Access", "Premium Workspace", "Espresso Machine", "Rain Shower", "Free Airport Transfer", "L'Occitane Amenities"],
    rating: 4.9,
    featured: true
  },
  {
    id: "deluxe-garden-villa",
    name: "Deluxe Garden Sanctuary Villa",
    price: 18000,
    size: "110 m²",
    capacity: "Up to 4 Guests",
    bed: "Imperial King & Twin Beds",
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80",
    description: "Nestled amidst lush botanical landscaping, this sanctuary features a private garden, plunge pool, outdoor rain shower, and a beautiful shaded sun deck.",
    amenities: ["Private Plunge Pool", "Outdoor Bath", "Botanical Garden View", "Sun Loungers", "Hammock", "In-villa Dining Setup"],
    rating: 4.8,
    featured: true
  },
  {
    id: "superior-ocean-suite",
    name: "Superior Oceanfront Room",
    price: 32000,
    size: "95 m²",
    capacity: "Up to 3 Guests",
    bed: "Imperial King Bed",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
    description: "Wake up to the gentle sound of waves. This suite offers a spacious glass-railed balcony overlooking the ocean, an integrated lounge area, and customized pillow menu.",
    amenities: ["Ocean Panoramic Balcony", "Customized Pillow Menu", "Spacious Lounge Area", "Deep-soaking Tub", "Sound System", "Priority Spa Booking"],
    rating: 4.9,
    featured: false
  }
];

export const spaServices = [
  {
    id: "ayurvedic-ritual",
    name: "Royal Ayurvedic Rejuvenation",
    duration: "90 Mins",
    price: 7500,
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
    description: "A traditional holistic therapy using warm, custom-blended herbal oils designed to restore your doshas, improve circulation, and release mental tension."
  },
  {
    id: "deep-tissue",
    name: "Deep Tissue Harmony Massage",
    duration: "60 Mins",
    price: 5000,
    image: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80",
    description: "Focused pressure targeted at deep muscle layers to release chronic tension, sports soreness, and daily fatigue. Restores flexibility and alignment."
  },
  {
    id: "himalayan-salt",
    name: "Himalayan Salt Scrub & Stones",
    duration: "75 Mins",
    price: 6000,
    image: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80",
    description: "Exfoliation with mineral-rich Himalayan pink salt, followed by a warm massage using carved basalt stones to deeply ground and detoxify the body."
  },
  {
    id: "caviar-facial",
    name: "Luxury Caviar Anti-Aging Facial",
    duration: "60 Mins",
    price: 8500,
    image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80",
    description: "A decadent, nutrient-dense treatment utilizing pure caviar extracts to immediately plump, firm, and infuse youthful radiance into fatigued skin."
  }
];

export const eventsVenues = [
  {
    id: "grand-ballroom",
    name: "The Grand Empress Ballroom",
    capacity: "500 Guests",
    size: "600 m²",
    type: "Indoor / Banquet Hall",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80",
    description: "Our signature space featuring soaring 7-meter ceilings, crystal chandeliers, state-of-the-art smart acoustic paneling, and an elegant pre-function foyer."
  },
  {
    id: "royal-pavilion",
    name: "Royal Pavilion Ocean Lawn",
    capacity: "300 Guests",
    size: "800 m²",
    type: "Outdoor / Oceanfront Garden",
    image: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=800&q=80",
    description: "A pristine garden lawn located at the edge of the resort cliffs, offering panoramic sunset views. The ultimate dreamy spot for luxury weddings and gala dinners."
  },
  {
    id: "majestic-boardroom",
    name: "Majestic Executive Suite Boardroom",
    capacity: "25 Guests",
    size: "90 m²",
    type: "Indoor / Corporate Meeting",
    image: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=800&q=80",
    description: "Outfitted with high-speed video conferencing suites, an automated screen system, plush leather seating, and a private connecting pantry for refreshments."
  }
];

export const hotelOffers = [
  {
    code: "SUMMER25",
    title: "Summer Resort Escape",
    discount: "25% OFF Suites",
    validity: "Valid until Aug 31, 2026",
    description: "Book a suite for 3 or more nights and receive 25% off, complimentary daily buffet breakfast, and a ₹5,000 resort credit for spa services."
  },
  {
    code: "ROYALRETREAT",
    title: "Gourmet Culinary Sanctuary",
    discount: "Free Dining Experience",
    validity: "Valid Year-Round",
    description: "Enjoy a complimentary 3-course dinner for two at the award-winning Royal Bites Restaurant for every night of your stay in our villas."
  },
  {
    code: "SPAWELLNESS",
    title: "Weekend Wellness Getaway",
    discount: "Free Couple Massage",
    validity: "Valid until Dec 15, 2026",
    description: "Escape for a weekend in a Deluxe Garden Villa and enjoy a complimentary 60-minute Royal Ayurvedic massage for two at the Spa & Wellness sanctuary."
  }
];

export const galleryImages = [
  {
    url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    category: "Resort",
    title: "Grand Entrance Portal"
  },
  {
    url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
    category: "Amenities",
    title: "Infinity Sky Pool"
  },
  {
    url: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80",
    category: "Rooms",
    title: "Presidential Infinity Suite Bedroom"
  },
  {
    url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
    category: "Spa",
    title: "Wellness Sanctuary Treatment Room"
  },
  {
    url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80",
    category: "Events",
    title: "Empress Ballroom Banquet Gala Layout"
  },
  {
    url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
    category: "Dining",
    title: "Royal Bites Fine Dining Lounge"
  },
  {
    url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
    category: "Resort",
    title: "Resort Panoramic Sea View Deck"
  },
  {
    url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
    category: "Rooms",
    title: "Deluxe Garden Sanctuary Villa Garden"
  }
];
