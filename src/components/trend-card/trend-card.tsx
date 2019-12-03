import {Component, Prop} from '@stencil/core';

@Component({
  tag: 'trend-card',
  styleUrl: 'trend-card.css'
})
export class TrendCard {

  @Prop() trend:any;

  // @State() isPositive = true;


  constructor() {
  }

  componentWillLoad() {

  }

  // @Watch ('trend')
  // watchIsVisible() {
  //   console.log('this.trend', this.trend);
  //   if (this.trend.score <= 0) {
  //     this.isPositive = false;
  //     console.log('this.trend.score1', this.trend.score);
  //     this.trend.score = this.trend.score * -1;
  //     console.log('this.trend.score2', this.trend.score);
  //   } else this.isPositive = true;
  //   console.log('this.isPositive', this.isPositive);
  // }

  trendArrow() {
    console.log('this.trendScoreArrow');
    if (this.trend.score >= 0) return '../../assets/images/up-arrow-white.svg';
    else return '../../assets/images/down-arrow-white.svg';
  }

  trendScoreCheck() {
    console.log('this.trendScoreCheck');
    if (this.trend.score >= 0) return Number(this.trend.score).toFixed(1);
    else return this.trend.score * -1;
  }

  bgColor() {
    if (this.trend.score >= 0) return {background: '#39D2DB'};
    else return {background: '#FF6954'};
  }

  render() {
    return (
      <div class="trend-card-component">
        <ion-card class="trend-card">
          <p>{this.trend.name}</p>
        </ion-card>
        <div class="trend-score" style={this.bgColor()}> <p>{this.trendScoreCheck()}</p><ion-img class="trend-arrow" src={this.trendArrow()}></ion-img></div>
      </div>
    )
  }
}
