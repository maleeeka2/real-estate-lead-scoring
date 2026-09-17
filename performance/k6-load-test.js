import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
    stages: [
        { duration: "30s", target: 10 },
        { duration: "1m", target: 25 },
        { duration: "1m", target: 50 },
        { duration: "30s", target: 0 },
    ],

    thresholds: {
        http_req_failed: ["rate<0.05"],
        http_req_duration: ["p(95)<3000"],
    },
};

const BASE_URL = "https://real-estate-lead-scoring.vercel.app";

export default function () {

    // Homepage
    const homepage = http.get(`${BASE_URL}/`, {
        tags: { endpoint: "homepage" },
    });

    check(homepage, {
        "Homepage returns 2xx/3xx": (r) =>
            r.status >= 200 && r.status < 400,
    });


    // Properties API
    const properties = http.get(
        `${BASE_URL}/api/properties?page=1&limit=10`,
        {
            tags: { endpoint: "properties_api" },
        }
    );

    // Log the actual HTTP status when the Properties API fails
    if (properties.status !== 200) {
        console.log(
            `Properties API failure: HTTP ${properties.status}`
        );
    }

    check(properties, {
        "Properties API returns 200": (r) => r.status === 200,

        "Properties response contains items": (r) => {
            try {
                return Array.isArray(r.json("items"));
            } catch {
                return false;
            }
        },
    });


    // Login page
    const loginPage = http.get(`${BASE_URL}/login`, {
        tags: { endpoint: "login_page" },
    });

    check(loginPage, {
        "Login page loads": (r) =>
            r.status >= 200 && r.status < 400,
    });


    sleep(1);
}