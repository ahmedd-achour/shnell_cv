import { Injectable } from '@angular/core';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';
import { CvData } from './CvData';

@Injectable({
  providedIn: 'root'
})
export class CvDataService {

  constructor(private firestore: Firestore) { }

  // Fetch CV data by idref from Firestore
  fetchCVData(idref: string): Promise<CvData | null> {
    const docRef = doc(this.firestore, 'model1', idref); // model1 collection
    return getDoc(docRef)
      .then(docSnap => {
        if (docSnap.exists()) {
          return docSnap.data() as CvData; // Return the CV data if exists
        } else {
          console.error('No such document!');
          return null;
        }
      })
      .catch(error => {
        console.error('Error fetching document:', error);
        return null;
      });
  }

  // Add or update CV data in Firestore
  registerCvData(cvData: CvData, idref: string): Promise<void> {
    const docRef = doc(this.firestore, 'model1', idref);
    return setDoc(docRef, cvData);
  }
}
