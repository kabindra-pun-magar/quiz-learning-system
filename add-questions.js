// add-questions.js
// Location: ~/quiz-learning-system/add-questions.js
// Run with: mongosh add-questions.js

print("=========================================");
print("📚 Setting up Quiz Database");
print("=========================================\n");

// Switch to quiz database
db = db.getSiblingDB('quizdb');

// Drop existing questions collection
print("🗑️  Removing existing questions...");
db.questions.drop();

// Insert sample questions
print("📝 Adding sample questions...\n");

const result = db.questions.insertMany([
  {
    question: "What does DBMS stand for?",
    options: [
      "Database Management System",
      "Data Backup Management System", 
      "Database Manipulation System",
      "Data Binary Management System"
    ],
    correctAnswer: "Database Management System",
    explanation: "DBMS stands for Database Management System, which is software for creating and managing databases.",
    category: "DBMS",
    difficulty: "Easy",
    isActive: true,
    createdAt: new Date(),
    points: 10
  },
  {
    question: "Which of the following is a primary key?",
    options: [
      "A key that uniquely identifies each record",
      "A key that can have NULL values",
      "A key that references another table",
      "A key that stores images"
    ],
    correctAnswer: "A key that uniquely identifies each record",
    explanation: "A primary key is a unique identifier for each record in a database table. It cannot be NULL.",
    category: "DBMS",
    difficulty: "Easy",
    isActive: true,
    createdAt: new Date(),
    points: 10
  },
  {
    question: "What is the full form of OS?",
    options: [
      "Operating System",
      "Open Software",
      "Output System",
      "Optical Storage"
    ],
    correctAnswer: "Operating System",
    explanation: "OS stands for Operating System, which manages computer hardware and software resources.",
    category: "OS",
    difficulty: "Easy",
    isActive: true,
    createdAt: new Date(),
    points: 10
  },
  {
    question: "Which of the following is NOT an operating system?",
    options: ["Windows", "Linux", "macOS", "Excel"],
    correctAnswer: "Excel",
    explanation: "Excel is a spreadsheet application, not an operating system.",
    category: "OS",
    difficulty: "Easy",
    isActive: true,
    createdAt: new Date(),
    points: 10
  },
  {
    question: "What is a deadlock in operating systems?",
    options: [
      "Two processes waiting for each other's resources",
      "System crash due to hardware failure",
      "Memory overflow condition",
      "CPU overheating"
    ],
    correctAnswer: "Two processes waiting for each other's resources",
    explanation: "A deadlock occurs when two or more processes are waiting for each other to release resources.",
    category: "OS",
    difficulty: "Hard",
    isActive: true,
    createdAt: new Date(),
    points: 15
  },
  {
    question: "What does HTTP stand for?",
    options: [
      "HyperText Transfer Protocol",
      "High Transfer Text Protocol",
      "Hyper Transfer Text Protocol",
      "HighText Transfer Protocol"
    ],
    correctAnswer: "HyperText Transfer Protocol",
    explanation: "HTTP is the foundation of data communication for the World Wide Web.",
    category: "Networks",
    difficulty: "Easy",
    isActive: true,
    createdAt: new Date(),
    points: 10
  },
  {
    question: "What is the default port for HTTPS?",
    options: ["443", "80", "8080", "22"],
    correctAnswer: "443",
    explanation: "HTTPS uses port 443 for secure web traffic, while HTTP uses port 80.",
    category: "Networks",
    difficulty: "Medium",
    isActive: true,
    createdAt: new Date(),
    points: 10
  },
  {
    question: "Which data structure uses LIFO (Last In First Out)?",
    options: ["Stack", "Queue", "Array", "Linked List"],
    correctAnswer: "Stack",
    explanation: "Stack follows LIFO principle - the last element added is the first one to be removed.",
    category: "DSA",
    difficulty: "Easy",
    isActive: true,
    createdAt: new Date(),
    points: 10
  },
  {
    question: "Which data structure uses FIFO (First In First Out)?",
    options: ["Queue", "Stack", "Heap", "Graph"],
    correctAnswer: "Queue",
    explanation: "Queue follows FIFO principle - the first element added is the first one to be removed.",
    category: "DSA",
    difficulty: "Easy",
    isActive: true,
    createdAt: new Date(),
    points: 10
  },
  {
    question: "What is React?",
    options: [
      "JavaScript library for building user interfaces",
      "Python web framework",
      "Database management system",
      "Operating system"
    ],
    correctAnswer: "JavaScript library for building user interfaces",
    explanation: "React is a popular JavaScript library for building user interfaces, maintained by Facebook.",
    category: "Web Dev",
    difficulty: "Easy",
    isActive: true,
    createdAt: new Date(),
    points: 10
  },
  {
    question: "What is the Virtual DOM?",
    options: [
      "A lightweight copy of the real DOM",
      "A database for storing DOM elements",
      "A server-side rendering technology",
      "A programming language"
    ],
    correctAnswer: "A lightweight copy of the real DOM",
    explanation: "Virtual DOM is a programming concept where a virtual representation of the UI is kept in memory.",
    category: "Web Dev",
    difficulty: "Hard",
    isActive: true,
    createdAt: new Date(),
    points: 15
  },
  {
    question: "What is MongoDB?",
    options: [
      "A NoSQL database",
      "A SQL database",
      "A programming language",
      "A web framework"
    ],
    correctAnswer: "A NoSQL database",
    explanation: "MongoDB is a popular NoSQL document database that stores data in flexible, JSON-like documents.",
    category: "DBMS",
    difficulty: "Medium",
    isActive: true,
    createdAt: new Date(),
    points: 10
  }
]);

print("\n✅ Successfully added " + result.insertedIds.length + " questions to the database!");
print("\n📊 Database Statistics:");
print("   Database: quizdb");
print("   Questions Count: " + db.questions.countDocuments());

print("\n📚 Questions by Category:");
const categories = db.questions.distinct("category");
categories.forEach(cat => {
  const count = db.questions.countDocuments({ category: cat });
  print(`   ${cat}: ${count} questions`);
});

print("\n🎯 Sample Question:");
const sample = db.questions.findOne();
print(`   Q: ${sample.question}`);
print(`   Category: ${sample.category}`);
print(`   Difficulty: ${sample.difficulty}`);

print("\n=========================================");
print("✅ Database setup complete!");
print("=========================================");
