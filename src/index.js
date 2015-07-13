/* global ajax */

class FilePreviews {
  constructor(options) {
    var opts = options || {};

    this.API_URL = 'https://api.filepreviews.io/v2';

    this.debug = opts.debug || false;
    if (!opts.apiKey) {
      throw new Error('Missing required apiKey.');
    }
    this.apiKey = opts.apiKey;
  }

  log(msg) {
    if (this.debug) {
      console.log(msg);
    }
  }

  generate(url, options, callback) {
    if (arguments.length === 2) {
      if (Object.prototype.toString.call(options) === '[object Function]') {
        callback = options;
      }
    } else if (arguments.length === 1) {
      options = {};
    }

    this.request(`${this.API_URL}/previews/`, {
      method: 'POST',
      data: JSON.stringify(this.getAPIRequestData(url, options))
    },
    function(err, result) {
      if (callback) {
        callback(err, result);
      }
    });
  }

  retrieve(previewId, callback) {
    this.request(`${this.API_URL}/previews/${previewId}/`, {
      method: 'GET'
    },
    function(err, result) {
      if (callback) {
        callback(err, result);
      }
    });
  }

  request(url, options, callback) {
    var data;

    var onSuccess = function(response, xhr) {
      this.log(`API request success: ${xhr.status} ${xhr.statusText}`);

      data = JSON.parse(response);
      this.log(`API request response: ${data}`);

      callback(null, data);
    }.bind(this);

    var onError = function(status, message, xhr) {
      data = JSON.parse(xhr.responseText);

      if (status === 201) {
        onSuccess(xhr.responseText, xhr);
      } else {
        this.log(`API request error: ${status}`);
        callback(data);
      }
    }.bind(this);

    var requestOptions = {
      headers: this.getAPIRequestHeaders(),
      method: options.method,
      success: onSuccess,
      error: onError
    };

    if (options.data) {
      requestOptions.data = options.data;
    }

    this.log(`API request to: ${url}`);

    ajax(url, requestOptions);
  }

  getAPIRequestHeaders() {
    return {
      'Content-Type': 'application/json',
      Authorization: `Basic ${btoa(this.apiKey)}:`
    };
  }

  getAPIRequestData(url, options) {
    var size;

    if (arguments.length === 2) {
      if (Object.prototype.toString.call(options) === '[object Function]') {
        options = {};
      }
    } else if (arguments.length === 1) {
      options = {};
    }

    if (options) {
      options.url = url;

      if (options.size) {
        size = '';

        if (options.size.width) {
          size = options.size.width;
        }

        if (options.size.height) {
          size = `${size} x ${options.size.height}`;
        }

        options.sizes = [size];
      }
    }

    return options;
  }
}
