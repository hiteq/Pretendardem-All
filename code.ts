const fontName = 'Pretendard Variable'; // Change this to use a different font

const loadFonts = async () => {
  console.log(`Awaiting the fonts.`)
  const fontStyles = ['Regular', 'Thin', 'ExtraLight', 'Light', 'Medium', 'SemiBold', 'Bold', 'ExtraBold', 'Black'];
  const results = await Promise.allSettled(fontStyles.map(style => figma.loadFontAsync({ family: fontName, style })));

  results.forEach((result: PromiseSettledResult<any>, i: number) => {
    if (result.status === 'rejected' && typeof result.reason === 'string') {
      console.log(`Failed to load ${fontStyles[i]}: ${result.reason}`);
    }
  });
}

const loadAllFonts = async (textNodes: SceneNode[]) => {
  const fontPromises = textNodes.flatMap((node: SceneNode) => {
    if ("getRangeAllFontNames" in node && "characters" in node) {
      const textNode = node as TextNode;
      const fontNames = textNode.getRangeAllFontNames(0, textNode.characters.length);
      return fontNames.map(fontName => figma.loadFontAsync(fontName));
    }
    return [];
  });

  await Promise.all(fontPromises);
}

loadFonts()
  .then(async () => {
    console.log(`Fonts loaded.`)
    figma.notify(`Change all the text layers on the current page to ${fontName}.`, { timeout: 500})

    const selectedNodes = figma.currentPage.selection;
    if (selectedNodes.length === 0) {
      figma.closePlugin(`❌ No layers selected. Please select at least one layer and try again.`);
      return;
    }
    const textNodes = selectedNodes.flatMap(node => {
      if ('findAll' in node) { // 타입 가드를 사용하여 findAll 메소드가 있는 노드만 처리
        return node.findAll((n: SceneNode) => n.type === 'TEXT') as TextNode[];
      }
      return [];
    });

    await loadAllFonts(textNodes);
    if (textNodes.length === 0) {
      console.log(`No text nodes found in the selected layers.`)
      figma.closePlugin(`❌ No text nodes found in the selected layers. Please select layers with text and try again.`);
      return;
    }
    let count = 0
    let ignored = 0
    figma.notify(`Processing ${textNodes.length} layers...`, { timeout: 500 })

    for (const textNode of textNodes) {

      if (textNode.hasMissingFont) {
        console.log(`Text node has missing font: ${textNode.id}`);
        continue;
      }

      if (textNode.fontWeight === figma.mixed || textNode.fontName === figma.mixed) {
        for (let i = 0; i < textNode.characters.length; i++) {
          const charWeight = Number(textNode.getRangeFontWeight(i, i+1))
          const charFontName = textNode.getRangeFontName(i, i+1)
          console.log(charWeight)
          if (typeof charFontName !== 'symbol') {
            await figma.loadFontAsync(charFontName)
            await figma.loadFontAsync({ family: fontName, style: String(getFontStyle(charWeight)) })
            textNode.setRangeFontName(i, i+1, { family: fontName, style: String(getFontStyle(charWeight)) })
          }
        }
        
        count++

        continue
      }

      const cssWeight = Number(textNode.fontWeight)
      await figma.loadFontAsync({ family: textNode.fontName.family, style: String(getFontStyle(cssWeight)) })
      textNode.fontName = { family: fontName, style: String(getFontStyle(cssWeight)) }

      count++

    }
    console.log(`All done.`)
    figma.closePlugin(`✅ All ${count} text layers have been updated.`)
  })
  .catch((error) => {
    console.log(error)
    figma.closePlugin(`❌ Failed to load fonts. Please check if the ${fontName} is installed and try again.`)
  })

function getFontStyle(cssWeight: number) {
  if (cssWeight <= 149) {
    return `Thin`
  } else if (cssWeight >= 150 && cssWeight < 250) {
    return `ExtraLight`
  } else if (cssWeight >= 250 && cssWeight < 350) {
    return `Light`
  } else if (cssWeight >= 350 && cssWeight < 450) {
    return `Regular`
  } else if (cssWeight >= 450 && cssWeight < 550) {
    return `Medium`
  } else if (cssWeight >= 550 && cssWeight < 650) {
    return `SemiBold`
  } else if (cssWeight >= 650 && cssWeight < 750) {
    return `Bold`
  } else if (cssWeight >= 750 && cssWeight < 850) {
    return `ExtraBold`
  } else if (cssWeight >= 850) {
    return `Black`
  } else {
    return `Regular`
  }
}
