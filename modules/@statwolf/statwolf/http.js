import { gzip } from 'zlib';

export default function(host, options = {}) {
  const { zip } = options;
  const { username, password, origin } = new URL(host);

  const fullPath = `${ origin }/api/Custom/DashboardToolbox`;

  return function(command, data) {
    return new Promise(function(resolve, reject) {
      const body = JSON.stringify({
        Command: command,
        Data: {
          user: username,
          key: password,
          ...data
        }
      });

      if(zip !== true) {
        resolve(body);

        return;
      }

      gzip(body, function(error, content) {
        if(error != null) {
          reject(error);

          return;
        }

        resolve(content.toString('base64'));
      });
    }).then(function(body) {
      return fetch(fullPath, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'statwolf-encoding': zip === true ? 'gzip' : 'plain'
        },
        body
      });
    }).then(function(response) {
      if(response.status !== 200) {
        throw new Error(`${ response.status }: ${ response.statusText }`);
      }

      return response.json();
    });
   };
};
