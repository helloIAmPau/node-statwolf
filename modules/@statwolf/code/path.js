export default function(path) {
    if(process.platform === "win32") {
        return path.toLowerCase();
    }

    return path;
}