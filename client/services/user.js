import axios from 'axios';
import { app } from '../src/index';

// ----------
class User {
  constructor() {
    this._usersUrl = '/users';
  }

  // get user data
  async initUser(userName, password) {
    const res = await axios.post('/users', { userName, password });
    return res.data.data;
  }

  async getUser(userName) {
    const res = await axios.get(this._usersUrl, {
      params: { userName },
    });
    return res.data.data;
  }

  async setUserState(userState) {
    await axios.put(this._usersUrl, { userName: app.user.userName, userState });
  }

  async getUserState(userName) {
    const res = await axios.get(`${this._usersUrl}/userState/${userName}`);
    const { userState } = res.data.data;
    return userState;
  }
}

export default new User();
