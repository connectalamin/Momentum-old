import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed with Bangladeshi context data...');

  // Hash password for all users (using a common test password)
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Bangladeshi Education Boards
  const boards = ['Dhaka', 'Chittagong', 'Rajshahi', 'Comilla', 'Sylhet', 'Barisal', 'Jessore', 'Dinajpur'];

  // Popular Bangladeshi Institutions
  const universities = [
    'University of Dhaka',
    'Bangladesh University of Engineering and Technology (BUET)',
    'Chittagong University',
    'Rajshahi University',
    'Jahangirnagar University',
    'Khulna University',
    'Shahjalal University of Science and Technology',
    'Bangladesh Agricultural University',
    'Dhaka University of Engineering and Technology (DUET)',
    'North South University',
    'BRAC University',
    'Independent University, Bangladesh (IUB)'
  ];

  const colleges = [
    'Notre Dame College',
    'Viqarunnisa Noon School & College',
    'Dhaka College',
    'Rajuk Uttara Model College',
    'Government Science College',
    'Holy Cross College',
    'Eden Girls\' College',
    'Ideal School and College',
    'Motijheel Government Boys\' High School',
    'St. Joseph Higher Secondary School'
  ];

  const schools = [
    'Viqarunnisa Noon School',
    'Ideal School and College',
    'Motijheel Government Boys\' High School',
    'St. Joseph Higher Secondary School',
    'Holy Cross Girls\' High School',
    'Dhanmondi Government Boys\' High School',
    'Government Laboratory High School',
    'Chittagong Collegiate School',
    'Rajshahi Collegiate School',
    'Sylhet Government Pilot High School'
  ];

  // University Majors
  const majors = [
    'Computer Science and Engineering (CSE)',
    'Electrical and Electronic Engineering (EEE)',
    'Business Administration (BBA)',
    'Economics',
    'English',
    'Physics',
    'Chemistry',
    'Mathematics',
    'Biology',
    'Accounting',
    'Finance',
    'Marketing',
    'International Relations',
    'Public Administration',
    'Sociology',
    'Psychology'
  ];

  // Sample Users - School Students
  const schoolUsers = [
    {
      email: 'rahman.school@example.com',
      password: hashedPassword,
      firstName: 'Rahman',
      lastName: 'Ahmed',
      educationLevel: 'school',
      institution: schools[0],
      class: '6',
      board: boards[0], // Dhaka
    },
    {
      email: 'fatima.school@example.com',
      password: hashedPassword,
      firstName: 'Fatima',
      lastName: 'Khan',
      educationLevel: 'school',
      institution: schools[1],
      class: '8',
      board: boards[0], // Dhaka
    },
    {
      email: 'hasan.school@example.com',
      password: hashedPassword,
      firstName: 'Hasan',
      lastName: 'Ali',
      educationLevel: 'school',
      institution: schools[2],
      class: '9',
      group: 'science',
      board: boards[1], // Chittagong
    },
    {
      email: 'nusrat.school@example.com',
      password: hashedPassword,
      firstName: 'Nusrat',
      lastName: 'Rahman',
      educationLevel: 'school',
      institution: schools[3],
      class: '10',
      group: 'commerce',
      board: boards[2], // Rajshahi
    },
    {
      email: 'karim.school@example.com',
      password: hashedPassword,
      firstName: 'Karim',
      lastName: 'Hossain',
      educationLevel: 'school',
      institution: schools[4],
      class: '11',
      group: 'arts',
      board: boards[3], // Comilla
    },
    {
      email: 'sadia.school@example.com',
      password: hashedPassword,
      firstName: 'Sadia',
      lastName: 'Islam',
      educationLevel: 'school',
      institution: schools[5],
      class: '12',
      group: 'science',
      board: boards[4], // Sylhet
    },
  ];

  // Sample Users - College Students
  const collegeUsers = [
    {
      email: 'tahmid.college@example.com',
      password: hashedPassword,
      firstName: 'Tahmid',
      lastName: 'Chowdhury',
      educationLevel: 'college',
      institution: colleges[0],
      year: 1,
      group: 'science',
      board: boards[0], // Dhaka
    },
    {
      email: 'tasnim.college@example.com',
      password: hashedPassword,
      firstName: 'Tasnim',
      lastName: 'Begum',
      educationLevel: 'college',
      institution: colleges[1],
      year: 2,
      group: 'commerce',
      board: boards[0], // Dhaka
    },
    {
      email: 'rafiq.college@example.com',
      password: hashedPassword,
      firstName: 'Rafiq',
      lastName: 'Uddin',
      educationLevel: 'college',
      institution: colleges[2],
      year: 1,
      group: 'arts',
      board: boards[1], // Chittagong
    },
    {
      email: 'jahanara.college@example.com',
      password: hashedPassword,
      firstName: 'Jahanara',
      lastName: 'Khatun',
      educationLevel: 'college',
      institution: colleges[3],
      year: 2,
      group: 'science',
      board: boards[2], // Rajshahi
    },
  ];

  // Sample Users - University Students
  const universityUsers = [
    {
      email: 'arif.university@example.com',
      password: hashedPassword,
      firstName: 'Arif',
      lastName: 'Mahmud',
      educationLevel: 'university',
      institution: universities[0], // University of Dhaka
      year: 1,
      major: majors[0], // CSE
    },
    {
      email: 'sumaiya.university@example.com',
      password: hashedPassword,
      firstName: 'Sumaiya',
      lastName: 'Akter',
      educationLevel: 'university',
      institution: universities[1], // BUET
      year: 2,
      major: majors[1], // EEE
    },
    {
      email: 'sohel.university@example.com',
      password: hashedPassword,
      firstName: 'Sohel',
      lastName: 'Rana',
      educationLevel: 'university',
      institution: universities[2], // Chittagong University
      year: 3,
      major: majors[2], // BBA
    },
    {
      email: 'farhana.university@example.com',
      password: hashedPassword,
      firstName: 'Farhana',
      lastName: 'Yasmin',
      educationLevel: 'university',
      institution: universities[3], // Rajshahi University
      year: 4,
      major: majors[3], // Economics
    },
    {
      email: 'imran.university@example.com',
      password: hashedPassword,
      firstName: 'Imran',
      lastName: 'Hasan',
      educationLevel: 'university',
      institution: universities[4], // Jahangirnagar University
      year: 2,
      major: majors[4], // English
    },
    {
      email: 'nazia.university@example.com',
      password: hashedPassword,
      firstName: 'Nazia',
      lastName: 'Sultana',
      educationLevel: 'university',
      institution: universities[5], // Khulna University
      year: 3,
      major: majors[5], // Physics
    },
    {
      email: 'kamrul.university@example.com',
      password: hashedPassword,
      firstName: 'Kamrul',
      lastName: 'Islam',
      educationLevel: 'university',
      institution: universities[6], // SUST
      year: 1,
      major: majors[6], // Chemistry
    },
    {
      email: 'ruma.university@example.com',
      password: hashedPassword,
      firstName: 'Ruma',
      lastName: 'Akter',
      educationLevel: 'university',
      institution: universities[7], // BAU
      year: 4,
      major: majors[7], // Mathematics
    },
  ];

  // Sample Users - Graduate Students
  const graduateUsers = [
    {
      email: 'shahid.graduate@example.com',
      password: hashedPassword,
      firstName: 'Shahid',
      lastName: 'Ullah',
      educationLevel: 'graduate',
      institution: universities[0], // University of Dhaka
      major: majors[0], // CSE
      unstructuredContext: 'Researching Machine Learning and AI applications in healthcare',
    },
    {
      email: 'mariam.graduate@example.com',
      password: hashedPassword,
      firstName: 'Mariam',
      lastName: 'Chowdhury',
      educationLevel: 'graduate',
      institution: universities[1], // BUET
      major: majors[1], // EEE
      unstructuredContext: 'Pursuing Masters in Power Systems and Renewable Energy',
    },
    {
      email: 'tanvir.graduate@example.com',
      password: hashedPassword,
      firstName: 'Tanvir',
      lastName: 'Rahman',
      educationLevel: 'graduate',
      institution: universities[2], // Chittagong University
      major: majors[2], // BBA
      unstructuredContext: 'MBA student specializing in Finance and Investment',
    },
    {
      email: 'sharmin.graduate@example.com',
      password: hashedPassword,
      firstName: 'Sharmin',
      lastName: 'Begum',
      educationLevel: 'graduate',
      institution: universities[3], // Rajshahi University
      major: majors[3], // Economics
      unstructuredContext: 'PhD candidate in Development Economics',
    },
  ];

  // Combine all users
  const allUsers = [...schoolUsers, ...collegeUsers, ...universityUsers, ...graduateUsers];

  // Create users in database
  console.log(`📝 Creating ${allUsers.length} sample users...`);
  
  for (const userData of allUsers) {
    try {
      await prisma.user.create({
        data: userData,
      });
      console.log(`  ✓ Created user: ${userData.email}`);
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(`  ⚠ User already exists: ${userData.email}`);
      } else {
        console.error(`  ✗ Error creating user ${userData.email}:`, error.message);
      }
    }
  }

  console.log('✅ Database seed completed successfully!');
  console.log(`📊 Total users created: ${allUsers.length}`);
  console.log('   - School students: 6');
  console.log('   - College students: 4');
  console.log('   - University students: 8');
  console.log('   - Graduate students: 4');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

