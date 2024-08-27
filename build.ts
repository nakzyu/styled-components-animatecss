const fs = require("fs").promises;

const removeCommon = (text: string) => {
  const regex = /:root[\s\S]*?@-webkit-keyframes/;
  return text.replace(regex, "@-webkit-keyframes");
};

const removeWebkitKeyframes = (text: string) => {
  const regex =
    /@-webkit-keyframes\s+[\w-]+\s*\{[^{}]*?(?:\{[^{}]*?\}[^{}]*?)*\}/g;
  return text.replace(regex, "");
};

const removeCSSClass = (text: string) => {
  const regex = /\.[\w-]+(?:\.[\w-]+)*\s*\{[^{}]*?(?:\{[^{}]*?\}[^{}]*?)*\}/g;
  return text.replace(regex, "");
};

const convertCSSKeyframesToJS = (text: string) => {
  const regex = /@keyframes\s+(\w+)\s*\{([^{}]*?(?:\{[^{}]*?\}[^{}]*?)*)\}/g;

  let result;
  let output = "";

  while ((result = regex.exec(text)) !== null) {
    const name = result[1];
    const keyframes = result[2].trim();
    output += `export const ${name} = keyframes\`\n${keyframes}\n\`;\n\n`;
  }
  return output;
};

const processCSSFile = async () => {
  try {
    const string = await fs.readFile("animate.css", "utf8");
    const cleanedContent = convertCSSKeyframesToJS(
      removeCSSClass(removeWebkitKeyframes(removeCommon(string)))
    );
    await fs.writeFile(
      "index.ts",
      "import { keyframes } from 'styled-components';\n\n" + cleanedContent
    );
    console.log(
      "CSS keyframes have been converted to JavaScript and saved as keyframes.js"
    );
  } catch (error) {
    console.error("Error processing file:", error);
  }
};

processCSSFile();
