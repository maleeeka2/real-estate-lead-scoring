const fs = require("fs");

const file = "./real-estate-api.postman_collection.json";
const collection = JSON.parse(fs.readFileSync(file, "utf8"));

const BASE_URL = "https://real-estate-lead-scoring.vercel.app";

const generatedNames = [
    "Properties - List",
    "Property - Get First Property",
    "Properties - Estimate Price",
    "Auth - Current User",
    "Security - Inquiry List RBAC"
];

/* =========================================================
   FIX LOGIN TOKEN STORAGE
   ========================================================= */

const loginRequest = collection.item.find(
    (item) => item.name === "New Request"
);

if (loginRequest && loginRequest.event) {
    const testEvent = loginRequest.event.find(
        (event) => event.listen === "test"
    );

    if (testEvent && testEvent.script) {
        const existingScript = testEvent.script.exec.join("\n");

        if (!existingScript.includes("collectionVariables.set")) {
            testEvent.script.exec.push(
                "",
                'pm.collectionVariables.set("accessToken", jsonData.accessToken);'
            );
        }
    }
}

/* =========================================================
   REMOVE OLD GENERATED REQUESTS
   ========================================================= */

collection.item = collection.item.filter(
    (item) => !generatedNames.includes(item.name)
);

/* =========================================================
   REQUEST HELPER
   ========================================================= */

function addRequest(name, method, url, options = {}) {

    const request = {
        name,
        request: {
            method,
            header: options.header || [],
            url
        },
        event: []
    };

    if (options.auth !== false) {
        request.request.auth = {
            type: "bearer",
            bearer: [
                {
                    key: "token",
                    value: "{{accessToken}}",
                    type: "string"
                }
            ]
        };
    }

    if (options.body) {
        request.request.body = {
            mode: "raw",
            raw: JSON.stringify(options.body),
            options: {
                raw: {
                    language: "json"
                }
            }
        };
    }

    if (options.test) {
        request.event.push({
            listen: "test",
            script: {
                type: "text/javascript",
                exec: options.test.trim().split("\n")
            }
        });
    }

    collection.item.push(request);
}


/* =========================================================
   1. PROPERTIES - LIST
   ========================================================= */

addRequest(
    "Properties - List",
    "GET",
    `${BASE_URL}/api/properties?page=1&limit=10`,
    {
        auth: false,

        test: `
(function () {

    pm.test("Properties returns 200", function () {
        pm.response.to.have.status(200);
    });

    var body = pm.response.json();

    pm.test("Properties items exist", function () {
        pm.expect(body.items).to.be.an("array");
    });

    pm.test("Pagination exists", function () {
        pm.expect(body.pagination).to.be.an("object");
    });

    if (body.items && body.items.length > 0) {
        pm.collectionVariables.set(
            "propertyId",
            body.items[0]._id
        );
    }

    pm.test("First property ID saved", function () {
        pm.expect(
            pm.collectionVariables.get("propertyId")
        ).to.exist;
    });

})();
`
    }
);


/* =========================================================
   2. PROPERTY DETAIL
   ========================================================= */

addRequest(
    "Property - Get First Property",
    "GET",
    `${BASE_URL}/api/properties/{{propertyId}}`,
    {
        auth: false,

        test: `
(function () {

    pm.test("Property detail returns success", function () {
        pm.response.to.have.status(200);
    });

    var body = pm.response.json();

    pm.test("Property detail is an object", function () {
        pm.expect(body).to.be.an("object");
    });

    pm.test("Property has an ID", function () {
        pm.expect(body).to.have.property("_id");
    });

})();
`
    }
);


/* =========================================================
   3. PRICE ESTIMATE
   ========================================================= */

addRequest(
    "Properties - Estimate Price",
    "POST",
    `${BASE_URL}/api/properties/estimate-price`,
    {
        auth: false,

        header: [
            {
                key: "Content-Type",
                value: "application/json"
            }
        ],

        body: {
            city: "Lahore",
            area: 10,
            bedrooms: 3,
            bathrooms: 2
        },

        test: `
(function () {

    pm.test("Estimate price returns 200", function () {
        pm.response.to.have.status(200);
    });

    var body = pm.response.json();

    pm.test("Estimate response is JSON", function () {
        pm.expect(body).to.be.an("object");
    });

})();
`
    }
);


/* =========================================================
   4. CURRENT USER
   ========================================================= */

addRequest(
    "Auth - Current User",
    "GET",
    `${BASE_URL}/api/auth/me`,
    {
        test: `
(function () {

    pm.test("Current user returns 200", function () {
        pm.response.to.have.status(200);
    });

    var body = pm.response.json();

    pm.test("Current user response is JSON", function () {
        pm.expect(body).to.be.an("object");
    });

})();
`
    }
);


/* =========================================================
   5. INQUIRY RBAC
   ========================================================= */

addRequest(
    "Security - Inquiry List RBAC",
    "GET",
    `${BASE_URL}/api/inquiries`,
    {
        test: `
(function () {

    pm.test("Inquiry endpoint responds", function () {
        pm.expect(pm.response.code).to.be.oneOf([
            200,
            401,
            403
        ]);
    });

    console.log(
        "RBAC observed status:",
        pm.response.code
    );

})();
`
    }
);


/* =========================================================
   SAVE
   ========================================================= */

fs.writeFileSync(
    file,
    JSON.stringify(collection, null, 2)
);

console.log(
    "Postman automation collection regenerated successfully."
);

console.log(
    "Total requests:",
    collection.item.length
);