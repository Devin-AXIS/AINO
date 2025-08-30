const MOCK_EMAIL = "admin@aino.com";
const MOCK_PASS = "admin123";
export async function loginSvc(body) {
    if (body.email === MOCK_EMAIL && body.password === MOCK_PASS) {
        return {
            token: "test-token",
            user: {
                id: "u-1",
                email: MOCK_EMAIL,
                name: "Admin"
            }
        };
    }
    throw new Error("INVALID_CREDENTIALS");
}
//# sourceMappingURL=service.js.map