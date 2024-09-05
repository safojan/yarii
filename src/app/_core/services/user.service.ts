import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IUser } from 'src/app/shared/interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private user: IUser = null;

  constructor() {}

  getCurrentUser(): IUser | null {
    return this.user;
  }
}
