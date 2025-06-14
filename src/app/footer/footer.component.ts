import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {

  installApp() {
    // Replace with your actual APK or app download URL
    const appLink = 'https://zingy-chaja-4ea57d.netlify.app/Car-Care.apk';
    window.open(appLink, '_blank');
  }

}
