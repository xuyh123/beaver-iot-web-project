import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { apiOrigin } from '@milesight/shared/src/config';
import { createRequestClient, attachAPI } from '@milesight/shared/src/utils/request';
import { getCurrentComponentLang } from '@milesight/shared/src/services/i18n';
// import oauthHandler from './oauth-handler';
import errorHandler from './error-handler';

/**
 * 业务请求头配置（非动态请求头直接在 headers 中配置即可）
 */
const headersHandler = async (config: AxiosRequestConfig) => {
    config.headers = config.headers || {};
    config.headers['Accept-Language'] = getCurrentComponentLang();

    return config;
};

/**
 * 接口请求地址配置
 */
const apiOriginHandler = async (config: AxiosRequestConfig) => {
    const { baseURL } = config;
    // 若接口已经做了 URL 替换，则不需要再处理
    if (baseURL?.startsWith('http')) return config;

    if (apiOrigin) {
        config.baseURL = apiOrigin;
    }

    return config;
};

/**
 * 判断 API 请求是否成功
 */
const isRequestSuccess = (resp: AxiosResponse<ApiResponse>) => {
    const data = resp?.data;

    return !!data && !data.error_message && resp.data.status === 'Success';
};

const client = createRequestClient({
    baseURL: '/',
    // TODO: 增加 oauthHandler
    configHandlers: [headersHandler, apiOriginHandler],
    onResponse(resp) {
        // 错误处理
        errorHandler(resp.data.error_code, resp);
        return resp;
    },
    onResponseError(error) {
        const resp = error.response;
        // @ts-ignore
        errorHandler(resp?.data?.error_code, resp);
        return error;
    },
});

export { client, attachAPI, isRequestSuccess };
