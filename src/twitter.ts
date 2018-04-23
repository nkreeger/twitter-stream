import {UniqueQueue} from 'containers.js';
import {readFileSync} from 'fs';

// tslint:disable-next-line:no-require-imports
const twitter = require('twitter');

export type User = {
  id: number,
  name: string,
  screen_name: string,
};

export type Tweet = {
  created_at: string,
  id_str: string,
  text: string,
  user: User
};

export class TwitterStream {
  // tslint:disable-next-line:no-any
  client: any;
  tweetQueue: UniqueQueue<Tweet>;

  constructor() {
    const clientConfig = JSON.parse(readFileSync('permissions.json', 'utf8'));
    this.client = new twitter(clientConfig);
    this.tweetQueue = new UniqueQueue();
  }

  stream(filters: string[]) {
    const options = {track: filters.join(','), tweet_mode: 'extended'};
    // tslint:disable-next-line:no-any
    this.client.stream(
        // tslint:disable-next-line:no-any
        'statuses/filter', options, (stream: any) => {
          // tslint:disable-next-line:no-any
          stream.on('data', (tweet: Tweet) => {
            this.tweetQueue.push(tweet);
            console.log(`[${tweet.user.screen_name}] : ${tweet.text}\n`);
          });

          // tslint:disable-next-line:no-any
          stream.on('error', (error: any) => {
            console.log(error);
          });
        });
  }
}