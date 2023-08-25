export default function(path) {
    if(process.platform === "win32") {
      return `${ s[0] = s[0].toUpperCase() }${ s.slice(1) }`;
    }

    return path;
}
