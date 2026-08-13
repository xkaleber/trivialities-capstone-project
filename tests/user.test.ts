import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '@/models/User';

let mongoServer: MongoMemoryServer;

describe('User Schema Comprehensive Testing Suite', () => {
  
  /**
   * WHY: Unique indexes (`unique: true`) require active compilation to enforce blocks correctly.
   * WHAT: Mounts our temporary memory database instance and forces an explicit index synchronization.
   * This guarantees that MongoDB unique indexes are fully built and active before data is seeded.
   */
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    await User.syncIndexes(); // Critical: Forces immediate compilation of unique indexes
  });

  /**
   * WHY: We must clear data between tests but CANNOT drop the collection entirely. Dropping the 
   * collection completely deletes the unique indexes we just built in the beforeAll hook.
   * WHAT: Triggers deleteMany to scrub text documents cleanly without deleting collection definitions.
   */
  afterEach(async () => {
    await User.deleteMany({});
  });

  /**
   * WHY: Proper environment teardown.
   * WHAT: Tears down open sockets and deletes the in-memory database storage array completely.
   */
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('Happy Path & Data Layer Formats', () => {
    /**
     * WHY: Validates model sanitization rules, defaults, and normal operations.
     * WHAT: Passes a valid payload containing uppercase characters in the email field. 
     * Verifies that the record saves, default metrics resolve to zero, and the email 
     * is automatically forced to lowercase via your schema configuration options.
     */
    test('1. should save valid payload and confirm structural defaults are assigned', async () => {
      const user = await User.create({
        username: 'trivia_king',
        email: 'KING@EXAMPLE.COM', // Provided uppercase strings to test conversion engine
        passwordHash: '$2a$10$abcdefghijklmnopqrstuv',
      });

      expect(user._id).toBeDefined();
      expect(user.gamesPlayed).toBe(0); // Proves default value rules triggered
      expect(user.highScore).toBe(0);   // Proves default value rules triggered
      expect(user.email).toBe('king@example.com'); // Proves your automatic lowercase sanitization logic worked
    });
  });

  describe('Identity Constraint Layer Checks', () => {
    /**
     * WHY: Protects against profile duplication at the core architecture layer.
     * WHAT: Creates a user record and then immediately tries to write a *second* user 
     * profile with an identical username, verifying the database throws a rejection error.
     */
    test('2. should enforce unique constraint violations on duplicate usernames', async () => {
      await User.create({ username: 'unique_user', email: 'one@test.com', passwordHash: 'hash' });
      const duplicate = new User({ username: 'unique_user', email: 'two@test.com', passwordHash: 'hash' });

      // Expecting database driver level index collision exceptions
      await expect(duplicate.save()).rejects.toThrow();
    });

    /**
     * WHY: Prevents multiple registrations using the same email address.
     * WHAT: Creates a user entry and then attempts to save a second user with the same email 
     * but formatted in uppercase, proving uniqueness checks handle case insensitivity cleanly.
     */
    test('3. should enforce unique constraint violations on duplicate emails', async () => {
      await User.create({ username: 'user_one', email: 'shared@test.com', passwordHash: 'hash' });
      const duplicate = new User({ username: 'user_two', email: 'SHARED@test.com', passwordHash: 'hash' });

      await expect(duplicate.save()).rejects.toThrow();
    });

    /**
     * WHY: Verifies validation logic fires properly before executing writing scripts.
     * WHAT: Omits critical parameters and ensures validateSync registers explicit schema-level errors.
     */
    test('4. should reject user creation when required fields are missing', async () => {
      const brokenUser = new User({ username: 'missing_fields' });
      const error = brokenUser.validateSync();
      
      expect(error?.errors.email).toBeDefined();
      expect(error?.errors.passwordHash).toBeDefined();
    });
  });

  describe('Malicious Input & Format Boundaries', () => {
    /**
     * WHY: Prevents corrupted string payloads from bypassing security tiers.
     * WHAT: Feeds an un-formatted string to the email property, verifying that the new 
     * regex constraint intercepts the format and rejects it with your exact error string message.
     */
    test('5. should reject strings that do not match a valid email format pattern', async () => {
      const badUser = new User({
        username: 'malicious_hacker',
        email: 'plain-text-dump-not-email', // Malicious text structure missing @ and TLD domains
        passwordHash: 'hash',
      });

      const error = badUser.validateSync();
      expect(error?.errors.email).toBeDefined();
      expect(error?.errors.email.message).toBe('Please enter a valid email address');
    });
  });

  describe('Analytics & Progress Metrics Layer', () => {
    /**
     * WHY: Verifies compliance and storage of dynamic key-value properties.
     * WHAT: Modifies a Mongoose Map (`statsByCategory`), saves it, and fetches it back from the 
     * database to guarantee nested performance matrices update accurately when users complete games.
     */
    test('6. should successfully modify dynamic category performance maps', async () => {
      const user = await User.create({
        username: 'analytics_tester',
        email: 'tester@test.com',
        passwordHash: 'hash',
      });

      // Mutate the dynamic category key maps
      user.statsByCategory.set('History', { correct: 3, total: 5 });
      await user.save();

      const updatedUser = await User.findById(user._id);
      expect(updatedUser?.statsByCategory.get('History')?.correct).toBe(3);
    });

    /**
     * WHY: Ensures structured objects preserve their sub-document data models without leaks.
     * WHAT: Updates analytics data inside a specific difficulty sub-object (`statsByDifficulty.hard`) 
     * and confirms that the other difficulty level models (`easy`, `medium`) safely remain at their default values.
     */
    test('7. should cleanly handle upgrades onto fixed difficulty maps', async () => {
      const user = await User.create({
        username: 'difficulty_tester',
        email: 'diff@test.com',
        passwordHash: 'hash',
      });

      user.statsByDifficulty.hard.correct = 8;
      await user.save();

      const updatedUser = await User.findById(user._id);
      expect(updatedUser?.statsByDifficulty.hard.correct).toBe(8);
      expect(updatedUser?.statsByDifficulty.easy.correct).toBe(0); // Proves other sibling blocks are uncorrupted
    });
  });
});
