import {Component} from '@stencil/core';

@Component({
  tag: 'menu-modal',
  styleUrl: 'menu-modal.css'
})
export class MenuModal {


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
      <img id="close-button" class="menu-icon" src='../../assets/images/close.svg'></img>
    </div>
    <div class="menu-links-wrapper">
      <div class="menu-links">
        <div id="home" class="menu-link">home</div>
        <div id="comparison" class="menu-link">comparison</div>
        <div class="menu-link">watching</div>
        <div class="menu-link">trending</div>
        <div id="profile" class="menu-link">profile</div>
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
      cssClass: 'menu-modal'
    });
    modalElement.present();
  }

  render() {
    return [
      <div class="menu-container">
        <img class="menu-icon" src='../../assets/images/navicon.svg' onClick={() => this.loadMenu()}></img>
      </div>,
      <ion-modal-controller></ion-modal-controller>
    ]
  }
}
