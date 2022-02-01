import * as utils from '../src/index';

describe('Userlane Career Page Functional Checks', () => {
	before(() => {
		cy.visit(utils.careerPagePath);
	});

	it('should search and apply for automation job opening', () => {
		cy.scrollTo('bottom');
		// work around since cypress doesn't open links in a new tab
		cy.contains('Automation Test Engineer (Cypress/Typescript)').invoke('removeAttr', 'target').click();
		cy.get(utils.applyButton).click();
		cy.get(utils.nameInput).clear().type(utils.applicantName);
		cy.get(utils.emailInput).clear().type(utils.applicantEmail);
		cy.get(utils.phoneInput).clear().type(utils.phoneNumber);
		cy.get(utils.orgInput).clear().type(utils.organization);
		cy.get(utils.additionalCards).first().clear().type(utils.noticePeriod);
		cy.get(utils.additionalCards).last().clear().type(utils.salary);
		cy.get(utils.placeOfLivingYes).check();
		cy.get(utils.cypressExperienceYes).check();
		cy.intercept(utils.parseResumeUrl).as('uploadResume');
		cy.fixture('mohammad-shalabi-CV.pdf', 'binary').then(Cypress.Blob.binaryStringToBlob)
			.then((fileContent) => {
				cy.get('[data-qa="input-resume"]').attachFile(
					{ fileContent, fileName: 'mohammad-shalabi-CV.pdf', mimeType: 'application/pdf' },
					{ subjectType: 'input' }
				);
			});
		cy.wait('@uploadResume');
		cy.get(utils.captchaIframe).then((iframe) => {
			const body = iframe.contents().find('body');
			cy.intercept(utils.getCaptchaUrl).as('getCaptcha');
			cy.wrap(body).find(utils.checkbox).click();
			utils.waitForSuccessfulStatus('@getCaptcha');
		});
		// we can hack the UI of h-captcha but it won't actually work
		// we need a valid UUID token to pass it in the response body
		cy.get(utils.mainContentCaptchaIframe).then((iframe) => {
			const body = iframe.contents().find('body');
			cy.wrap(body).find(utils.captchaImages).eq(0).click();
			cy.wrap(body).find(utils.captchaImages).eq(1).click();
			cy.wrap(body).find(utils.captchaSubmitButton).click();
			cy.wait(2000);
			cy.wrap(body).find(utils.captchaImages).eq(1).click();
			cy.wrap(body).find(utils.captchaImages).eq(2).click();
			cy.wrap(body).find(utils.captchaImages).eq(3).click();
			cy.intercept('POST', utils.checkCaptchaUrl, { fixture: 'captchaData' }).as('hcaptcha');
			cy.wrap(body).find(utils.captchaSubmitButton).click();
			cy.wait('@hcaptcha');
		});

		// The test will fail since the h-captcha
		cy.intercept('POST', utils.submitApplicationUrl).as('submit');
		cy.get(utils.submitButton).click();
		utils.waitForSuccessfulStatus('@submit');
	});
});
