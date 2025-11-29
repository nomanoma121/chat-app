import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

export const generateNewUser = () => {
  return {
    displayId: `user_${uuidv4().replace(/-/g, '').substring(0, 8)}`,
    name: `User${uuidv4().substring(0, 10)}`,
    email: `user_${uuidv4().replace(/-/g, '').substring(0, 8)}@example.com`,
    password: 'password123',
    bio: 'This is a test user.',
    iconUrl: 'http://localhost:50055/icons/users/user-gray.png',
  }
}

export const generateNewGuild = () => {
  return {
    name: `Guild_${uuidv4().replace(/-/g, '').substring(0, 8)}`,
    description: 'This is a test guild.',
    iconUrl: 'http://localhost:50055/icons/guilds/guild-gray.png',
  }
}
