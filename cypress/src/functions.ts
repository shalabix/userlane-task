/**
 * Wait for a request to be done successfully
 *
 * @param {object} alias request data object
 */
export const waitForSuccessfulStatus = (alias) => {
  cy.wait(alias).then(({ response }) => {
    expect(response.statusCode).to.eq(200);
  });
};
