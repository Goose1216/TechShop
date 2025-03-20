const TOKEN_KEY = 'token';

export const getToken = () => {
  const cookies = document.cookie.split(';').map(cookie => cookie.trim().split('='));
  const tokenPair = cookies.find(pair => pair[0] === TOKEN_KEY);
  const token = tokenPair ? tokenPair[1] : null;
  console.log('Токен получен:', token);
  return token;
};

export const setToken = (token, expiryDays = 14) => {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + expiryDays);

  const cookieString = `${TOKEN_KEY}=${token};expires=${expiryDate.toUTCString()};path=/`;
  document.cookie = cookieString;

  console.log('Токен установлен:', token);
};

export const removeToken = () => {
  const expiryDate = new Date(0).toUTCString();
  document.cookie = `${TOKEN_KEY}=;expires=${expiryDate};path=/`;

  console.log('Токен удалён');
};
