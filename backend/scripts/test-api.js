const BASE_URL = process.env.BASE_URL || "http://localhost:8787"

let tokenA = ""
let tokenB = ""
let noteAId = null
let noteBId = null

let passed = 0
let failed = 0

const timestamp = Date.now()

const userA = {
    name: "Test User A",
    email: `test-a-${timestamp}@example.com`,
    password: "TestPassword123",
}

const userB = {
    name: "Test User B",
    email: `test-b-${timestamp}@example.com`,
    password: "TestPassword123",
}

async function request(path, options = {}) {
    try {
        const response = await fetch(`${BASE_URL}${path}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {}),
            },
        })

        let data = null

        try {
            data = await response.json()
        } catch {
            data = null
        }

        return {
            status: response.status,
            data,
        }
    } catch (error) {
        return {
            status: null,
            data: null,
            error: error.message,
        }
    }
}

function check(name, expected, result) {
    if (result.status === expected) {
        passed++
        console.log(`[PASS] ${name} -> ${result.status}`)
        return
    }

    failed++

    console.log(`[FAIL] ${name} -> Expected ${expected}, got ${result.status ?? "NETWORK ERROR"}`)

    if (result.error) {
        console.log(`       ${result.error}`)
    }

    if (result.data) {
        console.log(`       ${JSON.stringify(result.data)}`)
    }
}

function getToken(result) {
    return result?.data?.token || ""
}

function getNoteId(result) {
    return result?.data?.data?.id || null
}

async function health() {
    const result = await request("/api/health")
    check("Health", 200, result)
}

async function apiRoot() {
    const result = await request("/api")
    check("API Root", 200, result)
}

async function dbCheck() {
    const result = await request("/api/db-test")
    check("D1 Check", 200, result)
}

async function registerUserA() {
    const result = await request("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(userA),
    })

    check("Register User A", 201, result)

    tokenA = getToken(result)

    if (!tokenA) {
        console.log("[ERROR] User A token alınmadı.")
    }
}

async function loginUserA() {
    const result = await request("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(userA),
    })

    check("Login User A", 200, result)

    tokenA = getToken(result)

    if (!tokenA) {
        console.log("[ERROR] User A token alınmadı.")
    }
}

async function wrongPassword() {
    const result = await request("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
            email: userA.email,
            password: "WrongPassword123",
        }),
    })

    check("Wrong Password", 401, result)
}

async function getMe() {
    const result = await request("/api/auth/me", {
        headers: {
            Authorization: `Bearer ${tokenA}`,
        },
    })

    check("Get Me", 200, result)
}

async function getMeWithoutToken() {
    const result = await request("/api/auth/me")

    check("Get Me Without Token", 401, result)
}

async function getMeInvalidToken() {
    const result = await request("/api/auth/me", {
        headers: {
            Authorization: "Bearer invalid-token",
        },
    })

    check("Get Me Invalid Token", 401, result)
}

async function getProfile() {
    const result = await request("/api/profile", {
        headers: {
            Authorization: `Bearer ${tokenA}`,
        },
    })

    check("Get Profile", 200, result)
}

async function getProfileWithoutToken() {
    const result = await request("/api/profile")

    check("Profile Without Token", 401, result)
}

async function updateProfile() {
    const result = await request("/api/profile", {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${tokenA}`,
        },
        body: JSON.stringify({
            name: "Updated Test User A",
            bio: "Updated bio",
        }),
    })

    check("Update Profile", 200, result)
}

async function getUpdatedProfile() {
    const result = await request("/api/profile", {
        headers: {
            Authorization: `Bearer ${tokenA}`,
        },
    })

    check("Get Updated Profile", 200, result)
}

async function registerUserB() {
    const result = await request("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(userB),
    })

    check("Register User B", 201, result)

    tokenB = getToken(result)

    if (!tokenB) {
        console.log("[ERROR] User B token alınmadı.")
    }
}

async function createNoteA() {
    const result = await request("/api/notes", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${tokenA}`,
        },
        body: JSON.stringify({
            title: "Note A",
            content: "Content of note A",
            category: "general",
        }),
    })

    check("Create Note A", 201, result)

    noteAId = getNoteId(result)

    if (!noteAId) {
        failed++

        console.log("[FAIL] Create Note A -> Note ID alınmadı")
        console.log(`       Response: ${JSON.stringify(result.data)}`)
    } else {
        console.log(`[INFO] Note A ID -> ${noteAId}`)
    }
}

async function readOwnNoteA() {
    if (!noteAId) {
        return
    }

    const result = await request(`/api/notes/${noteAId}`, {
        headers: {
            Authorization: `Bearer ${tokenA}`,
        },
    })

    check("Read Own Note A", 200, result)
}

async function userBReadNoteA() {
    if (!noteAId) {
        return
    }

    const result = await request(`/api/notes/${noteAId}`, {
        headers: {
            Authorization: `Bearer ${tokenB}`,
        },
    })

    check("User B Read Note A", 404, result)
}

async function userBUpdateNoteA() {
    if (!noteAId) {
        return
    }

    const result = await request(`/api/notes/${noteAId}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${tokenB}`,
        },
        body: JSON.stringify({
            title: "Unauthorized Update",
            content: "Should not update",
            category: "general",
        }),
    })

    check("User B Update Note A", 404, result)
}

async function userBPatchNoteA() {
    if (!noteAId) {
        return
    }

    const result = await request(`/api/notes/${noteAId}`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${tokenB}`,
        },
        body: JSON.stringify({
            title: "Unauthorized Patch",
        }),
    })

    check("User B Patch Note A", 404, result)
}

