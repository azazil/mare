import EventEmitter from 'events';
import {SessionStore} from './session-store';
import {LoggingStore} from './logging-store';
import {SessionDataStore} from './session-data-store';
import databaseFactory from './database-factory';

export class Storage extends EventEmitter {

    constructor(config) {
        super();
        this.config = config;
        this.database = null;
    }

    start = async () => {
        this.database = await databaseFactory(this.config.database);
    }

    getDatabase() {
        return this.database;
    }

    getSessionStore() {
        if (!this.sessionStore) {
            const cln = this.database.collection('session');
            this.sessionStore = new SessionStore(cln);
        }
        return this.sessionStore;
    }

    getLoggingStore() {
        if (!this.loggingStore) {
            const cln = this.database.collection('logging');
            this.loggingStore = new LoggingStore(cln);
        }
        return this.loggingStore;
    }

    getSessionDataStore(sessionId) {
        const cln = this.database.collection(`session-data.${sessionId}`);
        return new SessionDataStore(cln);
    }

    removeSessionData = async (sessionId) => {
        try {
            await this.database.dropCollection(`session-data.${sessionId}`);
        } catch (e) {
        }
    }

    logging = async (type, log) => {
        await this.getLoggingStore().append('session', log);
    }

    loadSessions = async () => {
        return await this.getSessionStore().get();
    }

    saveSession = async (session) => {
        await this.getSessionStore().update(session);
    }

    removeSession = async (sessionId) => {
        await this.getSessionStore().remove(sessionId);
    }
}
