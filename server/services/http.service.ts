import axios from 'axios';
import { HTTPConfig } from '@shared/schema';

export class HTTPService {
  /**
   * Test an HTTP endpoint
   */
  static async checkEndpoint(config: HTTPConfig): Promise<{ 
    success: boolean; 
    responseTime?: number; 
    statusCode?: number;
    contentLength?: number;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      const { url, method, headers, body, timeout, validateSSL } = config;
      
      // Setup request options
      const options = {
        method: method || 'GET',
        headers: headers || {},
        timeout: (timeout || 5) * 1000,
        httpsAgent: validateSSL === false ? {
          rejectUnauthorized: false
        } : undefined,
        data: body
      };
      
      const response = await axios(url, options);
      const responseTime = Date.now() - startTime;
      
      const contentLength = response.headers['content-length'] 
        ? parseInt(response.headers['content-length'], 10) 
        : (response.data ? JSON.stringify(response.data).length : 0);
      
      // Check if the status code matches the expected status
      const expectedStatus = config.expectedStatus || 200;
      const success = response.status === expectedStatus;
      
      return {
        success,
        responseTime,
        statusCode: response.status,
        contentLength
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      if (axios.isAxiosError(error)) {
        // Handle Axios specific errors
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          return {
            success: false,
            responseTime,
            statusCode: error.response.status,
            error: `HTTP Error ${error.response.status}: ${error.response.statusText}`
          };
        } else if (error.request) {
          // The request was made but no response was received
          return {
            success: false,
            responseTime,
            error: 'No response received from server'
          };
        } else {
          // Something happened in setting up the request
          return {
            success: false,
            error: `Request setup error: ${error.message}`
          };
        }
      }
      
      // Generic error
      return {
        success: false,
        responseTime,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}
