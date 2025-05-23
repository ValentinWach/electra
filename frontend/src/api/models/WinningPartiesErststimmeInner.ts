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
 * @interface WinningPartiesErststimmeInner
 */
export interface WinningPartiesErststimmeInner {
    /**
     * 
     * @type {Partei}
     * @memberof WinningPartiesErststimmeInner
     */
    party: Partei;
    /**
     * 
     * @type {number}
     * @memberof WinningPartiesErststimmeInner
     */
    regionId: number;
    /**
     * 
     * @type {string}
     * @memberof WinningPartiesErststimmeInner
     */
    regionName: string;
}

/**
 * Check if a given object implements the WinningPartiesErststimmeInner interface.
 */
export function instanceOfWinningPartiesErststimmeInner(value: object): value is WinningPartiesErststimmeInner {
    if (!('party' in value) || value['party'] === undefined) return false;
    if (!('regionId' in value) || value['regionId'] === undefined) return false;
    if (!('regionName' in value) || value['regionName'] === undefined) return false;
    return true;
}

export function WinningPartiesErststimmeInnerFromJSON(json: any): WinningPartiesErststimmeInner {
    return WinningPartiesErststimmeInnerFromJSONTyped(json, false);
}

export function WinningPartiesErststimmeInnerFromJSONTyped(json: any, ignoreDiscriminator: boolean): WinningPartiesErststimmeInner {
    if (json == null) {
        return json;
    }
    return {
        
        'party': ParteiFromJSON(json['party']),
        'regionId': json['region_id'],
        'regionName': json['region_name'],
    };
}

export function WinningPartiesErststimmeInnerToJSON(json: any): WinningPartiesErststimmeInner {
    return WinningPartiesErststimmeInnerToJSONTyped(json, false);
}

export function WinningPartiesErststimmeInnerToJSONTyped(value?: WinningPartiesErststimmeInner | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'party': ParteiToJSON(value['party']),
        'region_id': value['regionId'],
        'region_name': value['regionName'],
    };
}

