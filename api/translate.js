import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { Translate } = require("@google-cloud/translate").v2;

// creates a translation client
const translate = new Translate({
  key: process.env.GOOGLE_TRANSLATION_API_KEY,
});

export default async function handler(req, res) {
    if (req.method == "GET"){
        const [translation] = await translate.translate("北京早安。我现在有冰淇淋", {
            to: "en"
        }) 
        return res.status(200).json({translatedText: translation})
    }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text, source, target } = req.body;

    if (!text || !target) {
      return res.status(400).json({
        error: "text and target are required",
      });
    }

    const [translation] = await translate.translate(text, {
      from: source,
      to: target,
    });

    return res.status(200).json({
      translatedText: translation,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Translation failed",
    });
  }
}
