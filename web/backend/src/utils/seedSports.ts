import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Sport from '../models/Sport';

dotenv.config();

const sportsData = [
  {
    name: 'Badminton',
    description: 'A racquet sport played using racquets to hit a shuttlecock across a net.',
    category: 'Indoor',
    playersPerTeam: 1,
    maxPlayers: 4,
    equipment: ['Badminton Racket', 'Shuttlecock', 'Net'],
    rules: [
      'Serve diagonally across the court',
      'Shuttlecock must pass over the net',
      'Points scored when opponent fails to return'
    ],
    icon: '🏸',
    isActive: true,
    popularity: 85
  },
  {
    name: 'Tennis',
    description: 'A racket sport that can be played individually or between two teams of two players.',
    category: 'Outdoor',
    playersPerTeam: 1,
    maxPlayers: 4,
    equipment: ['Tennis Racket', 'Tennis Ball', 'Net'],
    rules: [
      'Serve from behind the baseline',
      'Ball must bounce once before return',
      'Points scored when opponent fails to return'
    ],
    icon: '🎾',
    isActive: true,
    popularity: 90
  },
  {
    name: 'Basketball',
    description: 'A team sport in which two teams score points by throwing a ball through a hoop.',
    category: 'Indoor',
    playersPerTeam: 5,
    maxPlayers: 10,
    equipment: ['Basketball', 'Hoop', 'Backboard'],
    rules: [
      'Dribble the ball while moving',
      'Score by shooting through the hoop',
      'Fouls result in free throws'
    ],
    icon: '🏀',
    isActive: true,
    popularity: 95
  },
  {
    name: 'Cricket',
    description: 'A bat-and-ball game played between two teams of eleven players.',
    category: 'Outdoor',
    playersPerTeam: 11,
    maxPlayers: 22,
    equipment: ['Cricket Bat', 'Cricket Ball', 'Wickets'],
    rules: [
      'Batsmen score runs by hitting the ball',
      'Bowlers try to dismiss batsmen',
      'Team with most runs wins'
    ],
    icon: '🏏',
    isActive: true,
    popularity: 80
  },
  {
    name: 'Football',
    description: 'A team sport played with a spherical ball between two teams of 11 players.',
    category: 'Outdoor',
    playersPerTeam: 11,
    maxPlayers: 22,
    equipment: ['Football', 'Goal Posts', 'Field Markings'],
    rules: [
      'Score by kicking ball into opponent\'s goal',
      'No hands allowed except for goalkeeper',
      'Offside rule applies'
    ],
    icon: '⚽',
    isActive: true,
    popularity: 100
  },
  {
    name: 'Squash',
    description: 'A racket sport played by two or four players in a four-walled court.',
    category: 'Indoor',
    playersPerTeam: 1,
    maxPlayers: 4,
    equipment: ['Squash Racket', 'Squash Ball', 'Court'],
    rules: [
      'Hit ball against front wall',
      'Ball can bounce once before return',
      'Points scored on opponent errors'
    ],
    icon: '🎾',
    isActive: true,
    popularity: 70
  },
  {
    name: 'Volleyball',
    description: 'A team sport in which two teams hit a ball over a net.',
    category: 'Both',
    playersPerTeam: 6,
    maxPlayers: 12,
    equipment: ['Volleyball', 'Net', 'Court'],
    rules: [
      'Three hits per side maximum',
      'Ball must pass over the net',
      'Score by grounding ball on opponent\'s court'
    ],
    icon: '🏐',
    isActive: true,
    popularity: 75
  }
];

const seedSports = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');
    
    // Clear existing sports
    await Sport.deleteMany({});
    console.log('Cleared existing sports');
    
    // Insert new sports
    const sports = await Sport.insertMany(sportsData);
    console.log(`Seeded ${sports.length} sports successfully`);
    
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
