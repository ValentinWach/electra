/* tslint:disable */
/* eslint-disable */
/**
 * Bundestagswahlsystem API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 0.1.1
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { mapValues } from '../runtime';
import type { AuslaenderanteilWahlkreiseInner } from './AuslaenderanteilWahlkreiseInner';
import {
    AuslaenderanteilWahlkreiseInnerFromJSON,
    AuslaenderanteilWahlkreiseInnerFromJSONTyped,
    AuslaenderanteilWahlkreiseInnerToJSON,
    AuslaenderanteilWahlkreiseInnerToJSONTyped,
} from './AuslaenderanteilWahlkreiseInner';

/**
 * 
 * @export
 * @interface Auslaenderanteil
 */
export interface Auslaenderanteil {
    /**
     * 
     * @type {Array<AuslaenderanteilWahlkreiseInner>}
     * @memberof Auslaenderanteil
     */
    wahlkreise: Array<AuslaenderanteilWahlkreiseInner>;
}

/**
 * Check if a given object implements the Auslaenderanteil interface.
 */
export function instanceOfAuslaenderanteil(value: object): value is Auslaenderanteil {
    if (!('wahlkreise' in value) || value['wahlkreise'] === undefined) return false;
    return true;
}

export function AuslaenderanteilFromJSON(json: any): Auslaenderanteil {
    return AuslaenderanteilFromJSONTyped(json, false);
}

export function AuslaenderanteilFromJSONTyped(json: any, ignoreDiscriminator: boolean): Auslaenderanteil {
    if (json == null) {
        return json;
    }
    return {
        
        'wahlkreise': ((json['wahlkreise'] as Array<any>).map(AuslaenderanteilWahlkreiseInnerFromJSON)),
    };
}

export function AuslaenderanteilToJSON(json: any): Auslaenderanteil {
    return AuslaenderanteilToJSONTyped(json, false);
}

export function AuslaenderanteilToJSONTyped(value?: Auslaenderanteil | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'wahlkreise': ((value['wahlkreise'] as Array<any>).map(AuslaenderanteilWahlkreiseInnerToJSON)),
    };
}

