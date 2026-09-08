const BASE_URL = process.env.BASE_URL || "http://localhost:8788"

let passed = 0
let failed = 0

function pass(name, status) {
    console.log(`[PASS] ${name} -> ${status}`)
    passed++
}

function fail(name, expected, actual, message = "") {
    console.log(`[FAIL] ${name} -> Expected ${expected}, got ${actual}`)

    if (message) {
        console.log(`       ${message}`)
    }

    failed++
}

async function request(name, method, path, expectedStatus, body = null, token = null) {
    try {
        const headers = {}

        if (body !== null) {
            headers["Content-Type"] = "application/json"
        }

        if (token) {
            headers["Authorization"] = `Bearer ${token}`
        }

        const response = await fetch(`${BASE_URL}${path}`, {
            method,
            headers,
            body: body !== null ? JSON.stringify(body) : undefined,
        })

        const text = await response.text()

        let data = null

        try {
            data = text ? JSON.parse(text) : null
        } catch {
            data = text
        }

        if (response.status === expectedStatus) {
            pass(name, response.status)
        } else {
            fail(
                name,
                expectedStatus,
                response.status,
                typeof data === "string" ? data : data?.message || "",
            )
        }

        return {
            status: response.status,
            data,
        }
    } catch (error) {
        fail(name, expectedStatus, "NETWORK ERROR", error.message)

        return {
            status: null,
            data: null,
        }
    }
}

async function main() {
    console.log("")
    console.log("============================================================")
    console.log("              NOTES API WORKER TEST")
    console.log("============================================================")
    console.log(`BASE URL: ${BASE_URL}`)
    console.log("")

    const randomId = () => Math.random().toString(36).substring(2, 10)

    const userA = {
        name: "Worker Test User A",
        email: `worker_a_${randomId()}@example.com`,
        password: "TestPassword123",
    }

    const userB = {
        name: "Worker Test User B",
        email: `worker_b_${randomId()}@example.com`,
        password: "TestPassword123",
    }

    let tokenA = null
    let tokenB = null
    let noteAId = null
    let noteBId = null

    await request("Health Check", "GET", "/api/health", 200)

    await request("API Info", "GET", "/api", 200)

    await request("D1 Check", "GET", "/api/db-test", 200)

    const registerA = await request("Register User A", "POST", "/api/auth/register", 201, userA)

    tokenA = registerA.data?.token || null

    if (!tokenA) {
        console.log("[ERROR] User A token alınmadı.")
    }

    const loginA = await request("Login User A", "POST", "/api/auth/login", 200, {
        email: userA.email,
        password: userA.password,
    })

    if (loginA.data?.token) {
        tokenA = loginA.data.token
    }

    await request("Wrong Password", "POST", "/api/auth/login", 401, {
        email: userA.email,
        password: "WrongPassword123",
    })

    await request("Get Me", "GET", "/api/auth/me", 200, null, tokenA)

    await request("Get Me Without Token", "GET", "/api/auth/me", 401)

    await request("Get Me Invalid Token", "GET", "/api/auth/me", 401, null, "invalid-token")

    await request("Get Profile", "GET", "/api/profile", 200, null, tokenA)

    await request("Profile Without Token", "GET", "/api/profile", 401)

    await request(
        "Update Profile",
        "PUT",
        "/api/profile",
        200,
        {
            name: "Updated User A",
            bio: "Worker + D1",
            avatar_url: "https://example.com/avatar.png",
        },
        tokenA,
    )

    await request("Get Updated Profile", "GET", "/api/profile", 200, null, tokenA)

    const registerB = await request("Register User B", "POST", "/api/auth/register", 201, userB)

    tokenB = registerB.data?.token || null

    const createA = await request(
        "Create Note A",
        "POST",
        "/api/notes",
        201,
        {
            title: "User A Note",
            content: "Private note A",
            category: "testing",
        },
        tokenA,
    )

    noteAId = createA.data?.data?.id || null

    if (noteAId) {
        console.log(`       Note A ID: ${noteAId}`)
    }

    await request("Read Own Note A", "GET", `/api/notes/${noteAId}`, 200, null, tokenA)

    await request("User B Read Note A", "GET", `/api/notes/${noteAId}`, 404, null, tokenB)

    await request(
        "User B Update Note A",
        "PUT",
        `/api/notes/${noteAId}`,
        404,
        {
            title: "Hacked",
            content: "Should fail",
            category: "testing",
        },
        tokenB,
    )

    await request(
        "User B Patch Note A",
        "PATCH",
        `/api/notes/${noteAId}`,
        404,
        {
            title: "Should fail",
        },
        tokenB,
    )

    await request("User B Delete Note A", "DELETE", `/api/notes/${noteAId}`, 404, null, tokenB)

    await request("Note A Still Exists", "GET", `/api/notes/${noteAId}`, 200, null, tokenA)

    await request("Get User A Notes", "GET", "/api/notes", 200, null, tokenA)

    const updateA = await request(
        "Update Note A",
        "PUT",
        `/api/notes/${noteAId}`,
        200,
        {
            title: "Updated Note A",
            content: "Updated content",
            category: "updated",
        },
        tokenA,
    )

    await request(
        "Patch Note A",
        "PATCH",
        `/api/notes/${noteAId}`,
        200,
        {
            is_pinned: true,
            is_archived: false,
        },
        tokenA,
    )

    const createB = await request(
        "Create Note B",
        "POST",
        "/api/notes",
        201,
        {
            title: "User B Note",
            content: "Private note B",
            category: "testing",
        },
        tokenB,
    )

    noteBId = createB.data?.data?.id || null

    if (noteBId) {
        console.log(`       Note B ID: ${noteBId}`)
    }

    await request("Read Own Note B", "GET", `/api/notes/${noteBId}`, 200, null, tokenB)

    await request("User A Read Note B", "GET", `/api/notes/${noteBId}`, 404, null, tokenA)

    await request("Notes Without Token", "GET", "/api/notes", 401)

    await request("Create Note Without Token", "POST", "/api/notes", 401, {
        title: "Unauthorized",
        content: "Should fail",
    })

    await request("Delete Note B", "DELETE", `/api/notes/${noteBId}`, 200, null, tokenB)

    await request("Delete Note A", "DELETE", `/api/notes/${noteAId}`, 200, null, tokenA)

    await request("Deleted Note A", "GET", `/api/notes/${noteAId}`, 404, null, tokenA)

    await request("Logout", "POST", "/api/auth/logout", 200, null, tokenA)

    await request("Unknown Route", "GET", "/api/does-not-exist", 404)

    console.log("")
    console.log("============================================================")
    console.log("                     TEST RESULT")
    console.log("============================================================")

    console.log(`PASSED: ${passed}`)

    console.log(`FAILED: ${failed}`)

    console.log("")

    if (failed === 0) {
        console.log("ALL WORKER API TESTS PASSED")
    } else {
        console.log("SOME WORKER API TESTS FAILED")
        process.exitCode = 1
    }

    console.log("============================================================")
}

main()
