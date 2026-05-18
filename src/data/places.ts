import type { Category, Place, ResearchDetails } from '../types';

type RawPlaceSeed = [
  name: string,
  region: string,
  category: Category,
  latitude: number,
  longitude: number,
  tags: string[],
];

interface PlaceSeed {
  name: string;
  region: string;
  category: Category;
  latitude: number;
  longitude: number;
  tags: string[];
}

const seedsByState: Record<string, RawPlaceSeed[]> = {
  California: [
    ['Yosemite National Park', 'Sierra Nevada', 'National Parks', 37.8651, -119.5383, ['mountains', 'waterfalls', 'photography', 'hiking']],
    ['Joshua Tree National Park', 'Mojave Desert', 'National Parks', 33.8734, -115.901, ['desert', 'sunset', 'hiking', 'photography']],
    ['Sequoia National Park', 'Sierra Nevada', 'National Parks', 36.4864, -118.5658, ['forests', 'giant trees', 'hiking']],
    ['Big Sur', 'Central Coast', 'Scenic Roads', 36.2704, -121.8081, ['coast', 'road trip', 'photography']],
    ['Golden Gate Bridge', 'Bay Area', 'Landmarks', 37.8199, -122.4783, ['architecture', 'photography', 'iconic']],
    ['San Francisco', 'Bay Area', 'Cities', 37.7749, -122.4194, ['food', 'city', 'museums']],
    ['Los Angeles', 'Southern California', 'Cities', 34.0522, -118.2437, ['city', 'food', 'culture']],
    ['Santa Monica Beach', 'Southern California', 'Beaches', 34.0195, -118.4912, ['beach', 'sunset', 'weekend']],
    ['Laguna Beach', 'Orange County', 'Beaches', 33.5427, -117.7854, ['beach', 'art', 'photography']],
    ['Dodger Stadium', 'Los Angeles', 'Stadiums', 34.0739, -118.24, ['baseball', 'stadium', 'city']],
    ['Oracle Park', 'Bay Area', 'Stadiums', 37.7786, -122.3893, ['baseball', 'waterfront', 'stadium']],
    ['Griffith Observatory', 'Los Angeles', 'Landmarks', 34.1184, -118.3004, ['views', 'night', 'photography']],
    ['Getty Center', 'Los Angeles', 'Museums', 34.078, -118.4741, ['art', 'architecture', 'museums']],
    ['Hearst Castle', 'Central Coast', 'Historic Sites', 35.6852, -121.1682, ['history', 'architecture']],
    ['Pacific Coast Highway', 'California Coast', 'Scenic Roads', 35.2828, -120.6596, ['road trip', 'coast', 'photography']],
    ['Disneyland Resort', 'Orange County', 'Theme Parks', 33.8121, -117.919, ['family', 'theme park']],
    ['Stanford University', 'Bay Area', 'Universities', 37.4275, -122.1697, ['campus', 'architecture']],
    ['LAX', 'Los Angeles', 'Airports', 33.9416, -118.4085, ['airport', 'gateway']],
    ['Ferry Building Marketplace', 'Bay Area', 'Food Spots', 37.7955, -122.3937, ['food', 'market', 'waterfront']],
    ['Point Reyes National Seashore', 'North Coast', 'State Parks', 38.0719, -122.8816, ['coast', 'wildlife', 'photography']],
  ],
  Washington: [
    ['Mount Rainier National Park', 'Cascades', 'National Parks', 46.8523, -121.7603, ['mountains', 'snow', 'photography', 'hiking']],
    ['Olympic National Park', 'Olympic Peninsula', 'National Parks', 47.8021, -123.6044, ['rainforest', 'coast', 'hiking']],
    ['North Cascades National Park', 'North Cascades', 'National Parks', 48.7718, -121.2985, ['mountains', 'lakes', 'hiking']],
    ['Seattle', 'Puget Sound', 'Cities', 47.6062, -122.3321, ['city', 'coffee', 'museums']],
    ['Pike Place Market', 'Seattle', 'Food Spots', 47.6097, -122.3422, ['food', 'market', 'city']],
    ['Space Needle', 'Seattle', 'Landmarks', 47.6205, -122.3493, ['views', 'architecture']],
    ['Museum of Pop Culture', 'Seattle', 'Museums', 47.6215, -122.348, ['music', 'museums']],
    ['T-Mobile Park', 'Seattle', 'Stadiums', 47.5914, -122.3325, ['baseball', 'stadium']],
    ['Husky Stadium', 'Seattle', 'Stadiums', 47.6503, -122.3016, ['football', 'stadium']],
    ['Deception Pass State Park', 'Whidbey Island', 'State Parks', 48.3956, -122.6484, ['bridges', 'coast', 'photography']],
    ['San Juan Islands', 'Puget Sound', 'Beaches', 48.5514, -123.0781, ['islands', 'wildlife', 'weekend']],
    ['Leavenworth', 'Central Washington', 'Cities', 47.5962, -120.6615, ['mountains', 'food', 'weekend']],
    ['Snoqualmie Falls', 'Cascade Foothills', 'Landmarks', 47.5417, -121.8377, ['waterfalls', 'photography']],
    ['Chuckanut Drive', 'Northwest Coast', 'Scenic Roads', 48.6097, -122.4418, ['road trip', 'coast']],
    ['University of Washington', 'Seattle', 'Universities', 47.6553, -122.3035, ['campus', 'cherry blossoms']],
    ['Sea-Tac Airport', 'Puget Sound', 'Airports', 47.4502, -122.3088, ['airport', 'gateway']],
    ['Fremont Troll', 'Seattle', 'Landmarks', 47.651, -122.3474, ['quirky', 'city']],
    ['Bainbridge Island', 'Puget Sound', 'Beaches', 47.6249, -122.521, ['island', 'weekend']],
    ['Palouse Scenic Byway', 'Eastern Washington', 'Scenic Roads', 46.7312, -117.1794, ['fields', 'photography', 'road trip']],
    ['Fort Worden', 'Olympic Peninsula', 'Historic Sites', 48.1398, -122.765, ['history', 'coast']],
  ],
  Michigan: [
    ['Sleeping Bear Dunes', 'Northwest Michigan', 'National Parks', 44.8113, -86.0601, ['dunes', 'lakes', 'photography']],
    ['Pictured Rocks National Lakeshore', 'Upper Peninsula', 'National Parks', 46.5636, -86.3479, ['cliffs', 'kayaking', 'photography']],
    ['Mackinac Island', 'Straits', 'Historic Sites', 45.8492, -84.6189, ['history', 'biking', 'weekend']],
    ['Detroit', 'Southeast Michigan', 'Cities', 42.3314, -83.0458, ['city', 'music', 'food']],
    ['Grand Rapids', 'West Michigan', 'Cities', 42.9634, -85.6681, ['city', 'beer', 'art']],
    ['Ann Arbor', 'Southeast Michigan', 'Cities', 42.2808, -83.743, ['college town', 'food']],
    ['Michigan Stadium', 'Ann Arbor', 'Stadiums', 42.2658, -83.7487, ['football', 'stadium']],
    ['Comerica Park', 'Detroit', 'Stadiums', 42.339, -83.0485, ['baseball', 'stadium']],
    ['The Henry Ford', 'Dearborn', 'Museums', 42.3034, -83.2335, ['history', 'museums']],
    ['Detroit Institute of Arts', 'Detroit', 'Museums', 42.3594, -83.0645, ['art', 'museums']],
    ['Tahquamenon Falls', 'Upper Peninsula', 'State Parks', 46.5744, -85.2576, ['waterfalls', 'forests']],
    ['Porcupine Mountains', 'Upper Peninsula', 'State Parks', 46.7764, -89.7646, ['mountains', 'hiking']],
    ['Traverse City', 'Northwest Michigan', 'Cities', 44.7631, -85.6206, ['food', 'wine', 'lakes']],
    ['Holland State Park', 'West Michigan', 'Beaches', 42.7745, -86.2061, ['beach', 'lighthouse']],
    ['M-22', 'Northwest Michigan', 'Scenic Roads', 44.8307, -86.0447, ['road trip', 'lakes']],
    ['University of Michigan', 'Ann Arbor', 'Universities', 42.278, -83.7382, ['campus', 'architecture']],
    ['Detroit Metro Airport', 'Southeast Michigan', 'Airports', 42.2162, -83.3554, ['airport', 'gateway']],
    ['Eastern Market', 'Detroit', 'Food Spots', 42.3484, -83.0401, ['food', 'market']],
    ['Belle Isle', 'Detroit River', 'Landmarks', 42.3437, -82.9743, ['island', 'parks']],
    ['Charlevoix', 'Northwest Michigan', 'Beaches', 45.3181, -85.2584, ['lakes', 'weekend']],
  ],
  Utah: [
    ['Zion National Park', 'Southwest Utah', 'National Parks', 37.2982, -113.0263, ['canyons', 'hiking', 'photography']],
    ['Bryce Canyon National Park', 'Southwest Utah', 'National Parks', 37.593, -112.1871, ['hoodoos', 'sunrise', 'photography']],
    ['Arches National Park', 'Moab', 'National Parks', 38.7331, -109.5925, ['arches', 'desert', 'photography']],
    ['Canyonlands National Park', 'Moab', 'National Parks', 38.3269, -109.8783, ['canyons', 'road trip']],
    ['Capitol Reef National Park', 'Central Utah', 'National Parks', 38.367, -111.2615, ['desert', 'orchards']],
    ['Salt Lake City', 'Wasatch Front', 'Cities', 40.7608, -111.891, ['city', 'mountains']],
    ['Park City', 'Wasatch Back', 'Cities', 40.6461, -111.498, ['skiing', 'weekend']],
    ['Monument Valley', 'Southeast Utah', 'Landmarks', 37.0041, -110.1735, ['desert', 'photography']],
    ['Bonneville Salt Flats', 'Northwest Utah', 'Landmarks', 40.7627, -113.887, ['minimal', 'photography']],
    ['Dead Horse Point State Park', 'Moab', 'State Parks', 38.4707, -109.7397, ['views', 'sunset']],
    ['Goblin Valley State Park', 'Central Utah', 'State Parks', 38.5733, -110.7071, ['desert', 'quirky']],
    ['Highway 12 Scenic Byway', 'Southern Utah', 'Scenic Roads', 37.8075, -111.4079, ['road trip', 'photography']],
    ['LaVell Edwards Stadium', 'Provo', 'Stadiums', 40.2575, -111.654, ['football', 'stadium']],
    ['Rice-Eccles Stadium', 'Salt Lake City', 'Stadiums', 40.76, -111.848, ['football', 'stadium']],
    ['Natural History Museum of Utah', 'Salt Lake City', 'Museums', 40.764, -111.822, ['museums', 'architecture']],
    ['University of Utah', 'Salt Lake City', 'Universities', 40.7649, -111.8421, ['campus', 'mountains']],
    ['Salt Lake City International Airport', 'Wasatch Front', 'Airports', 40.7899, -111.9791, ['airport', 'gateway']],
    ['Red Iguana', 'Salt Lake City', 'Food Spots', 40.7715, -111.912, ['food', 'local favorite']],
    ['Antelope Island', 'Great Salt Lake', 'State Parks', 40.9583, -112.2072, ['wildlife', 'sunset']],
    ['Moab', 'Southeast Utah', 'Cities', 38.5733, -109.5498, ['adventure', 'desert']],
  ],
  Arizona: [
    ['Grand Canyon National Park', 'Northern Arizona', 'National Parks', 36.1069, -112.1129, ['canyons', 'sunrise', 'photography']],
    ['Saguaro National Park', 'Southern Arizona', 'National Parks', 32.2967, -111.1666, ['desert', 'cacti', 'photography']],
    ['Petrified Forest National Park', 'Northeast Arizona', 'National Parks', 35.0659, -109.7829, ['desert', 'history']],
    ['Sedona', 'Red Rock Country', 'Cities', 34.8697, -111.761, ['red rocks', 'weekend', 'photography']],
    ['Phoenix', 'Central Arizona', 'Cities', 33.4484, -112.074, ['city', 'food']],
    ['Tucson', 'Southern Arizona', 'Cities', 32.2226, -110.9747, ['food', 'desert']],
    ['Horseshoe Bend', 'Northern Arizona', 'Landmarks', 36.8791, -111.5104, ['canyons', 'photography']],
    ['Antelope Canyon', 'Northern Arizona', 'Landmarks', 36.8619, -111.3743, ['canyons', 'photography']],
    ['Montezuma Castle', 'Verde Valley', 'Historic Sites', 34.6115, -111.834, ['history', 'cliff dwellings']],
    ['Taliesin West', 'Scottsdale', 'Historic Sites', 33.6064, -111.8459, ['architecture', 'history']],
    ['Camelback Mountain', 'Phoenix', 'Landmarks', 33.5142, -111.965, ['hiking', 'views']],
    ['Slide Rock State Park', 'Sedona', 'State Parks', 34.9457, -111.7521, ['water', 'weekend']],
    ['Route 89A', 'Northern Arizona', 'Scenic Roads', 34.8697, -111.761, ['road trip', 'red rocks']],
    ['Chase Field', 'Phoenix', 'Stadiums', 33.4455, -112.0667, ['baseball', 'stadium']],
    ['State Farm Stadium', 'Glendale', 'Stadiums', 33.5276, -112.2626, ['football', 'stadium']],
    ['Arizona-Sonora Desert Museum', 'Tucson', 'Museums', 32.2441, -111.1675, ['museums', 'wildlife']],
    ['Arizona State University', 'Tempe', 'Universities', 33.4242, -111.9281, ['campus', 'city']],
    ['Phoenix Sky Harbor', 'Central Arizona', 'Airports', 33.4342, -112.0116, ['airport', 'gateway']],
    ['Pizzeria Bianco', 'Phoenix', 'Food Spots', 33.4494, -112.0653, ['food', 'local favorite']],
    ['Lake Havasu', 'Western Arizona', 'Beaches', 34.4839, -114.3225, ['water', 'weekend']],
  ],
};

