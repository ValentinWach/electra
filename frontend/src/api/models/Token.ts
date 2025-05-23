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
 * @interface Token
 */
export interface Token {
    /**
     * 
     * @type {string}
     * @memberof Token
     */
    idNumber?: string;
    /**
     * 
     * @type {string}
     * @memberof Token
     */
    token?: string;
}

/**
 * Check if a given object implements the Token interface.
 */
export function instanceOfToken(value: object): value is Token {
    return true;
}

export function TokenFromJSON(json: any): Token {
    return TokenFromJSONTyped(json, false);
}

export function TokenFromJSONTyped(json: any, ignoreDiscriminator: boolean): Token {
    if (json == null) {
        return json;
    }
    return {
        
        'idNumber': json['idNumber'] == null ? undefined : json['idNumber'],
        'token': json['token'] == null ? undefined : json['token'],
    };
}

export function TokenToJSON(json: any): Token {
    return TokenToJSONTyped(json, false);
}

export function TokenToJSONTyped(value?: Token | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'idNumber': value['idNumber'],
        'token': value['token'],
    };
}

