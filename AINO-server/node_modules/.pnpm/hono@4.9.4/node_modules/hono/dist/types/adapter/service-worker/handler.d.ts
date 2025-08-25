/**
 * Handler for Service Worker
 * @module
 */
import type { Hono } from '../../hono';
import type { FetchEvent } from './types';
type Handler = (evt: FetchEvent) => void;
export type HandleOptions = {
    fetch?: typeof fetch;
};
/**
 * Adapter for Service Worker
 */
export declare const handle: (app: Hono, opts?: HandleOptions) => Handler;
export {};
