import { logEvent } from '@firebase/analytics';
import { getAnalytics } from './firebase';

const logDataMap = new Map<
  string,
  { timestamp: number; data: Record<string, any> }
>();

export const logger = {
  log(eventName: string, data: Record<string, any> = {}) {
    const timestamp = performance.now();

    if (process.env.NODE_ENV === 'development') {
      if (typeof data.delta === 'number') {
        console.groupCollapsed(`${eventName} [${data.delta.toFixed(2)}ms]`);
      } else {
        console.groupCollapsed(eventName);
      }

      console.log('timestamp', timestamp);
      Object.entries(data || {}).forEach((entry) => console.log(...entry));
      console.groupEnd();
    }

    logEvent(getAnalytics(), 'debug', {
      eventName,
      timestamp,
      ...data,
    });
  },

  time(eventName: string, data: Record<string, any> = {}) {
    logDataMap.set(eventName, { timestamp: performance.now(), data });
  },

  timeEnd(eventName: string, data: Record<string, any> = {}) {
    const beginData = logDataMap.get(eventName);

    if (!beginData) {
      logger.log(eventName, data);
      return;
    }

    logDataMap.delete(eventName);

    logger.log(eventName, {
      delta: performance.now() - beginData.timestamp,
      ...data,
      ...beginData.data,
    });
  },
};
