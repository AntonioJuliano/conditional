import Transport from 'winston-transport';

export class StackTransport extends Transport {
  log(info, callback) {
    setImmediate(() => {
      if (info && info.error) {
        // eslint-disable-next-line
        console.error(info.error.stack);
      }
    });
    if (callback) {
      callback();
    }
  }
}
