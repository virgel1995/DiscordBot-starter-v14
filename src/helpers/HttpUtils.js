
const { error, debug } = require("@helpers/Logger");
const fetch = require("node-fetch");


module.exports = class HttpUtils {
  /**
   * Returns JSON response from url
   * @param {string} url
   */
  static async getJson(url) {
    try {
      const response = await fetch(url);
      const json = await response.json();
      return {
        success: response.status === 200 ? true : false,
        status: response.status,
        data: json,
      };
    } catch (ex) {
      debug(`Url: ${url}`);
      error(`getJson`, ex);
      return {
        success: false,
      };
    }
  }

  /**
   * Returns buffer from url
   * @param {string} url
   */
  static async getBuffer(url) {
    try {
      const response = await fetch(url);
      const buffer = await response.buffer();
      if (response.status !== 200) debug(response);
      return {
        success: response.status === 200 ? true : false,
        status: response.status,
        buffer,
      };
    } catch (ex) {
      debug(`Url: ${url}`);
      error(`getBuffer`, ex);
      return {
        success: false,
      };
    }
  }


};
