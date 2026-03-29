export default function authHeader() {
    let token = localStorage.getItem('sso-token');
    if (token) {
      	return { Authorization: 'Bearer ' + token };
    } else {
      	return {};
    }
}
