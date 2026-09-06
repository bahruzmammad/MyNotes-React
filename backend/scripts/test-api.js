const BASE_URL = "http://localhost:5000";

let passed = 0;
let failed = 0;

function pass(name, status) {
  console.log(`[PASS] ${name} -> ${status}`);
  passed++;
}

function fail(name, expected, actual, message = "") {
  console.log(`[FAIL] ${name} -> Expected ${expected}, got ${actual}`);
  if (message) {
    console.log(`       ${message}`);
  }
  failed++;
}

async function request(
  name,
  method,
  path,
  expectedStatus,
  body = null,
  token = null,
) {
  try {
    const headers = {};

    if (body !== null) {
      headers["Content-Type"] = "application/json";
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== null ? JSON.stringify(body) : undefined,
    });

    const text = await response.text();

    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (response.status === expectedStatus) {
      pass(name, response.status);
    } else {
      fail(
        name,
        expectedStatus,
        response.status,
        typeof data === "string" ? data : data?.message || "",
      );
    }

    return {
      status: response.status,
      data,
    };
  } catch (error) {
    fail(name, expectedStatus, "NETWORK ERROR", error.message);

    return {
      status: null,
      data: null,
    };
  }
}

async function main() {
  console.log("");
  console.log("============================================================");
  console.log("              NOTES API JAVASCRIPT TEST");
  console.log("============================================================");
  console.log(`BASE URL: ${BASE_URL}`);
  console.log("");

  const randomId = () => Math.random().toString(36).substring(2, 10);

  const userA = {
    name: "JS Test User A",
    email: `js_user_a_${randomId()}@example.com`,
    password: "TestPassword123",
  };

  const userB = {
    name: "JS Test User B",
    email: `js_user_b_${randomId()}@example.com`,
    password: "TestPassword123",
  };

  let tokenA = null;
  let tokenB = null;

  let noteAId = null;
  let noteBId = null;

  await request("Health Check", "GET", "/api/health", 200);

  await request("API Info", "GET", "/api", 200);

  const registerA = await request(
    "Register User A",
    "POST",
    "/api/auth/register",
    201,
    userA,
  );

  tokenA = registerA.data?.token || null;

  const loginA = await request("Login User A", "POST", "/api/auth/login", 200, {
    email: userA.email,
    password: userA.password,
  });

  if (loginA.data?.token) {
    tokenA = loginA.data.token;
  }

  await request("User A Wrong Password", "POST", "/api/auth/login", 401, {
    email: userA.email,
    password: "WrongPassword123",
  });

  await request("User A /me", "GET", "/api/auth/me", 200, null, tokenA);

  await request("User A /me Without Token", "GET", "/api/auth/me", 401);

  await request(
    "User A /me Invalid Token",
    "GET",
    "/api/auth/me",
    401,
    null,
    "invalid-token",
  );

  await request("User A Profile GET", "GET", "/api/profile", 200, null, tokenA);

  await request("Profile GET Without Token", "GET", "/api/profile", 401);

  await request(
    "User A Profile PUT",
    "PUT",
    "/api/profile",
    200,
    {
      name: "JS Updated User A",
      bio: "JavaScript + Node.js + SQLite",
      avatar_url: "https://example.com/avatar-a.png",
    },
    tokenA,
  );

  await request(
    "User A Profile GET After Update",
    "GET",
    "/api/profile",
    200,
    null,
    tokenA,
  );

  const registerB = await request(
    "Register User B",
    "POST",
    "/api/auth/register",
    201,
    userB,
  );

  tokenB = registerB.data?.token || null;

  const createA = await request(
    "User A Create Note",
    "POST",
    "/api/notes",
    201,
    {
      title: "User A Note",
      content: "Private note owned by User A",
      category: "testing",
    },
    tokenA,
  );

  noteAId = createA.data?.data?.id || null;

  if (noteAId) {
    console.log(`       Note A ID: ${noteAId}`);
  }

  await request(
    "User A Read Own Note",
    "GET",
    `/api/notes/${noteAId}`,
    200,
    null,
    tokenA,
  );

  await request(
    "User B Read User A Note",
    "GET",
    `/api/notes/${noteAId}`,
    404,
    null,
    tokenB,
  );

  await request(
    "User B PUT User A Note",
    "PUT",
    `/api/notes/${noteAId}`,
    404,
    {
      title: "Hacked",
      content: "Should not update",
      category: "testing",
    },
    tokenB,
  );

  await request(
    "User B PATCH User A Note",
    "PATCH",
    `/api/notes/${noteAId}`,
    404,
    {
      title: "Should Not Work",
    },
    tokenB,
  );

  await request(
    "User B DELETE User A Note",
    "DELETE",
    `/api/notes/${noteAId}`,
    404,
    null,
    tokenB,
  );

  await request(
    "User A Note Still Exists",
    "GET",
    `/api/notes/${noteAId}`,
    200,
    null,
    tokenA,
  );

  await request("User A Get Notes", "GET", "/api/notes", 200, null, tokenA);

  const createB = await request(
    "User B Create Note",
    "POST",
    "/api/notes",
    201,
    {
      title: "User B Note",
      content: "Private note owned by User B",
      category: "testing",
    },
    tokenB,
  );

  noteBId = createB.data?.data?.id || null;

  if (noteBId) {
    console.log(`       Note B ID: ${noteBId}`);
  }

  await request(
    "User B Read Own Note",
    "GET",
    `/api/notes/${noteBId}`,
    200,
    null,
    tokenB,
  );

  await request(
    "User A Read User B Note",
    "GET",
    `/api/notes/${noteBId}`,
    404,
    null,
    tokenA,
  );

  await request(
    "User A PUT User B Note",
    "PUT",
    `/api/notes/${noteBId}`,
    404,
    {
      title: "Hacked",
      content: "Should not work",
      category: "testing",
    },
    tokenA,
  );

  await request(
    "User A DELETE User B Note",
    "DELETE",
    `/api/notes/${noteBId}`,
    404,
    null,
    tokenA,
  );

  await request("Notes GET Without Token", "GET", "/api/notes", 401);

  await request("Notes POST Without Token", "POST", "/api/notes", 401, {
    title: "Unauthorized",
    content: "Should fail",
  });

  await request(
    "User A Delete Own Note",
    "DELETE",
    `/api/notes/${noteAId}`,
    200,
    null,
    tokenA,
  );

  await request(
    "Deleted Note GET",
    "GET",
    `/api/notes/${noteAId}`,
    404,
    null,
    tokenA,
  );

  await request("User A Logout", "POST", "/api/auth/logout", 200, null, tokenA);

  await request("Unknown Route", "GET", "/api/does-not-exist", 404);

  console.log("");
  console.log("============================================================");
  console.log("                     TEST RESULT");
  console.log("============================================================");

  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);

  console.log("");

  if (failed === 0) {
    console.log("ALL JAVASCRIPT TESTS PASSED");
  } else {
    console.log("SOME JAVASCRIPT TESTS FAILED");
    process.exitCode = 1;
  }

  console.log("============================================================");
}

main();
