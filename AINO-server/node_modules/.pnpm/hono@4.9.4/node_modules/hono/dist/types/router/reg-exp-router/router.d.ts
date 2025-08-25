import type { Result, Router } from '../../router';
export declare class RegExpRouter<T> implements Router<T> {
    name: string;
    constructor();
    add(method: string, path: string, handler: T): void;
    match(method: string, path: string): Result<T>;
}
