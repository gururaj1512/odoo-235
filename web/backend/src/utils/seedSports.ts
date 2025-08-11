import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Sport from '../models/Sport';

// Load environment variables
dotenv.config();

const sportsData = [
  {
    name: 'Football',
    description: 'The world\'s most popular sport, played with 11 players per team on a large field.',
    category: 'Outdoor',
    playersPerTeam: 11,
    maxPlayers: 22,
    equipment: ['Football', 'Goal posts', 'Shin guards', 'Cleats'],
    rules: ['No hands (except goalkeeper)', 'Offside rule', '90 minutes duration'],
    icon: '⚽',
    isActive: true,
    popularity: 100
  },
  {
    name: 'Basketball',
    description: 'Fast-paced indoor/outdoor sport with 5 players per team.',
    category: 'Both',
    playersPerTeam: 5,
    maxPlayers: 10,
    equipment: ['Basketball', 'Hoop', 'Backboard', 'Court'],
    rules: ['Dribble to move', 'No traveling', '3-point line'],
    icon: '🏀',
    isActive: true,
    popularity: 85
  },
  {
    name: 'Tennis',
    description: 'Racket sport played individually or in doubles on a court.',
    category: 'Both',
    playersPerTeam: 1,
    maxPlayers: 4,
    equipment: ['Tennis racket', 'Tennis balls', 'Net', 'Court'],
    rules: ['Serve diagonally', 'Best of 3 sets', 'Deuce scoring'],
    icon: '🎾',
    isActive: true,
    popularity: 75
  },
  {
    name: 'Badminton',
    description: 'Racket sport played with a shuttlecock, popular in Asia.',
    category: 'Indoor',
    playersPerTeam: 1,
    maxPlayers: 4,
    equipment: ['Badminton racket', 'Shuttlecock', 'Net', 'Court'],
    rules: ['Serve underhand', 'Best of 3 games', '21 points to win'],
    icon: '🏸',
    isActive: true,
    popularity: 70
  },
  {
    name: 'Cricket',
    description: 'Bat and ball game with 11 players per team.',
    category: 'Outdoor',
    playersPerTeam: 11,
    maxPlayers: 22,
    equipment: ['Cricket bat', 'Cricket ball', 'Wickets', 'Pitch'],
    rules: ['Overs system', 'LBW rule', 'Test/ODI/T20 formats'],
    icon: '🏏',
    isActive: true,
    popularity: 80
  },
  {
    name: 'Volleyball',
    description: 'Team sport played with 6 players per team.',
    category: 'Both',
    playersPerTeam: 6,
    maxPlayers: 12,
    equipment: ['Volleyball', 'Net', 'Court'],
    rules: ['3 touches maximum', 'No catching', 'Best of 5 sets'],
    icon: '🏐',
    isActive: true,
    popularity: 65
  },
  {
    name: 'Squash',
    description: 'Racket sport played in an enclosed court.',
    category: 'Indoor',
    playersPerTeam: 1,
    maxPlayers: 2,
    equipment: ['Squash racket', 'Squash ball', 'Court'],
    rules: ['Serve to opposite box', 'Best of 5 games', '11 points to win'],
    icon: '🏓',
    isActive: true,
    popularity: 45
  },
  {
    name: 'Table Tennis',
    description: 'Fast-paced indoor sport with small rackets and table.',
    category: 'Indoor',
    playersPerTeam: 1,
    maxPlayers: 4,
    equipment: ['Table tennis racket', 'Table tennis ball', 'Table', 'Net'],
    rules: ['Serve diagonally', 'Best of 7 games', '11 points to win'],
    icon: '🏓',
    isActive: true,
    popularity: 60
  },
  {
    name: 'Hockey',
    description: 'Team sport played with sticks and a ball.',
    category: 'Outdoor',
    playersPerTeam: 11,
    maxPlayers: 22,
    equipment: ['Hockey stick', 'Hockey ball', 'Goal posts', 'Field'],
    rules: ['No lifting stick above shoulder', 'Penalty corners', '70 minutes duration'],
    icon: '🏑',
    isActive: true,
    popularity: 55
  },
  {
    name: 'Rugby',
    description: 'Physical team sport with oval ball.',
    category: 'Outdoor',
    playersPerTeam: 15,
    maxPlayers: 30,
    equipment: ['Rugby ball', 'Goal posts', 'Field'],
    rules: ['Forward pass not allowed', 'Tackling rules', '80 minutes duration'],
    icon: '🏉',
    isActive: true,
    popularity: 50
  },
  {
    name: 'Baseball',
    description: 'Bat and ball game with 9 players per team.',
    category: 'Outdoor',
    playersPerTeam: 9,
    maxPlayers: 18,
    equipment: ['Baseball bat', 'Baseball', 'Gloves', 'Diamond'],
    rules: ['9 innings', '3 strikes out', 'Home run'],
    icon: '⚾',
    isActive: true,
    popularity: 40
  },
  {
    name: 'Golf',
    description: 'Individual sport played on a course with clubs.',
    category: 'Outdoor',
    playersPerTeam: 1,
    maxPlayers: 4,
    equipment: ['Golf clubs', 'Golf balls', 'Course'],
    rules: ['Lowest score wins', '18 holes', 'Par system'],
    icon: '⛳',
    isActive: true,
    popularity: 35
  }
];

const seedSports = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    // Clear existing sports
    await Sport.deleteMany({});
    console.log('Cleared existing sports');

    // Insert new sports
    const sports = await Sport.insertMany(sportsData);
    console.log(`Seeded ${sports.length} sports successfully`);

    // Display seeded sports
    sports.forEach(sport => {
      console.log(`- ${sport.name} (${sport.category})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding sports:', error);
    process.exit(1);
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedSports();
}

export default seedSports;
