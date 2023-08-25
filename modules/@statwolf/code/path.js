export default function(path) {
    if(process.platform === "win32") {
      return `${ path[0] = path[0].toUpperCase() }${ path.slice(1) }`;
    }

    return path;
}
