describe("Real Estate Lead Scoring - Public UI", () => {

  it("01 - loads homepage", () => {
    cy.visit("/");
    cy.location("pathname").should("eq", "/");
    cy.get("body").should("be.visible");
  });

  it("02 - homepage has navigation", () => {
    cy.visit("/");
    cy.get("nav").should("exist");
  });

  it("03 - homepage renders content", () => {
    cy.visit("/");
    cy.get("body").should("not.be.empty");
  });

  it("04 - listings page loads", () => {
    cy.visit("/listings");
    cy.location("pathname").should("eq", "/listings");
    cy.get("body").should("be.visible");
  });

  it("05 - listings page renders content", () => {
    cy.visit("/listings");
    cy.get("body").should("not.be.empty");
  });

  it("06 - agencies marketplace loads", () => {
    cy.visit("/agencies");
    cy.location("pathname").should("eq", "/agencies");
    cy.get("body").should("be.visible");
  });

  it("07 - agencies marketplace renders content", () => {
    cy.visit("/agencies");
    cy.get("body").should("not.be.empty");
  });

  it("08 - agency compare page loads", () => {
    cy.visit("/agencies/compare");
    cy.location("pathname").should("eq", "/agencies/compare");
    cy.get("body").should("be.visible");
  });

  it("09 - login page loads", () => {
    cy.visit("/login");
    cy.location("pathname").should("eq", "/login");
    cy.get("body").should("be.visible");
  });

  it("10 - login page contains form controls", () => {
    cy.visit("/login");
    cy.get("input").should("have.length.at.least", 1);
    cy.get("button").should("have.length.at.least", 1);
  });

  it("11 - signup page loads", () => {
    cy.visit("/signup");
    cy.location("pathname").should("eq", "/signup");
    cy.get("body").should("be.visible");
  });

  it("12 - signup page contains form controls", () => {
    cy.visit("/signup");
    cy.get("input").should("have.length.at.least", 1);
    cy.get("button").should("have.length.at.least", 1);
  });

  it("13 - pricing page loads", () => {
    cy.visit("/pricing");
    cy.location("pathname").should("eq", "/pricing");
    cy.get("body").should("be.visible");
  });

  it("14 - pricing page renders content", () => {
    cy.visit("/pricing");
    cy.get("body").should("not.be.empty");
  });

  it("15 - pricing continues to agency registration after selecting Free Trial", () => {
    cy.visit("/pricing");

    cy.contains("button", "Free Trial")
      .should("exist")
      .click({ force: true });

    cy.contains("button", "Continue to Registration")
      .should("be.visible")
      .and("not.be.disabled")
      .click();

    cy.location("pathname").should("eq", "/register");
    cy.location("search").should("include", "plan=trial");
  });

  it("16 - agency registration wizard renders after selecting Free Trial", () => {
    cy.visit("/pricing");

    cy.contains("button", "Free Trial")
      .should("exist")
      .click({ force: true });

    cy.contains("button", "Continue to Registration")
      .should("be.visible")
      .click();

    cy.location("pathname").should("eq", "/register");
    cy.location("search").should("include", "plan=trial");

    cy.get("input").should("have.length.at.least", 1);
    cy.get("button").should("have.length.at.least", 1);
    cy.get("body").should("be.visible");
  });

  it("17 - registration pending page loads", () => {
    cy.visit("/register/pending");
    cy.location("pathname").should("eq", "/register/pending");
    cy.get("body").should("be.visible");
  });

  it("18 - accept invite page loads", () => {
    cy.visit("/accept-invite");
    cy.location("pathname").should("eq", "/accept-invite");
    cy.get("body").should("be.visible");
  });

  it("19 - about page loads", () => {
    cy.visit("/about");
    cy.location("pathname").should("eq", "/about");
    cy.get("body").should("be.visible");
  });

  it("20 - trial expired page loads", () => {
    cy.visit("/trial-expired");
    cy.location("pathname").should("eq", "/trial-expired");
    cy.get("body").should("be.visible");
  });

  it("21 - protected dashboard redirects unauthenticated users", () => {
    cy.visit("/dashboard");
    cy.location("pathname").should("eq", "/login");
  });

  it("22 - platform login loads", () => {
    cy.visit("/platform/login");
    cy.location("pathname").should("eq", "/platform/login");
    cy.get("body").should("be.visible");
  });

  it("23 - platform login contains form controls", () => {
    cy.visit("/platform/login");
    cy.get("input").should("have.length.at.least", 1);
    cy.get("button").should("have.length.at.least", 1);
  });

  it("24 - protected platform redirects unauthenticated users", () => {
    cy.visit("/platform");
    cy.location("pathname").should("eq", "/platform/login");
  });

  it("25 - protected platform agencies redirects unauthenticated users", () => {
    cy.visit("/platform/agencies");
    cy.location("pathname").should("eq", "/platform/login");
  });

  it("26 - unknown route renders not-found page", () => {
    cy.visit("/this-route-does-not-exist");
    cy.location("pathname").should("eq", "/this-route-does-not-exist");
    cy.get("body").should("be.visible");
  });

  it("27 - unknown route has rendered content", () => {
    cy.visit("/this-route-does-not-exist");
    cy.get("body").should("not.be.empty");
  });

  it("28 - property route renders", () => {
    cy.visit("/properties/000000000000000000000000");
    cy.location("pathname")
      .should("eq", "/properties/000000000000000000000000");
    cy.get("body").should("be.visible");
  });

  it("29 - apply-to-agency route renders", () => {
    cy.visit("/agencies/test-agency/apply");
    cy.location("pathname")
      .should("eq", "/agencies/test-agency/apply");
    cy.get("body").should("be.visible");
  });

  it("30 - agency profile route renders", () => {
    cy.visit("/agencies/test-agency");
    cy.location("pathname")
      .should("eq", "/agencies/test-agency");
    cy.get("body").should("be.visible");
  });

});