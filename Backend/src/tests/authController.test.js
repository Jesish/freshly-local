const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../models/User");
const { signup, login } = require("../controllers/userController");

// Mock dependencies
jest.mock("jsonwebtoken", () => require("./mocks/jsonwebtoken"));

// Set up Express app for testing
const app = express();
app.use(express.json());

// Mock Multer by manually setting req.files
app.post("/api/users/signup", (req, res) => {
  req.files = {
    profileImage: [{ filename: `profile-${Date.now()}.jpg` }],
    farmImage: [{ filename: `farm-${Date.now()}.jpg` }],
  };
  signup(req, res);
});
app.post("/api/users/login", login);

describe("Auth Controller", () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  test("POST /api/users/signup creates a new user", async () => {
    const response = await request(app)
      .post("/api/users/signup")
      .send({
        fullName: "John Doe",
        email: "john@example.com",
        phoneNumber: "1234567890",
        password: "password123",
        userType: "farmer",
        farmName: "Doe Farm",
        farmLocation: JSON.stringify({ city: "Springfield" }),
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      msg: "User created successfully",
      token: "mocked-token",
    });

    const user = await User.findOne({ email: "john@example.com" });
    expect(user).toBeTruthy();
    expect(user.fullName).toBe("John Doe");
    expect(user.profileImage).toMatch(/\/uploads\/profile-/);
    expect(user.farmImage[0]).toMatch(/\/uploads\/farm-/);
  });

  test("POST /api/users/signup returns 400 for duplicate user", async () => {
    await User.create({
      fullName: "Jane Doe",
      email: "jane@example.com",
      phoneNumber: "0987654321",
      password: "password123",
      userType: "farmer",
    });

    const response = await request(app)
      .post("/api/users/signup")
      .send({
        fullName: "Jane Doe",
        email: "jane@example.com",
        phoneNumber: "0987654321",
        password: "password123",
        userType: "farmer",
        farmLocation: JSON.stringify({ city: "Springfield" }),
      });

    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("User already exists");
  });

  test("POST /api/users/login logs in with valid credentials", async () => {
    await User.create({
      fullName: "John Doe",
      email: "john@example.com",
      phoneNumber: "1234567890",
      password: "password123",
      userType: "farmer",
    });

    const response = await request(app).post("/api/users/login").send({
      email: "john@example.com",
      password: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      msg: "Login successful",
      token: "mocked-token",
      userType: "farmer",
    });
  });

  test("POST /api/users/login returns 400 for invalid credentials", async () => {
    const response = await request(app).post("/api/users/login").send({
      email: "nonexistent@example.com",
      password: "password123",
    });

    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Invalid credentials");
  });
});
