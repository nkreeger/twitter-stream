import {TwitterStream} from './twitter';

const tweetStream = new TwitterStream();
tweetStream.listen();
tweetStream.stream(['#javascript']);