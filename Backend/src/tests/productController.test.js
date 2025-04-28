const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../models/User");
const Product = require("../models/Product");
const {
  createProduct,
  getFarmerProducts,
} = require("../controllers/productController");

// Mock dependencies
jest.mock("jsonwebtoken", () => require("./mocks/jsonwebtoken"));

// Set up Express app for testing
const app = express();
app.use(express.json());

describe("Product Controller", () => {
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
    await Product.deleteMany({});
  });

  test("POST /api/products creates a new product for farmer", async () => {
    const farmer = await User.create({
      fullName: "John Doe",
      email: "john@example.com",
      phoneNumber: "1234567890",
      password: "hashedpassword",
      userType: "farmer",
    });

    // Set up route with farmer's _id
    app.post("/api/products", (req, res) => {
      req.user = {
        _id: farmer._id,
        userType: "farmer",
      };
      createProduct(req, res);
    });

    const response = await request(app).post("/api/products").send({
      name: "Apples",
      description: "Fresh apples",
      price: 2.99,
      category: "Fruit",
      stock: 100,
      image: "/uploads/apple.jpg",
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      msg: "Product created successfully",
      product: {
        name: "Apples",
        description: "Fresh apples",
        price: 2.99,
        category: "Fruit",
        stock: 100,
        image: "/uploads/apple.jpg",
        farmer: farmer._id.toString(),
      },
    });

    const product = await Product.findOne({ name: "Apples" });
    expect(product).toBeTruthy();
    expect(product.farmer.toString()).toBe(farmer._id.toString());
  });

  test("POST /api/products returns 403 for non-farmer", async () => {
    // Set up route for non-farmer
    app.post("/api/products/non-farmer", (req, res) => {
      req.user = {
        _id: new mongoose.Types.ObjectId(),
        userType: "customer",
      };
      createProduct(req, res);
    });

    const response = await request(app).post("/api/products/non-farmer").send({
      name: "Apples",
      description: "Fresh apples",
      price: 2.99,
      category: "Fruit",
      stock: 100,
      image: "/uploads/apple.jpg",
    });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      msg: "Access denied, only farmers can add products",
    });

    const product = await Product.findOne({ name: "Apples" });
    expect(product).toBeNull();
  });

  test("GET /api/products/my-products returns farmer's products", async () => {
    const farmer = await User.create({
      fullName: "John Doe",
      email: "john@example.com",
      phoneNumber: "1234567890",
      password: "hashedpassword",
      userType: "farmer",
    });

    // Set up route with farmer's _id
    app.get("/api/products/my-products", (req, res) => {
      req.user = {
        _id: farmer._id,
        userType: "farmer",
      };
      getFarmerProducts(req, res);
    });

    await Product.create([
      {
        farmer: farmer._id,
        name: "Apples",
        description: "Fresh apples",
        price: 2.99,
        category: "Fruit",
        stock: 100,
        image: "/uploads/apple.jpg",
      },
      {
        farmer: farmer._id,
        name: "Oranges",
        description: "Juicy oranges",
        price: 3.49,
        category: "Fruit",
        stock: 50,
        image: "/uploads/orange.jpg",
      },
    ]);

    const response = await request(app).get("/api/products/my-products");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body).toMatchObject([
      {
        name: "Apples",
        description: "Fresh apples",
        price: 2.99,
        category: "Fruit",
        stock: 100,
        image: "/uploads/apple.jpg",
        farmer: farmer._id.toString(),
      },
      {
        name: "Oranges",
        description: "Juicy oranges",
        price: 3.49,
        category: "Fruit",
        stock: 50,
        image: "/uploads/orange.jpg",
        farmer: farmer._id.toString(),
      },
    ]);
  });

  test("GET /api/products/my-products returns 403 for non-farmer", async () => {
    // Set up route for non-farmer
    app.get("/api/products/my-products/non-farmer", (req, res) => {
      req.user = {
        _id: new mongoose.Types.ObjectId(),
        userType: "customer",
      };
      getFarmerProducts(req, res);
    });

    const response = await request(app).get(
      "/api/products/my-products/non-farmer"
    );

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      msg: "Access denied",
    });
  });
});
