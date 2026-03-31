function storeToken(token) {
    localStorage.setItem('jwtToken', token);
    localStorage.removeItem('token');
}

window.storeToken = storeToken;