async function userBDeleteNoteA() {
    if (!noteAId) {
        return
    }

    const result = await request(`/api/notes/${noteAId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${tokenB}`,
        },
    })

    check("User B Delete Note A", 404, result)
}

async function noteAStillExists() {
    if (!noteAId) {
        return
    }

    const result = await request(`/api/notes/${noteAId}`, {
        headers: {
            Authorization: `Bearer ${tokenA}`,
        },
    })

    check("Note A Still Exists", 200, result)
}

async function getUserANotes() {
    const result = await request("/api/notes", {
        headers: {
            Authorization: `Bearer ${tokenA}`,
        },
    })

    check("Get User A Notes", 200, result)
}

async function updateNoteA() {
    if (!noteAId) {
        return
    }

    const result = await request(`/api/notes/${noteAId}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${tokenA}`,
        },
        body: JSON.stringify({
            title: "Updated Note A",
            content: "Updated content A",
            category: "general",
        }),
    })

    check("Update Note A", 200, result)
}

async function patchNoteA() {
    if (!noteAId) {
        return
    }

    const result = await request(`/api/notes/${noteAId}`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${tokenA}`,
        },
        body: JSON.stringify({
            title: "Patched Note A",
        }),
    })

    check("Patch Note A", 200, result)
}

async function createNoteB() {
    const result = await request("/api/notes", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${tokenB}`,
        },
        body: JSON.stringify({
            title: "Note B",
            content: "Content of note B",
            category: "general",
        }),
    })

    check("Create Note B", 201, result)

    noteBId = getNoteId(result)

    if (!noteBId) {
        failed++

        console.log("[FAIL] Create Note B -> Note ID alınmadı")
        console.log(`       Response: ${JSON.stringify(result.data)}`)
    } else {
        console.log(`[INFO] Note B ID -> ${noteBId}`)
    }
}

async function readOwnNoteB() {
    if (!noteBId) {
        return
    }

    const result = await request(`/api/notes/${noteBId}`, {
        headers: {
            Authorization: `Bearer ${tokenB}`,
        },
    })

    check("Read Own Note B", 200, result)
}

async function userAReadNoteB() {
    if (!noteBId) {
        return
    }

    const result = await request(`/api/notes/${noteBId}`, {
        headers: {
            Authorization: `Bearer ${tokenA}`,
        },
    })

    check("User A Read Note B", 404, result)
}

async function notesWithoutToken() {
    const result = await request("/api/notes")

    check("Notes Without Token", 401, result)
}

async function createNoteWithoutToken() {
    const result = await request("/api/notes", {
        method: "POST",
        body: JSON.stringify({
            title: "Unauthorized Note",
            content: "Should not exist",
            category: "general",
        }),
    })

    check("Create Note Without Token", 401, result)
}

async function deleteNoteB() {
    if (!noteBId) {
        return
    }

    const result = await request(`/api/notes/${noteBId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${tokenB}`,
        },
    })

    check("Delete Note B", 200, result)
}

async function deleteNoteA() {
    if (!noteAId) {
        return
    }

    const result = await request(`/api/notes/${noteAId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${tokenA}`,
        },
    })

    check("Delete Note A", 200, result)
}

async function deletedNoteA() {
    if (!noteAId) {
        return
    }

    const result = await request(`/api/notes/${noteAId}`, {
        headers: {
            Authorization: `Bearer ${tokenA}`,
        },
    })

    check("Deleted Note A", 404, result)
}

async function logout() {
    const result = await request("/api/auth/logout", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${tokenA}`,
        },
    })

    check("Logout", 200, result)
}

async function unknownRoute() {
    const result = await request("/api/unknown-route")

    check("Unknown Route", 404, result)
}

async function main() {
    console.log("============================================================")
    console.log("                  MyNotes Worker API Test")
    console.log("============================================================")
    console.log(`BASE URL: ${BASE_URL}`)
    console.log("")

    await health()
    await apiRoot()
    await dbCheck()

    await registerUserA()
    await loginUserA()
    await wrongPassword()

    if (!tokenA) {
        console.log("")
        console.log("User A token alınmadı. Test dayandırıldı.")
        process.exit(1)
    }

    await getMe()
    await getMeWithoutToken()
    await getMeInvalidToken()

    await getProfile()
    await getProfileWithoutToken()
    await updateProfile()
    await getUpdatedProfile()

    await registerUserB()

    if (!tokenB) {
        console.log("")
        console.log("User B token alınmadı. Note testləri dayandırıldı.")
        await logout()
        await unknownRoute()
    } else {
        await createNoteA()

        if (noteAId) {
            await readOwnNoteA()
            await userBReadNoteA()
            await userBUpdateNoteA()
            await userBPatchNoteA()
            await userBDeleteNoteA()
            await noteAStillExists()
            await getUserANotes()
            await updateNoteA()
            await patchNoteA()
        }

        await createNoteB()

        if (noteBId) {
            await readOwnNoteB()
            await userAReadNoteB()
        }

        await notesWithoutToken()
        await createNoteWithoutToken()

        await deleteNoteB()
        await deleteNoteA()
        await deletedNoteA()
        await logout()
        await unknownRoute()
    }

    console.log("")
    console.log("============================================================")
    console.log("                     TEST RESULT")
    console.log("============================================================")
    console.log(`PASSED: ${passed}`)
    console.log(`FAILED: ${failed}`)
    console.log("============================================================")

    if (failed === 0) {
        console.log("ALL WORKER API TESTS PASSED")
        process.exit(0)
    }

    console.log("SOME WORKER API TESTS FAILED")
    process.exit(1)
}

main().catch((error) => {
    console.error("")
    console.error("TEST RUNNER ERROR")
    console.error(error)
    process.exit(1)
})
