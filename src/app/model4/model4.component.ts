import { Component } from '@angular/core';
import { initializeApp } from "firebase/app"; // Import initializeApp
import { getFirestore, collection, addDoc } from "firebase/firestore"; // Modular imports
import { environment } from 'src/environement'; // Import your environment
import { CvData } from '../CvData'; // Import your interface
import Swal from 'sweetalert2'; // Import SweetAlert2
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

@Component({
  selector: 'app-model4',
  templateUrl: './model4.component.html',
  styleUrls: ['./model4.component.css']
})
export class Model4Component {
  cvData: CvData = {
    name: '',
    jobTitle: '',
    photo: '',
    email: '',
    phone: '',
    address: '',
    skills: [],       // Initialized as empty array of strings
    hobbies: [],      // Initialized as empty array of strings
    profileDescription: '',
    experiences: [],  // Initialized as empty array of Experiences
    education: [],    // Initialized as empty array of Educations
    language: [],     // Initialized as empty array of strings
    github: '',
    facebook: '',
    linkedin: '',
    instagram: '',
    web: '',
    other1: '',
    other2: '',
    other3: ''
  };

  private firestore = getFirestore(initializeApp(environment.firebaseConfig));

  async onSubmit() {
    if (this.isFormValid()) {
      try {
        const model1Collection = collection(this.firestore, 'model1');
        await addDoc(model1Collection, this.cvData);

        // Show success alert after successful submission
        Swal.fire({
          title: 'Success!',
          text: 'Your CV data has been saved successfully.',
          icon: 'success',
          confirmButtonText: 'Great'
        });

        console.log("CV data saved successfully!");

        // Correctly reset the form:
        this.cvData = {
          name: '',
          jobTitle: '',
          photo: '',
          email: '',
          phone: '',
          address: '',
          skills: [],
          hobbies: [],
          profileDescription: '',
          experiences: [],  // Reset as empty array of Experiences
          education: [],    // Reset as empty array of Educations
          language: [],
          github: '',
          facebook: '',
          linkedin: '',
          instagram: '',
          web: '',
          other1: '',
          other2: '',
          other3: ''
        };

      } catch (error) {
        // Show error alert if something goes wrong while saving data
        console.error("Error saving CV data:", error);

        Swal.fire({
          title: 'Oops...',
          text: 'Something went wrong while saving your CV. Please try again.',
          icon: 'error',
          confirmButtonText: 'Retry'
        });
      }
    } else {
      // Show validation error alert if the form is invalid
      Swal.fire({
        title: 'Validation Error',
        text: 'Please fill in all required fields (Basic Information, Profile Description, at least one Skill, Hobby, Language, and Experience).',
        icon: 'warning',
        confirmButtonText: 'Got it'
      });
    }
  }

  isFormValid(): boolean {
    return !!(
      this.cvData.name &&
      this.cvData.email &&
      this.cvData.profileDescription &&
      this.cvData.skills.length > 0 &&
      this.cvData.hobbies.length > 0 &&
      this.cvData.language.length > 0 &&
      this.cvData.experiences.length > 0
    );
  }

  addSkill(skill: string) {
    if (skill && skill.trim() !== "") {
      this.cvData.skills.push(skill.trim());
    }
  }

  removeSkill(index: number) {
    this.cvData.skills.splice(index, 1);
  }

  addHobby(hobby: string) {
    if (hobby && hobby.trim() !== "") {
      this.cvData.hobbies.push(hobby.trim());
    }
  }

  removeHobby(index: number) {
    this.cvData.hobbies.splice(index, 1);
  }

  addLanguage(language: string) {
    if (language && language.trim() !== "") {
      this.cvData.language.push(language.trim());
    }
  }

  removeLanguage(index: number) {
    this.cvData.language.splice(index, 1);
  }

  addExperience(experience: {position: string, company: string, date: string, description: string}) {
    if (experience.position.trim() !== "" || experience.company.trim() !== "" || experience.date.trim() !== "" || experience.description.trim() !== "") {
      this.cvData.experiences.push(experience);
    }
  }

  removeExperience(index: number) {
    this.cvData.experiences.splice(index, 1);
  }

  addEducation(educationItem: {degree: string, institution: string, year: string}) {
    if (educationItem.degree.trim() !== "" || educationItem.institution.trim() !== "" || educationItem.year.trim() !== "") {
      this.cvData.education.push(educationItem);
    }
  }

  removeEducation(index: number) {
    this.cvData.education.splice(index, 1);
  }
  private storage = getStorage();

  async uploadPhoto(event: any) {
    const file = event.target.files[0];
    if (file) {
      const storageRef = ref(this.storage, `shnell_cv/${file.name}`);
      try {
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        this.cvData.photo = downloadURL;
      } catch (error) {
        console.error("Error uploading file:", error);
        Swal.fire({
          title: 'Upload Failed',
          text: 'There was an error uploading your photo.',
          icon: 'error',
          confirmButtonText: 'Try Again'
        });
      }
    }
  }


}
