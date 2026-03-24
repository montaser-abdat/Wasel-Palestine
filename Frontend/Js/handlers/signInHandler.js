import { redirectUser } from '../api/redirectUserBasedOnRule.js';
import { setCurrentUser } from '../api/authService.js';

(function () {

	var signInForm = document.querySelector('.sign-in-form');

	if (!signInForm || !window.authApi) {
		return;
	}

	signInForm.addEventListener('submit', async function (e) {
		e.preventDefault();

		var email = signInForm.querySelector('input[type="text"]').value.trim();
		var password = signInForm.querySelector('input[type="password"]').value.trim();

		var errors = window.validators.validateSignIn(email, password);
		if (errors.length > 0) {
			window.showError(errors.join('\n'));
			return;
		}

		try {
			const signinResponse = await window.authApi.post('/auth/signin', { email: email, password: password });
			setCurrentUser(signinResponse.data.user, signinResponse.data.access_token);
			window.formHelper.clearFields(signInForm);
			window.showSuccess('Login successful! Redirecting...');
			// redirection based on the role.

			setTimeout(function () {
				redirectUser();
			}, 3000);




		} catch (error) {
			window.showError('Login failed: ' + window.errorHelper.getErrorText(error));
		}
	});
})();
