import {UniqueQueue} from 'containers.js';
import {readFileSync} from 'fs';
import {createServer, Server} from 'http';
import * as socketio from 'socket.io';

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

const PORT = 8002;
const MAX_TWEET_CACHE = 40;

export class TwitterStream {
  // tslint:disable-next-line:no-any
  client: any;
  tweetQueue: UniqueQueue<Tweet>;

  server: Server;
  io: socketio.Server;
  port: string|number;

  constructor() {
    const clientConfig = JSON.parse(readFileSync('permissions.json', 'utf8'));
    this.client = new twitter(clientConfig);
    this.tweetQueue = new UniqueQueue(MAX_TWEET_CACHE);

    this.port = process.env.PORT || PORT;
    this.server = createServer();
    this.io = socketio(this.server);
  }

  listen(): void {
    this.server.listen(this.port, () => {
      console.log(`  > Running socket on port: ${this.port}`);
    });

    this.io.on('connect', (socket) => {
      console.log(`  > Client connected on port: ${this.port} - sending ${
          this.tweetQueue.values().length} cached tweets`);
      socket.emit('tweets', this.tweetQueue.values());
    });
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
            this.io.emit('tweets', tweet);
          });

          // tslint:disable-next-line:no-any
          stream.on('error', (error: any) => {
            console.log(`ERROR: ${error}`);
          });
        });
  }
}