import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { getFirestore, collection, getDocs, doc, updateDoc, getDoc, query, where, addDoc, GeoPoint, onSnapshot, Timestamp } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { environment } from '../../environement';
import Swal from 'sweetalert2';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { NgZone } from '@angular/core';
import { deleteDoc,  } from 'firebase/firestore';

// import { deleteDoc, collection, query, where, getDocs, doc } from 'firebase/firestore';



// Register Chart.js components
Chart.register(...registerables);

interface UserData {
  id?: string;
  name: string;
  bloodType: string;
  cin: string;
  phoneNumber: string;
  yearOfBirth: string;
  androidId: string;
  carCode: string;
  // carImage:string; // 👈 initialize image URL field

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
export class RegistercarsComponent implements OnInit, OnDestroy {


  

  selectedProductId: string = '';
  products: any[] = []; // List of products from Firestore
  







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

  constructor(
    public cdRef: ChangeDetectorRef,
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone

  ) {}

  totalCars: number = 0;
  totalApprovedUsers: number = 0;
  totalPendingUsers: number = 0;
  totalNotAcceptedUsers: number = 0;
  totalDocuments: number = 0;

  dropdownOpen: boolean = false;

  openedDropdownUserId: string | null = null;

  toggleDropdown(userId: string) {
    this.openedDropdownUserId = this.openedDropdownUserId === userId ? null : userId;
  }
  
  isDropdownOpen(userId: string): boolean {
    return this.openedDropdownUserId === userId;
  }
  


closeDropdown() {
  this.dropdownOpen = false;
}

async getProducts(): Promise<void> {
  try {
    const querySnapshot = await getDocs(collection(this.firestore, 'products'));
    this.products = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
  }
}



  // Add chart property
  userStatsChart: any;
  // Add subscription for Firebase data
  private userSubscription: Subscription;
  // Add monthly data arrays
  monthlyRegistrations: number[] = Array(12).fill(0);
  monthlyApprovals: number[] = Array(12).fill(0);

  voitureCount = 0;
  onHeldCount = 0;

  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
  };
  barChartType: ChartType = 'bar';
  barChartData = {
    labels: ['voiture', 'onHeld'],
    datasets: [
      { data: [0, 0], label: 'Count' }
    ]
  };


  async ngOnInit(): Promise<void> {
    this.loading = true;
    try {
      await this.fetchUsers();
      // await this.getUsers();
      await this.fetchCarStats();
      this.calculateUserStats();
      this.autoPassData();
    } catch (error) {
      console.error('Error initializing component:', error);
      this.error = "Failed to initialize. Please refresh the page.";
    } finally {
      this.loading = false;
      this.cdRef.detectChanges();
    }
  
      const productCollection = collection(this.firestore, 'products');
      onSnapshot(productCollection, (snapshot) => {
        this.products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      });
      const onHeldSnap = await getDocs(collection(this.firestore, 'onHeld'));
      this.onHeldCount = onHeldSnap.size;
  
      const voitureSnap = await getDocs(collection(this.firestore, 'voiture'));
      this.voitureCount = voitureSnap.size;
  
      // Update chart data
      this.barChartData.datasets[0].data = [this.voitureCount, this.onHeldCount];
    
    
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
  getSubscriptionType(duration: string): string {
    switch (duration) {
      case '6':
        return 'bronze';
      case '9':
        return 'platinum';
      case '12':
        return 'gold';
      default:
        return 'bronze';
    }
  }
  
  // Function to handle new car registration
  
  async registerNewCar() {
    if (!this.newCar.carCode || !this.newCar.latitude || !this.newCar.longitude || !this.selectedProductId) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please fill in all fields.'
  // Route to abonnement after alert
      });
      return;
    }
  
    try {
      const voitureRef = collection(this.firestore, 'voiture');
  
      const location = new GeoPoint(this.newCar.latitude, this.newCar.longitude);
      const expiryDate = this.calculateExpiryDate(this.newCar.expiryDuration);
      const selectedProduct = this.products.find(p => p.id === this.selectedProductId);
      const subscriptionType = this.getSubscriptionType(this.newCar.expiryDuration);
  
      await addDoc(voitureRef, {
        carCode: this.newCar.carCode,
        name:this.newCar.name,
        carImage: this.newCar.carImage, // 🔥 add this line
        expiry: expiryDate,
        location: location,
        repair: this.newCar.repair,
        productId: this.selectedProductId,
        productName: selectedProduct?.name || 'Unknown',
        startDate: Timestamp.now(),
        subscriptionType: subscriptionType // Add subscription type
      });
  
      this.newCar = {
        carCode: '',
        name:'',
        latitude: null,
        longitude: null,
        expiryDuration: '6',
        repair: true,
        carImage: '' // 👈 initialize image URL field

      };
      this.selectedProductId = '';
  
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Car registered successfully!'
      }).then(() => {
        this.ngZone.run(() => this.router.navigate(['/cars']));
      });
      
    } catch (error) {
      console.error('Error registering new car:', error);
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: 'Failed to register car. Please try again.'
      });
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
    name:'',
    latitude: null, // Latitude for the location
    longitude: null, // Longitude for the location
    expiryDuration: '6', // Default expiry duration (6 months)
    repair: true ,// Default repair value
    carImage: '' // 👈 initialize image URL field

  };


