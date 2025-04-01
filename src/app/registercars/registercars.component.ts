import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { getFirestore, collection, getDocs, doc, updateDoc, getDoc, query, where, addDoc, GeoPoint } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { environment } from 'src/environement';
import Swal from 'sweetalert2';

interface UserData {
  id?: string;
  name: string;
  bloodType: string;
  cin: string;
  phoneNumber: string;
  yearOfBirth: string;
  androidId: string;
  carCode: string;
  isOwnerAccepted: boolean;
  isAdminApproved: boolean;
  role: string;
  time: any;
  images: {
    cinFront: string | null;
    cinBack: string | null;
    bloodPaper: string | null;
    drivingLicenseFront: string | null;
    drivingLicenseBack: string | null;
  };
}

@Component({
  selector: 'app-registercars',
  templateUrl: './registercars.component.html',
  styleUrls: ['./registercars.component.css']
})
export class RegistercarsComponent implements OnInit {
  public users: UserData[] = [];
  filteredUsers: UserData[] = [];
  loading: boolean = true;
  error: string | null = null;
  sortColumn: string = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  columns = ['name', 'cin', 'phoneNumber', 'bloodType', 'yearOfBirth', 'carCode', 'status', 'documents', 'actions'];
  columnNames = {
    name: 'User',
    cin: 'CIN',
    phoneNumber: 'Phone',
    bloodType: 'Blood Type',
    yearOfBirth: 'Birth Date',
    carCode: 'Vehicle Code',
    status: 'Status',
    documents: 'Documents',
    actions: 'Actions'
  };

  public firestore = getFirestore(initializeApp(environment.firebaseConfig));

  constructor(public cdRef: ChangeDetectorRef) {}

