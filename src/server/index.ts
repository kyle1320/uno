import * as appInsights from 'applicationinsights';
import { GameServer } from './GameServer';
import { UnoServer } from '../games/Uno/UnoServer';

if (process.env.NODE_ENV === 'production') {
  appInsights.setup().setSendLiveMetrics(true).start();
}

new GameServer(UnoServer).start();
