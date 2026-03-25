import { runNotifier } from './telegram-notifier.mjs';
// Wait, telegram-notifier.mjs doesn't export runNotifier.
// I'll just run the file and then call the function if it were exported.
// Better: just run the whole thing once.