const descriptiveByCategory: Record<Category, string> = {
  'National Parks': 'A landmark outdoor destination known for immersive landscapes and memorable day-to-multi-day trips.',
  'State Parks': 'A quieter outdoor escape with strong local character and room to wander.',
  Stadiums: 'A sports destination built around live atmosphere, ritual, and game-day memory.',
  Landmarks: 'An iconic place that anchors how people remember the region.',
  Cities: 'A city stop with layered neighborhoods, food, and culture worth exploring slowly.',
  Beaches: 'A waterside destination for slower days, open skies, and sunset walks.',
  Museums: 'A culture-rich stop for art, history, or design-minded travelers.',
  Universities: 'A campus destination with architecture, tradition, and local energy.',
  'Theme Parks': 'A high-energy destination designed around full-day experiences.',
  'Scenic Roads': 'A drive where the journey is the point, with pull-offs and views along the way.',
  Airports: 'A regional gateway that matters more in travel memory than people admit.',
  'Food Spots': 'A place-first food stop people build detours around.',
  'Historic Sites': 'A destination where the story of the place is part of the visit.',
  'Custom Places': 'A personally meaningful destination saved by the traveler.',
};

const photoSpotsByCategory: Record<Category, string[]> = {
  'National Parks': ['sunrise overlook', 'trail bend', 'wide landscape frame'],
  'State Parks': ['quiet overlook', 'forest path', 'shoreline edge'],
  Stadiums: ['home plate sightline', 'upper deck panorama', 'entrance facade'],
  Landmarks: ['classic front angle', 'blue-hour view', 'detail shot'],
  Cities: ['street corner', 'skyline view', 'local cafe window'],
  Beaches: ['shoreline at dusk', 'boardwalk perspective', 'dune path'],
  Museums: ['atrium', 'gallery threshold', 'exterior facade'],
  Universities: ['main quad', 'signature building', 'tree-lined walk'],
  'Theme Parks': ['entry boulevard', 'night lights', 'signature ride view'],
  'Scenic Roads': ['road curve', 'lookout pull-off', 'windshield view'],
  Airports: ['terminal window', 'departure board', 'runway view'],
  'Food Spots': ['counter detail', 'signature dish', 'street exterior'],
  'Historic Sites': ['main structure', 'interpretive detail', 'golden-hour exterior'],
  'Custom Places': ['personal angle', 'memory detail', 'wide establishing shot'],
};

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function researchFor(seed: PlaceSeed, state: string): ResearchDetails {
  return {
    whatIsIt: `${seed.name} is a ${seed.category.toLowerCase()} destination in ${seed.region}, ${state}.`,
    whyPeopleGo: `People go for ${seed.tags.slice(0, 3).join(', ')} and the distinct feeling of ${seed.region}.`,
    bestTimeToVisit: seed.tags.includes('snow') ? 'Late summer for access, winter for drama.' : seed.tags.includes('desert') ? 'Spring and fall for softer light and milder weather.' : 'Late spring through early fall for the best balance of access and atmosphere.',
    howLongToSpend: seed.category === 'Cities' ? '2–3 days' : seed.category === 'National Parks' ? '1–3 days' : seed.category === 'Scenic Roads' ? 'Half day to full day' : '2–5 hours',
    whatToKnow: seed.category === 'National Parks' ? 'Reserve early when possible, start before crowds, and check current conditions before leaving.' : 'Arrive with enough time to slow down; the best version of this place is rarely rushed.',
    bestPhotoSpots: photoSpotsByCategory[seed.category],
    nearbyThingsToDo: [`Explore more of ${seed.region}`, 'Find a local food stop', `Pair it with another ${seed.category.toLowerCase()} nearby`],
  };
}

