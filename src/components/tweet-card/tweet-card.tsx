import {Component, Prop} from '@stencil/core';

@Component({
  tag: 'tweet-card',
  styleUrl: 'tweet-card.css'
})
export class TweetCard {

  @Prop() tweet:any;



  constructor() {
  }

  componentWillLoad() {
    console.log('this.tweet', this.tweet);
  }

  clickTweet() {
    window.open(`https://twitter.com/statuses/${this.tweet.id_str}`, '_blank')
  }

  cleanTweet() {
    // let text = this.tweet.text;
    // let truncIndex = text.indexOf('…');
    // if (truncIndex > 0) text = text.slice(0, truncIndex + 1);
    // truncIndex = text.indexOf('https://t.co');
    // if (truncIndex > 0) text = text.slice(0, truncIndex - 1);
    // text = text.replace(/&amp;/g, '&');
    // return text;
    return this.tweet.text.replace(/&amp;/g, '&');
  }

  // tweetTime() {
  //   const CURRENT = Date.now();
  //   const tweetTime = new Date(this.tweet.created_at).getTime();
  //   const DIFFERENCE = (CURRENT - tweetTime) / 1000;
  //
  //   console.log('Current', CURRENT);
  //   console.log('tweetTime', tweetTime);
  //   console.log('DIFFERENCE', DIFFERENCE);
  //
  //   return DIFFERENCE;
  // }

  render() {
    return (
      <div class="tweet-card-component" onClick={() => this.clickTweet()}>
        <ion-card class="tweet-card">
          <div padding-top><span class="tweet-name">{this.tweet.name}</span>
            <span class="tweet-user-name">@{this.tweet.userName}</span>
            {/*<span class="tweet-date"> • {this.tweetTime()}</span>*/}
          </div>
          <p>{this.cleanTweet()}</p>
        </ion-card>
      </div>
    )
  }
}
