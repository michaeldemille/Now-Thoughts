import {Component} from '@stencil/core';

@Component({
  tag: 'help-modal',
  styleUrl: 'help-modal.css'
})
export class HelpModal {


  constructor() {
  }

  async loadMenu() {
    console.log('loadMenu');
    // initialize controller
    const modalController = document.querySelector('ion-modal-controller');
    await modalController.componentOnReady();

    // create component to open
    const element = document.createElement('div');
    element.innerHTML = `
  <ion-content class="menu-modal-content"">
    <div class="menu-container">
      <img id="close-button" class="close-icon" src='../../assets/images/close.svg'></img>
    </div>
    <div class="menu-links-wrapper">
      <div class="menu-links">
       <div>
          <p>Now Thoughts analyzes the tone of what people are saying on social media about a specific subject to see if it is positive or negative.</p>
          <p>Single Trend returns the current sentiment and a select few tweets regarding that trend.</p>
          <p>Multi Trend keeps stacking your searches allowing you to compare multiple trends at once.</p>
          <p>With now thoughts you can check out what the impact of the latest news in pop culture, the latest scandal in politics, the latest win for your favorite team in sports and so much more.</p>
          <p>Now Thoughts is a PWA meaning you can download it and use it just like any other app on your device.</p>
          <p>Don't know how to download a PWA? See the simple step by step instructions here: <a href="https://primaryplaylist.com/help" target="_blank">PWA Download Instructions</a></p>
          <p>Finally Now Thoughts has been a fun project brought to you by <a href="http://cleansitedesigns.com" target="_blank">Clean Site Designs.</a> We hope you enjoy.</p>
       </div>
      </div>
    </div>
  </ion-content>
  `;

    // listen for close event
    const button = element.querySelector('#close-button');
    button.addEventListener('click', () => {
      modalController.dismiss();
    });

    //routing
    const links:any = element.querySelectorAll('.menu-link');
    for (const link of links) {
      link.addEventListener('click', async (event) => {
        console.log('event', event);
        const routeLink = event.srcElement.id;
        console.log('routeLink', routeLink);
        modalController.dismiss();
        const router = document.querySelector('ion-router');
        if (router) {
          await router.componentOnReady();
          return router.push(routeLink);
        }
        return Promise.resolve();
      })
    }

    // present the modal
    const modalElement = await modalController.create({
      component: element,
      cssClass: 'help-modal'
    });
    modalElement.present();
  }

  render() {
    return [
        <img class="help-icon" src='../../assets/images/help-circle.svg' onClick={() => this.loadMenu()}></img>,
      <ion-modal-controller></ion-modal-controller>
    ]
  }
}
