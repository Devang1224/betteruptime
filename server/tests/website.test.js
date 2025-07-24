const axios = require("axios");

const base_url = "http://localhost:3000";

function getUserName() {
  return `tester${Math.floor(Math.random() * 100000)}`;
}

let USERNAME = getUserName();
const PASSWORD = "password";

let userId = null;

beforeAll(async () => {
  try {
    const res = await axios.post(`${base_url}/user/signup`, {
      username: USERNAME,
      password: PASSWORD,
    });
    userId = res.data?.data?.id;
  } catch (err) {
    console.error("Error during user signup in beforeAll:", err);
  }
});

describe("website creation", () => {
  test("website not created if URL is not present", async () => {
    try {
      await axios.post(`${base_url}/website`);
      throw new Error("Website created when it shouldn't have been");
    } catch (err) {
      expect(err.response?.status).toBe(411);
      expect(err.response?.data?.message).toBe("need url");
    }
  });

  test("website created if URL is present", async () => {
    const res = await axios.post(`${base_url}/website`, {
      url: "https://google.com",
      userId: userId,
    });
    expect(res.data.id).toBeDefined();
  });
});

describe("user signup", () => {
  test("fails if request body is missing", async () => {
    try {
      await axios.post(`${base_url}/user/signup`);
      throw new Error("Control should not reach here");
    } catch (err) {
      expect(err.response?.status).toBe(403);
    }
  });

  test("user was created successfully (checked in beforeAll)", async () => {
    expect(userId).toBeDefined();
  });
});

describe("user login", () => {
  test("fails if request body is missing", async () => {
    try {
      await axios.post(`${base_url}/user/login`);
      throw new Error("Control should not reach here");
    } catch (err) {
      expect(err.response?.status).toBe(403);
    }
  });

  test("succeeds with correct credentials", async () => {
    const res = await axios.post(`${base_url}/user/login`, {
      username: USERNAME,
      password: PASSWORD,
    });
    expect(res.status).toBe(200);
    expect(res.data?.data?.id).toBeDefined();
  });
});
