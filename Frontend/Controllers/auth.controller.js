import { signIn, signUp } from '/Services/auth.service.js';
import { redirectUser, setCurrentUser } from '/Services/session.service.js';

function getFormValue(form, selector, shouldTrim = true) {
  const input = form.querySelector(selector);
  const value = input ? input.value : '';

  return shouldTrim ? value.trim() : value;
}

function isAuthUiReady() {
  return !!(
    window.validators &&
    window.showError &&
    window.showSuccess &&
    window.formHelper
  );
}

function bindOnce(form, key, handler) {
  if (!form || form.dataset[key] === 'true') {
    return false;
  }

  form.addEventListener('submit', handler);
  form.dataset[key] = 'true';
  return true;
}

async function handleSignInSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  if (!form || !isAuthUiReady()) {
    return;
  }

  const email = getFormValue(form, 'input[type="text"]');
  const password = getFormValue(form, 'input[type="password"]');
  const errors = window.validators.validateSignIn(email, password);

  if (errors.length > 0) {
    window.showError(errors.join('\n'));
    return;
  }

  try {
    const response = await signIn({ email, password });
    setCurrentUser(response.user, response.access_token);
    window.formHelper.clearFields(form);
    window.showSuccess('Login successful! Redirecting...');

    window.setTimeout(() => {
      redirectUser();
    }, 3000);
  } catch (error) {
    window.showError('Login failed: ' + window.errorHelper.getErrorText(error));
  }
}

async function handleSignUpSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  if (!form || !isAuthUiReady()) {
    return;
  }

  const data = {
    firstname: getFormValue(form, 'input[placeholder="First Name"]'),
    lastname: getFormValue(form, 'input[placeholder="Last Name"]'),
    email: getFormValue(form, 'input[placeholder="Email"]'),
    password: getFormValue(form, 'input[type="password"]', false),
    phone: getFormValue(form, 'input[placeholder="Phone(Optional)"]'),
    address: getFormValue(form, 'input[placeholder="Address(Optional)"]'),
  };

  const errors = window.validators.validateSignUp(data);
  if (errors.length > 0) {
    window.showError(errors.join('\n'));
    return;
  }

  try {
    await signUp(data);
    window.formHelper.clearFields(form);
    window.showSuccess('Signup successful! Please sign in.');
    document.querySelector('.container')?.classList.remove('sign-up-mode');
  } catch (error) {
    window.showError('Signup failed: ' + window.errorHelper.getErrorText(error));
  }
}

export function initSignInController() {
  const signInForm = document.querySelector('.sign-in-form');
  bindOnce(signInForm, 'authSignInBound', handleSignInSubmit);
}

export function initSignUpController() {
  const signUpForm = document.querySelector('.sign-up-form');
  bindOnce(signUpForm, 'authSignUpBound', handleSignUpSubmit);
}
