export default function({ code, meta, folder, servicePath, name, deps }) {
  return code({ folder, name }).then(function(code) {
    const data = {
      Body: code
    };

    return deps({ data, folder, name });
  });
};
