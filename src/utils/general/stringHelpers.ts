export function formatMessageBubbleString(input: string): string {
    if (!input) return '';

    // Replace <br> tags with newlines
    let result = input.replace(/<br\s*\/?>/gi, '\n');

    // // Regex to match URLs including plain domains like example.com
    // const urlRegex = /\b((https?:\/\/)?(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/\S*)?)/gi;

    // result = result.replace(urlRegex, (match) => {
    //     let href = match;
    //     if (!href.startsWith('http')) {
    //         href = `https://${href}`;
    //     }
    //     return `<a href="${href}" target="_blank" rel="noopener noreferrer">${match}</a>`;
    // });

    // // Convert newlines to <br> for HTML rendering
    result = result.replace(/\n/g, '<br>');

    return result;
}

