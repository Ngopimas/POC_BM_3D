export const htmlToImage = async (element: HTMLElement): Promise<string> => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d")!;

  // Set canvas size to match element
  const computedStyle = window.getComputedStyle(element);
  canvas.width = element.offsetWidth;
  canvas.height = element.offsetHeight;

  // Draw the element content
  context.fillStyle = computedStyle.backgroundColor || "white";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const xmlSerializer = new XMLSerializer();
  const elementString = xmlSerializer.serializeToString(element);
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
      <foreignObject width="100%" height="100%">
        ${elementString}
      </foreignObject>
    </svg>
  `;

  const img = new Image();
  return new Promise((resolve) => {
    img.onload = () => {
      context.drawImage(img, 0, 0);
      resolve(canvas.toDataURL());
    };
    img.src = "data:image/svg+xml," + encodeURIComponent(svgString);
  });
};
