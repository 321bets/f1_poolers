
import { User } from '../types';
import { dataService } from './mockDataService';

export const login = (username: string, password_raw: string): Promise<User> => {
  return new Promise(async (resolve, reject) => {
    setTimeout(async () => {
      const user = await dataService.findUserByUsername(username);
      if (user && user.password === password_raw) {
        const { password, ...userWithoutPassword } = user;
        resolve(userWithoutPassword as User);
      } else {
        reject(new Error('Invalid username or password'));
      }
    }, 500);
  });
};

export const signup = (username: string, password_raw: string, country: string, location?: {lat: number, lng: number}, timezone?: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            try {
                const newUser = await dataService.createUser(username, password_raw, 0, country, location, timezone);
                resolve(newUser);
            } catch (error: any) {
                reject(error);
            }
        }, 500);
    });
};
