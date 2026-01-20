export default function downloadObjectAsJson(exportObj: Record<any, any>, exportName: string) {
    // 1. Convert the JavaScript object to a JSON string
    // The third argument (2) specifies the number of spaces for indentation,
    // which makes the downloaded file human-readable.
    const jsonStr = JSON.stringify(exportObj, null, 2); 

    // 2. Create a data URL with the JSON string
    // The 'data:text/json;charset=utf-8,' part specifies the MIME type and character encoding.
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonStr);

    // 3. Create a temporary anchor element
    const downloadAnchorNode = document.createElement('a');

    // 4. Set the href and download attributes
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json"); // Set the desired file name

    // 5. Append the anchor to the body, click it programmatically, and remove it
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click(); 
    document.body.removeChild(downloadAnchorNode);
}
