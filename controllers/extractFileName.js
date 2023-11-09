export function extractFileName(content) {
    const url = content;

    const prefix = 'media/';
    
    if (url.includes(prefix)) {
      const index = url.indexOf(prefix) + prefix.length;
      const filename = url.substring(index);
      return filename;
    } else {
      return 'No match found';
    }
}
