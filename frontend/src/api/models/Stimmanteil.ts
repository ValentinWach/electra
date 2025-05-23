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
import type { Partei } from './Partei';
import {
    ParteiFromJSON,
    ParteiFromJSONTyped,
    ParteiToJSON,
    ParteiToJSONTyped,
} from './Partei';

/**
 * 
 * @export
 * @interface Stimmanteil
 */
export interface Stimmanteil {
    /**
     * 
     * @type {Partei}
     * @memberof Stimmanteil
     */
    party: Partei;
    /**
     * 
     * @type {number}
     * @memberof Stimmanteil
     */
    share: number;
    /**
     * 
     * @type {number}
     * @memberof Stimmanteil
     */
    absolute: number;
}

/**
 * Check if a given object implements the Stimmanteil interface.
 */
export function instanceOfStimmanteil(value: object): value is Stimmanteil {
    if (!('party' in value) || value['party'] === undefined) return false;
    if (!('share' in value) || value['share'] === undefined) return false;
    if (!('absolute' in value) || value['absolute'] === undefined) return false;
    return true;
}

export function StimmanteilFromJSON(json: any): Stimmanteil {
    return StimmanteilFromJSONTyped(json, false);
}

export function StimmanteilFromJSONTyped(json: any, ignoreDiscriminator: boolean): Stimmanteil {
    if (json == null) {
        return json;
    }
    return {
        
        'party': ParteiFromJSON(json['party']),
        'share': json['share'],
        'absolute': json['absolute'],
    };
}

export function StimmanteilToJSON(json: any): Stimmanteil {
    return StimmanteilToJSONTyped(json, false);
}

export function StimmanteilToJSONTyped(value?: Stimmanteil | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'party': ParteiToJSON(value['party']),
        'share': value['share'],
        'absolute': value['absolute'],
    };
}

