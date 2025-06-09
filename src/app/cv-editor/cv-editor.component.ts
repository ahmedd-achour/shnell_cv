import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cv-editor',
  templateUrl: './cv-editor.component.html',
  styleUrls: ['./cv-editor.component.css']
})
export class CvEditorComponent implements OnInit {
  cvForm: FormGroup;
  cvData: any; // Holds the data for the CV (used for preview)
  isExperienceValid: boolean = false; // Tracks whether the experience section is filled out correctly
  isEducationValid : boolean = false;

  constructor(private fb: FormBuilder, private router: Router) {
    this.cvForm = this.fb.group({
      name: ['', Validators.required],
      jobTitle: ['', Validators.required],
      photo: ['', Validators.required],
      headerColor: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      skills: ['', Validators.required],
      hobbies: ['', Validators.required],
      profileDescription: ['', Validators.required],
      experiences: this.fb.array([]),
      education: this.fb.array([]),
      github: ['', Validators.required],
      facebook: ['', Validators.required],
      linkedin: ['', Validators.required],
      instagram: ['', Validators.required],
      web: ['', Validators.required],
      other1: ['', Validators.required],
      other2: ['', Validators.required],
      other3: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Initialize the form with at least one experience and education
    this.addExperience();
    this.addEducation();
    this.checkExperienceValidity(); // Check if experience is valid on init
  }

  // Getter for experiences FormArray
  get experiences(): FormArray {
    return this.cvForm.get('experiences') as FormArray;
  }

  // Getter for education FormArray
  get education(): FormArray {
    return this.cvForm.get('education') as FormArray;
  }

  // Add an empty experience field
  addExperience(): void {
    const experience = this.fb.group({
      position: ['', Validators.required],
      company: ['', Validators.required],
      date: ['', Validators.required],
      description: ['', Validators.required]
    });
    this.experiences.push(experience);
    this.checkExperienceValidity(); // Revalidate after adding
  }

  // Add an empty education field
  addEducation(): void {
    const education = this.fb.group({
      degree: ['', Validators.required],
      institution: ['', Validators.required],
      year: ['', Validators.required]
    });
    this.education.push(education);
  }

  // Checks if the experience section is valid (has required data)
  checkExperienceValidity(): void {
    const firstExperience = this.experiences.at(0);
    this.isExperienceValid = firstExperience && firstExperience.valid;
  }

  // Form submission logic
  onSubmit(): void {
    if (this.cvForm.invalid) {
      alert('Please fill out all required fields');
      return;
    }

    // Store the data locally or send to the server (for simplicity, we'll just log it here)
    console.log(this.cvForm.value);

    // Navigate to the preview page after form submission
    this.router.navigate(['/cv-preview'], { state: { cvData: this.cvForm.value } });
  }

  // Function for preview button (directs to preview page)
  onPreview(): void {
    if (this.cvForm.invalid) {
      alert('Please fill out all required fields');
      return;
    }

    // Navigate to the preview page with form data
    this.router.navigate(['/cv-preview'], { state: { cvData: this.cvForm.value } });
  }
}
