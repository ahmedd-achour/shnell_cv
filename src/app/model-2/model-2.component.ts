import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { environment } from 'src/environement'; // Corrected import path
import { ChangeDetectorRef } from '@angular/core';

// Define the interface IN THE SAME FILE (or import it if it is in a separate file)
interface CvData {
  name: string;
  jobTitle: string;
  photo: string;
  headerColor: string;
  email: string;
  phone: string;
  address: string;
  skills: string;
  hobbies: string;
  profileDescription: string;
  experiences: Experience[];
  education: Education[];
  github: string;
  facebook: string;
  linkedin: string;
  instagram: string;
  web: string;
  other1: string;
  other2: string;
  other3: string;
  pdfFiles: [{name : "" , url : ""}] // Add pdfFiles array

}

interface Experience {
  position: string;
  company: string;
  date: string;
  description: string;
}

interface Education {
  degree: string;
  institution: string;
  year: string;
}

@Component({
  selector: 'app-model-2',
  templateUrl: './model-2.component.html',
  styleUrls: ['./model-2.component.css']
})
export class Model2Component implements OnInit {
  cvData: CvData | null = null; // Type as CvData or null
  loading: boolean = true;
  error: string | null = null;
  private firestore = getFirestore(initializeApp(environment.firebaseConfig));

  constructor(private route: ActivatedRoute, private cdRef: ChangeDetectorRef) {}

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
          this.cvData = docSnap.data() as CvData;
          console.log("Profile Image URL:", this.cvData.photo);

          // 🔄 Force UI update
          this.cdRef.detectChanges();
        } else {
          console.error('No such document!');
          this.error = "CV not found.";
        }
      })
      .catch(error => {
        console.error('Error fetching document:', error);
        this.error = "Error loading CV.";
      })
      .finally(() => {
        this.loading = false;
      });
  }
}
