import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

/**
 * WHY: 'src/lib/mongoose.ts' helper performs a synchronous initialization check that throws an immediate 
 * error if process.env.MONGODB_URI is undefined. Because Jest reads all file imports sequentially, we must satisfy 
 * this validation gate at the global scope level *before* any backend application modules are imported or resolved.
 * WHAT: Assigns a temporary fallback string to the MONGODB_URI environment key variable pool.
 */
process.env.MONGODB_URI = 'mongodb://localhost:27017/test-fallback';

let mongoServer: MongoMemoryServer;

describe('Signup API Endpoint Comprehensive Testing Suite', () => {
  
  /**
   * WHY: Prepares an isolated database connection environment before running tests.
   * WHAT: Spins up the temporary memory database server and forces unique indexing.
   */
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    
    /**
     * WHY: Overwrite the static placeholder we declared above with the real, dynamic 
     * connection URI string issued by our running in-memory MongoDB environment.
     * WHAT: Re-assigns process.env.MONGODB_URI to point directly to the isolated instance.
     */
    process.env.MONGODB_URI = uri;
    
    await mongoose.connect(uri);
    await User.syncIndexes(); // Ensures MongoDB unique compound keys are compiled and listening
  });

  /**
   * WHY: Guarantees individual test cases do not bleed data into each other.
   * WHAT: Scrubs the User collection clean between test assertions.
   */
  afterEach(async () => {
    await User.deleteMany({});
  });

  /**
   * WHY: Avoids memory leaks and open network handles.
   * WHAT: Tears down connections and destroys the ephemeral database engine.
   */
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('Successful Registration Operations', () => {
    /**
     * WHY: Verifies the primary "happy path" logic flow of your registration endpoint.
     * WHAT: Passes a valid registration payload, asserts the route returns a 201 Created status, 
     * and looks inside the database to verify password hashing and correct defaults are assigned.
     */
    test('15. should register a new user successfully, assigning structural defaults and a hashed password', async () => {
      /**
       * WHY: If this import sat at the very top of our test file, it would evaluate 'src/lib/mongoose.ts' 
       * before beforeAll had a chance to inject the real dynamic connection memory uri string.
       * WHAT: Dynamically lazy-loads the API named POST router module function *after* process variables are set.
       */
      const { POST } = await import('@/app/api/auth/signup/route');

      const signupPayload = {
        username: 'new_player',
        email: 'PLAYER@example.com', // Capital letters to test lowercase forcing
        password: 'SuperSecurePassword123'
      };

      // Mocking the Next.js incoming Web API standard Request object payload structure
      const req = new Request('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupPayload)
      });

      // Execute your actual endpoint function directly
      const response = await POST(req);
      const data = await response.json();

      // Asserting HTTP response layers
      expect(response.status).toBe(201);
      expect(data.message).toContain('successfully');

      // Asserting Database layers: Pull the written user to check password safety
      const savedUser = await User.findOne({ email: 'player@example.com' });
      expect(savedUser).toBeTruthy();
      expect(savedUser!.username).toBe('new_player');
      expect(savedUser!.gamesPlayed).toBe(0);
      expect(savedUser!.statsByDifficulty.hard.correct).toBe(0);
      
      // CRITICAL SECURITY ASSERTION: Ensure the plaintext password string was NOT saved, 
      // and verify that your custom encryption utility wrapped it in valid bcrypt algorithms.
      expect(savedUser!.passwordHash).not.toBe('SuperSecurePassword123');
      const isBcryptHash = bcrypt.compareSync('SuperSecurePassword123', savedUser!.passwordHash);
      expect(isBcryptHash).toBe(true);
    });
  });

  describe('Validation & Defenses Error Handling', () => {
    /**
     * WHY: Confirms the backend blocks incomplete API payloads sent outside your web forms.
     * WHAT: Submits a body missing a password, verifying the route triggers your custom 400 validation interceptor.
     */
    test('16. should return a 400 status code when required fields are missing', async () => {
      const { POST } = await import('@/app/api/auth/signup/route');

      const incompletePayload = {
        username: 'broken_player',
        email: 'broken@example.com'
        // password parameter is intentionally missing from this structural payload
      };

      const req = new Request('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incompletePayload)
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('All fields are required');
    });

    /**
     * WHY: Confirms that password strength limits are strictly enforced at the backend server layer.
     * WHAT: Submits a payload with a password under 6 characters, ensuring it triggers your length check constraint.
     */
    test('17. should return a 400 status code when password is less than 6 characters long', async () => {
      const { POST } = await import('@/app/api/auth/signup/route');

      const weakPayload = {
        username: 'weak_player',
        email: 'weak@example.com',
        password: '123' // Intentionally too short
      };

      const req = new Request('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(weakPayload)
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Password must be at least 6 characters long');
    });

    /**
     * WHY: Prevents account hijacking or duplication collisions at the router layer.
     * WHAT: Pre-seeds a user profile directly, then forces the API route to handle a separate 
     * signup attempt using identical unique fields, validating it responds with a clean 400 error.
     */
    test('18. should return a 400 status code if the username or email is already registered', async () => {
      const { POST } = await import('@/app/api/auth/signup/route');

      // Seed the existing profile into our isolated virtual pool ahead of time
      await User.create({
        username: 'existing_master',
        email: 'master@example.com',
        passwordHash: 'hashed_password'
      });

      const duplicatePayload = {
        username: 'existing_master', // Duplicate field entry
        email: 'different_email@example.com',
        password: 'password123'
      };

      const req = new Request('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicatePayload)
      });

      const response = await POST(req);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('Username or email already registered');
    });

        /**
     * WHY: Validates that your duplicate query actively catches hidden collisions after data sanitization filters are run.
     * WHAT: Pre-seeds a user profile with clean strings, then feeds the API endpoint raw strings 
     * padded with un-trimmed spaces and alternative capitalizations to verify it catches duplicates.
     */
    test('19. should return a 400 status code even if duplicate entries contain loose spacing or alternative casing flags', async () => {
      const { POST } = await import('@/app/api/auth/signup/route');

      // 1. Seed a pristine user document inside our isolated virtual environment
      await User.create({
        username: 'clean_player',
        email: 'clean@example.com',
        passwordHash: 'hashed_password'
      });

      // 2. Submit a registration payload with malicious whitespace padding and uppercase strings
      const trickyPayload = {
        username: '   clean_player   ', // Un-trimmed spaces to verify collision checking triggers
        email: 'CLEAN@EXAMPLE.COM',     // Alternative casing profile
        password: 'password123'
      };

      const req = new Request('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trickyPayload)
      });

      const response = await POST(req);
      const data = await response.json();
      
      // Confirms your query structure flags sanitized variations instantly
      expect(response.status).toBe(400);
      expect(data.error).toBe('Username or email already registered');
    });
  });
});
