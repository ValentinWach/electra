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


import * as runtime from '../runtime';
import type {
  GenerateToken,
  Token,
} from '../models/index';
import {
    GenerateTokenFromJSON,
    GenerateTokenToJSON,
    TokenFromJSON,
    TokenToJSON,
} from '../models/index';

export interface BatchVoteRequest {
    file: Blob;
}

export interface GenerateTokenRequest {
    wahlid: number;
    wahlkreisid: number;
    generateToken: GenerateToken;
}

/**
 * 
 */
export class AdminApi extends runtime.BaseAPI {

    /**
     * Accepts a CSV file for batch voting.
     */
    async batchVoteRaw(requestParameters: BatchVoteRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters['file'] == null) {
            throw new runtime.RequiredError(
                'file',
                'Required parameter "file" was null or undefined when calling batchVote().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const consumes: runtime.Consume[] = [
            { contentType: 'multipart/form-data' },
        ];
        // @ts-ignore: canConsumeForm may be unused
        const canConsumeForm = runtime.canConsumeForm(consumes);

        let formParams: { append(param: string, value: any): any };
        let useForm = false;
        // use FormData to transmit files using content-type "multipart/form-data"
        useForm = canConsumeForm;
        if (useForm) {
            formParams = new FormData();
        } else {
            formParams = new URLSearchParams();
        }

        if (requestParameters['file'] != null) {
            formParams.append('file', requestParameters['file'] as any);
        }

        const response = await this.request({
            path: `/admin/batch-vote`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: formParams,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Accepts a CSV file for batch voting.
     */
    async batchVote(requestParameters: BatchVoteRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.batchVoteRaw(requestParameters, initOverrides);
    }

    /**
     */
    async generateTokenRaw(requestParameters: GenerateTokenRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<Token>>> {
        if (requestParameters['wahlid'] == null) {
            throw new runtime.RequiredError(
                'wahlid',
                'Required parameter "wahlid" was null or undefined when calling generateToken().'
            );
        }

        if (requestParameters['wahlkreisid'] == null) {
            throw new runtime.RequiredError(
                'wahlkreisid',
                'Required parameter "wahlkreisid" was null or undefined when calling generateToken().'
            );
        }

        if (requestParameters['generateToken'] == null) {
            throw new runtime.RequiredError(
                'generateToken',
                'Required parameter "generateToken" was null or undefined when calling generateToken().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        const response = await this.request({
            path: `/admin/generate/generatetoken/{wahlid}/{wahlkreisid}`.replace(`{${"wahlid"}}`, encodeURIComponent(String(requestParameters['wahlid']))).replace(`{${"wahlkreisid"}}`, encodeURIComponent(String(requestParameters['wahlkreisid']))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: GenerateTokenToJSON(requestParameters['generateToken']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(TokenFromJSON));
    }

    /**
     */
    async generateToken(requestParameters: GenerateTokenRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<Token>> {
        const response = await this.generateTokenRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     */
    async refreshRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/admin/refresh`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     */
    async refresh(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.refreshRaw(initOverrides);
    }

}
