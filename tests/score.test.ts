import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Score from '@/models/Score';
import User from '@/models/User';

// Declaring the local in-memory database server instance globally within this file scope
let mongoServer: MongoMemoryServer;

describe('Score Schema Comprehensive Testing Suite', () => {
  
  /**
   * WHY: We use beforeAll to establish an isolated database connection before running tests.
   * WHAT: Spins up an ephemeral, in-memory MongoDB engine instance. This ensures that 
   * our tests run against a real database environment without polluting or requiring a 
   * connection to our actual production cluster.
   */
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  /**
   * WHY: Tests must always start from a completely clean state to guarantee isolation.
   * WHAT: Wipes out all saved entries across the Score and User database collections 
   * immediately after each individual test block finishes executing.
   */
  afterEach(async () => {
    await Score.deleteMany({});
    await User.deleteMany({});
  });

  /**
   * WHY: Leaving database sockets open blocks terminal script executions from closing.
   * WHAT: Completely disconnects Mongoose and cleanly shuts down the in-memory server 
   * engine once all test blocks in this file conclude.
   */
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('Relational Link Assertions', () => {
    /**
     * WHY: Validates the foreign-key style relational mapping (`ref: "User"`) in your schema.
     * WHAT: Seeds an authentic User profile record, writes a Game Score linked to that user's 
     * specific ObjectId string, and verifies that the data entry correctly reflects 
     * the linkage alongside automatic metadata attributes like timestamps.
     */
    test('8. should seamlessly save score records and map explicitly to a user', async () => {
      // Create a real user profile inside the temporary testing pool
      const mockUser = await User.create({
        username: 'score_link_user',
        email: 'linker@test.com',
        passwordHash: 'hash',
      });

      // Insert a score entry matching that specific user profile's ID
      const gameScore = await Score.create({
        userId: mockUser._id.toString(), // Explicit relational mapping string assignment
        categoryId: '9',
        difficulty: 'medium',
        score: 7,
        totalQuestions: 10,
      });

      // Fetch back the written record to ensure relational mappings and defaults persist
      const fetchedScore = await Score.findById(gameScore._id);
      expect(fetchedScore).toBeTruthy();
      expect(fetchedScore?.userId).toBe(mockUser._id.toString());
    });
  });

  describe('Data Integrity Boundary Testing', () => {
    /**
     * WHY: Verifies that your data layer blocks incomplete payloads.
     * WHAT: Feeds a score object missing critical tracking elements (`categoryId`, 
     * `difficulty`, `totalQuestions`) to ensure Mongoose flags them as errors rather 
     * than silently inserting corrupted documents.
     */
    test('9. should fail validation if critical structural columns are omitted', async () => {
      const incompleteScore = new Score({ userId: '65a12345f123456789abcdef', score: 10 });

      // validateSync catches schema violations instantly in-memory
      const error = incompleteScore.validateSync();
      expect(error?.errors.categoryId).toBeDefined();
      expect(error?.errors.difficulty).toBeDefined();
      expect(error?.errors.totalQuestions).toBeDefined();
    });

    /**
     * WHY: Enforces type safety at the database tier.
     * WHAT: Attempts to pass an alphanumeric string into a numerical `score` field, 
     * validating that Mongoose's internal type casting engine actively throws a 
     * CastError to prevent database corruption.
     */
    test('10. should fail if fields receive incompatible datatypes', async () => {
      const corruptScore = new Score({
        userId: '65a12345f123456789abcdef',
        categoryId: '9',
        difficulty: 'easy',
        score: 'corrupt-string-data', // Deliberately bad datatype assignment
        totalQuestions: 10,
      });

      const error = corruptScore.validateSync();
      expect(error?.errors.score).toBeDefined();
      expect(error?.errors.score.name).toBe('CastError');
    });
  });

  describe('Numerical Boundary Layer Assertions', () => {
    /**
     * WHY: Implements strict defensive programming to guard your endpoint against API tampering.
     * WHAT: Attempts to pass a negative value to the score property, confirming that the new 
     * schema-level boundary block actively rejects it with your custom validation text message.
     */
    test('11. should catch and reject impossible negative score data values', async () => {
      const negativeScore = new Score({
        userId: '65a12345f123456789abcdef',
        categoryId: '14',
        difficulty: 'medium',
        score: -5, // Violates the custom min: 0 constraint
        totalQuestions: 10,
      });

      const error = negativeScore.validateSync();
      expect(error?.errors.score).toBeDefined();
      expect(error?.errors.score.message).toBe('Score cannot be negative');
    });

    /**
     * WHY: Verifies that metadata limits are actively enforced.
     * WHAT: Submits a quiz session with zero total questions, ensuring the database catches 
     * the anomaly and triggers your custom `min: 1` constraint blockade.
     */
    test('12. should crash validation if totalQuestions value is zero or lower', async () => {
      const zeroQuestionsScore = new Score({
        userId: '65a12345f123456789abcdef',
        categoryId: '14',
        difficulty: 'medium',
        score: 0,
        totalQuestions: 0, // Violates the custom min: 1 constraint
      });

      const error = zeroQuestionsScore.validateSync();
      expect(error?.errors.totalQuestions).toBeDefined();
    });

    /**
     * WHY: Prevents math calculation structures from crashing if a calculation results in a decimal.
     * WHAT: Passes a floating-point score to ensure Mongoose allows clean decimal precision support 
     * instead of coercing an unhandled cast crash.
     */
    test('13. should handle fractional score configurations cleanly without rounding crash', async () => {
      const decimalScore = new Score({
        userId: '65a12345f123456789abcdef',
        categoryId: '9',
        difficulty: 'easy',
        score: 8.5, // Verifying decimal float compliance
        totalQuestions: 10,
      });

      const error = decimalScore.validateSync();
      expect(error).toBeUndefined();
      expect(decimalScore.score).toBe(8.5);
    });

    /**
     * WHY: Guarantees leaderboard records have reliable chronological history logs.
     * WHAT: Confirms that saving a Score record without an explicit date automatically 
     * triggers the Mongoose default fallback value, instantiating a valid Javascript Date object.
     */
    test('14. should automatically fallback to default initialization timestamp if omitted', async () => {
      const score = await Score.create({
        userId: '65a12345f123456789abcdef',
        categoryId: '9',
        difficulty: 'easy',
        score: 10,
        totalQuestions: 10,
      });

      expect(score.createdAt).toBeInstanceOf(Date);
      expect(score.createdAt.getTime()).toBeLessThanOrEqual(Date.now());
    });
  });
});
