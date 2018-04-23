import { TwitterStream } from "./twitter";

const tweetStream = new TwitterStream();
tweetStream.stream(['#javascript']);