const flattenedSeeds = Object.entries(seedsByState).flatMap(([state, seeds]) =>
  seeds.map(([name, region, category, latitude, longitude, tags]) => ({
    state,
    seed: { name, region, category, latitude, longitude, tags },
  })),
);

export const BASE_PLACES: Place[] = flattenedSeeds.map(({ state, seed }, index) => {
  const id = `${slugify(state)}-${slugify(seed.name)}`;
  return {
    id,
    name: seed.name,
    country: 'United States',
    state,
    region: seed.region,
    category: seed.category,
    latitude: seed.latitude,
    longitude: seed.longitude,
    shortDescription: descriptiveByCategory[seed.category],
    longDescription: `${seed.name} is one of the defining ${seed.category.toLowerCase()} experiences in ${state}. It is especially compelling for travelers interested in ${seed.tags.join(', ')}.`,
    researchDetails: researchFor(seed, state),
    tags: seed.tags,
    status: 'none',
    visitCount: 0,
    visits: [],
    datesVisited: [],
    photos: [],
    isFavorite: false,
    bucketScore: 72 + ((index * 7) % 27),
    nearbyPlaceIds: [],
    similarPlaceIds: [],
    notes: '',
  };
});

BASE_PLACES.forEach((place) => {
  place.nearbyPlaceIds = BASE_PLACES.filter((candidate) => candidate.state === place.state && candidate.id !== place.id)
    .slice(0, 3)
    .map((candidate) => candidate.id);

  place.similarPlaceIds = BASE_PLACES.filter((candidate) =>
    candidate.id !== place.id &&
    (candidate.category === place.category || candidate.tags.some((tag) => place.tags.includes(tag))),
  )
    .slice(0, 4)
    .map((candidate) => candidate.id);
});

export const ALL_CATEGORIES: Category[] = [
  'National Parks',
  'State Parks',
  'Stadiums',
  'Landmarks',
  'Cities',
  'Beaches',
  'Museums',
  'Universities',
  'Theme Parks',
  'Scenic Roads',
  'Airports',
  'Food Spots',
  'Historic Sites',
  'Custom Places',
];
