import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  public isLoggedIn$ = this.currentUser$.pipe(map(user => !!user));






  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router,
    private afs: AngularFirestore,

  ) {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.firestore.collection('users').doc(user.uid).valueChanges()
          .subscribe((userData: any) => {
            const mergedUser = { ...user, ...userData };
            this.currentUserSubject.next(mergedUser);
            localStorage.setItem('user', JSON.stringify(mergedUser));
          });
      } else {
        this.currentUserSubject.next(null);
        localStorage.removeItem('user');
      }
    });

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  async signIn(email: string, password: string): Promise<any> {
    try {
      const result = await this.afAuth.signInWithEmailAndPassword(email, password);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async signOut(): Promise<void> {
    await this.afAuth.signOut();
    this.router.navigate(['/signin']);
  }

  async resetPassword(email: string): Promise<void> {
    try {
      return this.afAuth.sendPasswordResetEmail(email);
    } catch (error) {
      throw error;
    }
  }

  async sendEmailVerification(): Promise<void> {
    try {
      const user = await this.afAuth.currentUser;
      if (user) {
        return user.sendEmailVerification();
      }
      throw new Error('no user is currently signed in');
    } catch (error) {
      throw error;
    }
  }

  async isEmailVerified(): Promise<boolean> {
    const user = await this.afAuth.currentUser;
    return user?.emailVerified || false;
  }

  isLoggedIn(): Observable<boolean> {
    return this.afAuth.authState.pipe(map(user => !!user));
  }

  getCurrentUser(): Observable<any> {
    return this.afAuth.authState;
  }

  async reloadUser(): Promise<any> {
    const user = await this.afAuth.currentUser;
    if (user) {
      await user.reload();
      return this.afAuth.currentUser;
    }
    return null;
  }

  logout() {
    this.afAuth.signOut().then(() => {
      this.router.navigate(['/login']);
    });
  }

  async signUp(email: string, password: string): Promise<any> {
    try {
      const result = await this.afAuth.createUserWithEmailAndPassword(email, password);
      if (result.user) {
        await this.firestore.collection('users').doc(result.user.uid).set({
          email: email,
          createdAt: new Date(),
          role: 'user'
        });
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  async updateUserProfile(name: string): Promise<void> {
    try {
      const user = await this.afAuth.currentUser;
      if (user) {
        await user.updateProfile({
          displayName: name
        });

        await this.firestore.collection('users').doc(user.uid).update({
          name: name
        });
      }
    } catch (error) {
      throw error;
    }
  }



  // --- Product Methods ---

  getAllProducts() {
    return this.afs.collection('products').snapshotChanges();
  }

  addProducts(data: any) {
    return this.afs.collection('products').add(data);
  }

  deleteProducts(id: string) {
    return this.afs.collection('products').doc(id).delete();
  }

  updateProducts(id: string, data: any) {
    return this.afs.collection('products').doc(id).update(data);
  }

  // --- Auth Methods ---

  login(email: string, password: string) {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }


}
