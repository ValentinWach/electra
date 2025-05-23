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
/**
 * 
 * @export
 * @interface BerufsgruppenBerufsgruppenInner
 */
export interface BerufsgruppenBerufsgruppenInner {
    /**
     * 
     * @type {number}
     * @memberof BerufsgruppenBerufsgruppenInner
     */
    id: number;
    /**
     * 
     * @type {string}
     * @memberof BerufsgruppenBerufsgruppenInner
     */
    name: string;
    /**
     * 
     * @type {number}
     * @memberof BerufsgruppenBerufsgruppenInner
     */
    share: number;
    /**
     * 
     * @type {number}
     * @memberof BerufsgruppenBerufsgruppenInner
     */
    absolute?: number;
}

/**
 * Check if a given object implements the BerufsgruppenBerufsgruppenInner interface.
 */
export function instanceOfBerufsgruppenBerufsgruppenInner(value: object): value is BerufsgruppenBerufsgruppenInner {
    if (!('id' in value) || value['id'] === undefined) return false;
    if (!('name' in value) || value['name'] === undefined) return false;
    if (!('share' in value) || value['share'] === undefined) return false;
    return true;
}

export function BerufsgruppenBerufsgruppenInnerFromJSON(json: any): BerufsgruppenBerufsgruppenInner {
    return BerufsgruppenBerufsgruppenInnerFromJSONTyped(json, false);
}

export function BerufsgruppenBerufsgruppenInnerFromJSONTyped(json: any, ignoreDiscriminator: boolean): BerufsgruppenBerufsgruppenInner {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'],
        'name': json['name'],
        'share': json['share'],
        'absolute': json['absolute'] == null ? undefined : json['absolute'],
    };
}

export function BerufsgruppenBerufsgruppenInnerToJSON(json: any): BerufsgruppenBerufsgruppenInner {
    return BerufsgruppenBerufsgruppenInnerToJSONTyped(json, false);
}

export function BerufsgruppenBerufsgruppenInnerToJSONTyped(value?: BerufsgruppenBerufsgruppenInner | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'id': value['id'],
        'name': value['name'],
        'share': value['share'],
        'absolute': value['absolute'],
    };
}