async deleteCar(user: any) {
  try {
    // Confirm the deletion with the user
    const result = await Swal.fire({
      title: `Delete ${user.name}'s car?`,
      text: "This will remove the car from both 'onHeld' and 'voiture' collections.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    // 1. Delete from `onHeld`
    const onHeldDocRef = doc(this.firestore, `onHeld/${user.id}`);
    await deleteDoc(onHeldDocRef);

    // 2. Find and delete from `voiture` where carCode matches
    const voitureQuery = query(collection(this.firestore, 'voiture'), where('carCode', '==', user.carCode));
    const voitureSnapshot = await getDocs(voitureQuery);

    voitureSnapshot.forEach(async (docSnap) => {
      await deleteDoc(doc(this.firestore, 'voiture', docSnap.id));
    });

    Swal.fire({
      icon: 'success',
      title: 'Deleted!',
      text: `Car ${user.carCode} has been removed from the system.`,
      timer: 2000,
      showConfirmButton: false
    });

    // Optionally: remove from UI list
    this.filteredUsers = this.filteredUsers.filter(u => u.id !== user.id);

  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Deletion Failed',
      text: 'An error occurred while deleting the car.',
    });
    console.error(error);
  }}

async updateRole(user: any) {
  try {
    const userRef = doc(this.firestore, `onHeld/${user.id}`);

    // Define updates based on role
    let updates: any = { role: user.role };

    if (user.role === 'owner') {
      updates.isOwnerAccepted = true;
      updates.isAdminApproved = false;
    } else if (user.role === 'member') {
      updates.isOwnerAccepted = false;
      updates.isAdminApproved = false;
    }

    await updateDoc(userRef, updates);

    // Update the local object (if needed in the UI)
    user.isOwnerAccepted = updates.isOwnerAccepted;
    user.isAdminApproved = updates.isAdminApproved;

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
  
  // async deleteCar(carCode: string) {
  //   try {
  //     const carDocRef = doc(this.firestore, 'voiture', carCode);
  //     await deleteDoc(carDocRef);
  //     alert('Car deleted successfully!');
  //     // Optionally refresh the list after deletion
  //     // this.getUsers(); // or however you're re-fetching users
  //   } catch (error) {
  //     console.error('Error deleting car:', error);
  //     alert('Failed to delete car.');
  //   }
  
  // }

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

  // async approveUser(userId: string | undefined): Promise<void> {
  //   if (!userId) return;

  //   try {
  //     await updateDoc(doc(this.firestore, 'onHeld', userId), {
  //       isAdminApproved: true,
  //       isOwnerAccepted: true
  //     });
  //     await this.fetchUsers();
  //   } catch (error) {
  //     console.error('Error approving user:', error);
  //     this.error = "Failed to approve user. Please try again.";
  //   }
  // }

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

  async fetchCarStats(): Promise<void> {
    try {
      const carsSnapshot = await getDocs(collection(this.firestore, 'voiture'));
      this.totalCars = carsSnapshot.size;
    } catch (error) {
      console.error('Error fetching car stats:', error);
    }
  }

  calculateUserStats(): void {
    // Count approved users (isAdminApproved is true)
    this.totalApprovedUsers = this.users.filter(user => user.isAdminApproved).length;
    
    // Count pending users (isOwnerAccepted is true but isAdminApproved is false)
    this.totalPendingUsers = this.users.filter(user => 
      user.isOwnerAccepted && !user.isAdminApproved
    ).length;
    
    // Count not accepted users (isOwnerAccepted is false)
    this.totalNotAcceptedUsers = this.users.filter(user => !user.isOwnerAccepted).length;
    
    // Count total documents
    let docCount = 0;
    this.users.forEach(user => {
      if (user.images) {
        this.getDocumentKeys().forEach(key => {
          if (user.images[key]) docCount++;
        });
      }
    });
    this.totalDocuments = docCount;
  }

  // Helper method to get user status
  getUserStatus(user: UserData): string {
    if (user.isAdminApproved) return 'Approved';
    if (user.isOwnerAccepted) return 'Pending';
    return 'Not Accepted';
  }

  // Method to approve a user
  async approveUser(user: UserData): Promise<void> {
    try {
      if (!user.id) {
        console.error('User ID is undefined');
        return;
      }
      
      await updateDoc(doc(this.firestore, 'onHeld', user.id), {
        isAdminApproved: true
      });
      
      // Update local user object
      user.isAdminApproved = true;
      
      // Recalculate stats
      this.calculateUserStats();
      
      Swal.fire({
        icon: 'success',
        title: 'User Approved!',
        text: `${user.name} has been approved successfully.`,
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error approving user:', error);
      Swal.fire({
        icon: 'error',
        title: 'Approval Failed',
        text: 'Could not approve user. Please try again.'
      });
    }
  }

  // Method to handle search
  onSearchChange(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      user.name?.toLowerCase().includes(searchTerm) ||
      user.cin?.toLowerCase().includes(searchTerm) ||
      user.phoneNumber?.toLowerCase().includes(searchTerm) ||
      user.carCode?.toLowerCase().includes(searchTerm)
    );
    this.sortTable(this.sortColumn);
  }

  // Method to view user documents
  viewDocuments(user: UserData): void {
    const documentsList = this.getDocumentKeys()
      .filter(key => user.images && user.images[key])
      .map(key => `<li><a href="#" onclick="window.open('${user.images[key]}', '_blank'); return false;">${this.getDocumentName(key)}</a></li>`)
      .join('');

    Swal.fire({
      title: `${user.name}'s Documents`,
      html: documentsList ? `<ul class="list-unstyled">${documentsList}</ul>` : 'No documents available',
      icon: 'info',
      confirmButtonText: 'Close'
    });
  }

  processChartData(users: any[]): void {
    // Reset arrays
    this.monthlyRegistrations = Array(12).fill(0);
    this.monthlyApprovals = Array(12).fill(0);
    
    // Process each user
    users.forEach(user => {
      if (user.createdAt) {
        const createdDate = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
        const month = createdDate.getMonth();
        this.monthlyRegistrations[month]++;
        
        // If user is approved, count in approvals
        if (user.isAdminApproved) {
          const approvedDate = user.approvedAt ? 
            (user.approvedAt.toDate ? user.approvedAt.toDate() : new Date(user.approvedAt)) : 
            createdDate;
          const approvalMonth = approvedDate.getMonth();
          this.monthlyApprovals[approvalMonth]++;
        }
      }
    });
  }

  initChart(): void {
    // Destroy previous chart if it exists
    if (this.userStatsChart) {
      this.userStatsChart.destroy();
    }
    
    const ctx = document.getElementById('userStatsChart') as HTMLCanvasElement;
    if (!ctx) return;
    
    this.userStatsChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Registrations',
            data: this.monthlyRegistrations,
            borderColor: '#177dff',
            backgroundColor: 'rgba(23, 125, 255, 0.2)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          },
          {
            label: 'Approvals',
            data: this.monthlyApprovals,
            borderColor: '#35cd3a',
            backgroundColor: 'rgba(53, 205, 58, 0.2)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Users'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Month'
            }
          }
        }
      }
    });
  }


  
  logout(): void {
    this.authService.signOut();
  }


  
}





