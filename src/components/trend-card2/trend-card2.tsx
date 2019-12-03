import {Component, Prop} from '@stencil/core';

@Component({
  tag: 'trend-card2',
  styleUrl: 'trend-card2.css'
})
export class TrendCard2 {

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
      <div class="trend-card-component2">
        <div class="trend-score2" style={this.bgColor()}>
          <p class="trend-score-trend2">{this.trend.name}</p>
          <span class="trend-score-value2">{this.trendScoreCheck()}</span>
          <ion-img class="trend-arrow2" src={this.trendArrow()}></ion-img></div>
      </div>
    )
  }
}
