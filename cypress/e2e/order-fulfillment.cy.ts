/**
 * E2E Test: Order Fulfillment Flow
 * Login → browse → add to cart → checkout → M-Pesa → order tracking
 */
describe('Order Fulfillment Flow', () => {
  before(() => {
    cy.visit('/');
    // Login as test user (mocked in test environment)
    cy.get('[data-cy="phone-input"]').type('0712000001');
    cy.get('[data-cy="send-otp-btn"]').click();
    '9999'.split('').forEach((digit, i) => {
      cy.get(`[data-cy="otp-digit-${i}"]`).type(digit);
    });
    cy.get('[data-cy="verify-otp-btn"]').click();
  });

  it('should complete checkout with M-Pesa', () => {
    cy.get('[data-cy="add-to-cart-btn"]').first().click();
    cy.get('[data-cy="checkout-btn"]').click();
    
    // Address step
    cy.get('[data-cy="address-select"]').first().click();
    cy.get('[data-cy="continue-to-payment"]').click();
    
    // Payment step - M-Pesa
    cy.get('[data-cy="payment-mpesa"]').click();
    cy.get('[data-cy="mpesa-phone"]').clear().type('0712000001');
    cy.get('[data-cy="place-order-btn"]').click();
    
    // Should show pending payment state
    cy.get('[data-cy="payment-pending"]').should('be.visible');
  });

  it('should show order tracking after payment confirmed', () => {
    cy.visit('/orders');
    cy.get('[data-cy="order-row"]').first().click();
    cy.get('[data-cy="order-timeline"]').should('exist');
  });
});