  async ngOnInit(): Promise<void> {
    await this.fetchUsers();
    this.autoPassData();
  }
  calculateExpiryDate(duration: string): string {
    const currentDate = new Date();
    let monthsToAdd = 0;

    switch (duration) {
      case '6':
        monthsToAdd = 6;
        break;
      case '9':
        monthsToAdd = 9;
        break;
      case '12':
        monthsToAdd = 12;
        break;
      default:
        monthsToAdd = 6; // Default to 6 months
    }

    currentDate.setMonth(currentDate.getMonth() + monthsToAdd);
    return currentDate.toISOString().split('T')[0]; // Format the date as YYYY-MM-DD
  }
  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  // Function to handle new car registration
  async registerNewCar() {
    if (!this.newCar.carCode || !this.newCar.latitude || !this.newCar.longitude) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      const voitureRef = collection(this.firestore, 'voiture');

      // Create a GeoPoint for the location
      const location = new GeoPoint(this.newCar.latitude, this.newCar.longitude);

      // Calculate the expiry date based on the selected duration
      const expiryDate = this.calculateExpiryDate(this.newCar.expiryDuration);

      // Add the new car document to Firestore
      await addDoc(voitureRef, {
        carCode: this.newCar.carCode,
        expiry: expiryDate,
        location: location,
        repair: this.newCar.repair
      });

      // Reset the form after successful registration
      this.newCar = {
        carCode: '',
        latitude: null,
        longitude: null,
        expiryDuration: '6',
        repair: true
      };

      alert('Car registered successfully!');
    } catch (error) {
      console.error('Error registering new car:', error);
      alert('Failed to register car. Please try again.');
    }
  }
  async fetchUsers(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      const querySnapshot = await getDocs(collection(this.firestore, 'onHeld'));
      this.users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as UserData));

      await this.processImageUrls();
      this.filteredUsers = [...this.users];
      this.sortTable(this.sortColumn);
    } catch (error) {
      console.error('Error fetching users:', error);
      this.error = "Failed to load user data. Please try again.";
    } finally {
      this.loading = false;
      this.cdRef.detectChanges();
    }
  }

  async processImageUrls(): Promise<void> {
    const storage = getStorage();
    const promises = [];

    for (const user of this.users) {
      for (const key of this.getDocumentKeys()) {
        if (user.images[key] && typeof user.images[key] === 'string' && !user.images[key]?.startsWith('http')) {
          promises.push(
            getDownloadURL(ref(storage, user.images[key] as string))
              .then(url => user.images[key] = url)
              .catch(() => user.images[key] = null)
          );
        }
      }
    }

    await Promise.all(promises);
  }

  filterUsers(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      user.name.toLowerCase().includes(searchTerm) ||
      user.cin.toLowerCase().includes(searchTerm) ||
      user.phoneNumber.toLowerCase().includes(searchTerm) ||
      user.carCode.toLowerCase().includes(searchTerm)
    );
    this.sortTable(this.sortColumn);
  }
  async updateStatus(user: any, event: Event) {
    try {
      const selectedValue = (event.target as HTMLSelectElement).value;
      const newStatus = selectedValue === 'true'; // Convert string to boolean

      const userRef = doc(this.firestore, `onHeld/${user.id}`);
      await updateDoc(userRef, { isAdminApproved: newStatus });

      // Update the local user object
      user.isAdminApproved = newStatus;

      Swal.fire({
        icon: 'success',
        title: 'Status Updated!',
        text: `User ${user.name}'s status is now ${newStatus ? 'Approved' : 'Pending'}.`,
        timer: 2000,
        showConfirmButton: false
      });

    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: 'Could not update user status. Please try again.',
      });
    }
  }

  newCar = {
    carCode: '',
    latitude: null, // Latitude for the location
    longitude: null, // Longitude for the location
    expiryDuration: '6', // Default expiry duration (6 months)
    repair: true // Default repair value
  };

  async updateRole(user: any) {
    try {
      const userRef = doc(this.firestore, `onHeld/${user.id}`);
      await updateDoc(userRef, {
        role: user.role
      });

      Swal.fire({
        icon: 'success',
        title: 'Role Updated!',
        text: `User's role has been updated to ${user.role}.`,
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Role Update Failed',
        text: 'Could not update user role. Please try again.',
      });
    }
  }


  // View Membership Information

  async viewMembership(carCode: string) {
    try {
      // Create a query to find the document where carCode matches
      const voitureRef = collection(this.firestore, 'voiture');
      const q = query(voitureRef, where('carCode', '==', carCode));

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // If no document is found with the given carCode
        Swal.fire({
          icon: 'error',
          title: 'No Data Found',
          text: 'No membership details available for this car code.',
        });
      } else {
        // If a document is found, extract data and display
        querySnapshot.forEach((doc) => {
          const carData = doc.data();
          Swal.fire({
            title: 'Membership Details',
            html: `<b>Expiry:</b> ${carData['expiry']} <br> <b>other data:</b> ${carData['repair']}`,
            icon: 'info',
            confirmButtonText: 'OK'
          });
        });
      }
    } catch (err) {
      // Error handling
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch membership details.',
      });
    }
  }

  sortTable(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.filteredUsers.sort((a, b) => {
      let valA = a[column as keyof UserData];
      let valB = b[column as keyof UserData];

      // Special handling for nested objects
      if (column === 'status') {
        valA = this.getStatus(a);
        valB = this.getStatus(b);
      }

      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  getStatus(user: UserData): string {
    if (user.isAdminApproved) return 'Approved';
    if (user.isOwnerAccepted) return 'Pending';
    return 'Not Accepted';
  }

  getStatusClass(user: UserData): string {
    if (user.isAdminApproved) return 'approved';
    if (user.isOwnerAccepted) return 'pending';
    return 'not-accepted';
  }

  getDocumentKeys(): string[] {
    return ['cinFront', 'cinBack', 'bloodPaper', 'drivingLicenseFront', 'drivingLicenseBack'];
  }

  getDocumentName(key: string): string {
    const names: {[key: string]: string} = {
      cinFront: 'CIN Front',
      cinBack: 'CIN Back',
      bloodPaper: 'Blood Test',
      drivingLicenseFront: 'License Front',
      drivingLicenseBack: 'License Back'
    };
    return names[key] || key;
  }

  formatDate(date: any): string {
    if (!date) return 'N/A';
    try {
      if (date.toDate) return date.toDate().toLocaleDateString();
      if (date instanceof Date) return date.toLocaleDateString();
      return date;
    } catch (e) {
      return date;
    }
  }

  async approveUser(userId: string | undefined): Promise<void> {
    if (!userId) return;

    try {
      await updateDoc(doc(this.firestore, 'onHeld', userId), {
        isAdminApproved: true,
        isOwnerAccepted: true
      });
      await this.fetchUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      this.error = "Failed to approve user. Please try again.";
    }
  }

  openImage(url: string | null): void {
    if (!url) {
      alert('No document available');
      return;
    }
    window.open(url, '_blank');
  }

  viewUserDetails(user: UserData): void {
    // Implement detailed view modal if needed
    console.log('Viewing user:', user);
  }
  data = [
    { title: 'Accident Statistics', description: 'One of the most significant safety features in any vehicle is the seatbelt. Seatbelts are designed to keep occupants in their seats and prevent them from being thrown forward during a collision. In fact, seatbelt use is proven to reduce the risk of death in a crash by up to 45%. When worn correctly, seatbelts distribute the force of a collision across the strongest parts of the body, including the pelvis and chest. While modern vehicles may come with airbags and other advanced safety technologies, the seatbelt remains the most effective method to protect passengers during a crash. Many countries and states have strict seatbelt laws, and failing to buckle up can result in fines, but more importantly, it can lead to serious injury or death in an accident.' },
    { title: 'Route Facts', description: "Modern cars are equipped with a range of advanced driver assistance systems (ADAS) designed to enhance safety by reducing human error. These systems include features like lane departure warning, automatic emergency braking, adaptive cruise control, and blind-spot detection. Lane departure warning alerts drivers when they unintentionally drift out of their lane, while automatic emergency braking can help prevent or reduce the severity of a collision by automatically applying the brakes. ADAS technologies work together to provide a more comprehensive safety net, offering real-time monitoring of the vehicle's surroundings. These systems can detect potential hazards, such as pedestrians, other vehicles, or obstacles, allowing the car to react faster than the human driver could on their own."},
    { title: 'Vehicle Safety', description: "Crumple zones are an essential feature in modern car design that help absorb the impact of a collision, protecting the occupants inside. The concept behind crumple zones is simple: they are areas of the vehicle that are designed to deform and absorb energy during a crash, rather than transferring it to the passengers. In the event of a collision, the energy from the impact is spread across the vehicle’s structure, reducing the force that reaches the passengers. This helps to minimize the risk of injury. Crumple zones are typically located at the front and rear of the vehicle, as these areas are most likely to experience a direct impact in a crash. They work in conjunction with other safety features, such as airbags, to ensure the best protection for drivers and passengers."}
  ];

  // The index of the currently displayed data
  currentIndex: number = 0;
  private intervalId: any; // To store the interval for automatic transition
  prevData() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = this.data.length - 1;  // Loop back to the last item
    }
  }

  // Method to move to the next data
  nextData() {
    if (this.currentIndex < this.data.length - 1) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0;  // Loop back to the first item
    }
  }

  // Method to automatically change the data every 5 seconds
  autoPassData() {
    this.intervalId = setInterval(() => {
      this.nextData(); // Move to the next data automatically
    }, 15000); // Change every 15 seconds
  }

  // Method to set the current index to a specific item when a table row is clicked
  setCurrentIndex(index: number) {
    this.currentIndex = index;
  }

}
