/**
 * E2E Test: Guest Shopping Flow
 * Guest browses catalog, adds to cart, hits login gate at checkout
 */
describe('Guest Shopping Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load homepage with product categories', () => {
    cy.get('[data-cy="category-grid"]').should('exist');
    cy.get('[data-cy="product-card"]').should('have.length.greaterThan', 0);
  });

  it('should allow guest to add items to cart', () => {
    cy.get('[data-cy="add-to-cart-btn"]').first().click();
    cy.get('[data-cy="cart-bar"]').should('be.visible');
    cy.get('[data-cy="cart-item-count"]').should('contain', '1');
  });

  it('should redirect to login when guest tries to checkout', () => {
    cy.get('[data-cy="add-to-cart-btn"]').first().click();
    cy.get('[data-cy="checkout-btn"]').click();
    cy.url().should('include', '/login');
  });

  it('should preserve cart after login', () => {
    cy.get('[data-cy="add-to-cart-btn"]').first().click();
    cy.get('[data-cy="checkout-btn"]').click();
    // Login flow
    cy.get('[data-cy="phone-input"]').type('0712345678');
    cy.get('[data-cy="send-otp-btn"]').click();
    '1234'.split('').forEach((digit, i) => {
      cy.get(`[data-cy="otp-digit-${i}"]`).type(digit);
    });
    cy.get('[data-cy="verify-otp-btn"]').click();
    // Cart should be preserved
    cy.get('[data-cy="cart-item-count"]').should('contain', '1');
  });
});
