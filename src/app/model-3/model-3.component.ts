import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getFirestore, doc, getDoc, DocumentData } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { environment } from 'src/environement'; // Corrected import path

@Component({
  selector: 'app-model-3',
  templateUrl: './model-3.component.html',
  styleUrls: ['./model-3.component.css']
})
export class Model3Component implements OnInit {
  cvData: any = {
    name: '',
    title: '',
    photo: '',
    email: '',
    phone: '',
    address: '',
    presentation: '',
    skills: [],
    languages: [],
    hobbies: [],
    experiences: [],
    education: [],
    itSkills: [],
    profile: ''
  };
  loading: boolean = true;
  error: string | null = null;
  private firestore = getFirestore(initializeApp(environment.firebaseConfig));

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const idref = this.route.snapshot.paramMap.get('idref');
    if (idref) {
      this.fetchCVData(idref);
    } else {
      this.loading = false;
      this.error = "No CV ID provided.";
    }
  }

  fetchCVData(idref: string): void {
    this.loading = true;
    this.error = null;

    const docRef = doc(this.firestore, 'model1', idref);
    getDoc(docRef)
      .then(docSnap => {
        if (docSnap.exists()) {
          this.cvData = docSnap.data();
          console.log('CV Data:', this.cvData);
        } else {
          console.error('No such document!');
          this.error = 'CV not found.';
        }
      })
      .catch(error => {
        console.error('Error fetching document:', error);
        this.error = 'Error loading CV.';
      })
      .finally(() => {
        this.loading = false;
      });
  }
}
