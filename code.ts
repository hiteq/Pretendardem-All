console.clear

const fontName = 'Pretendard Variable';

let currentNotification: NotificationHandler | null = null;

function showNotification(message: string, options?: NotificationOptions) {
  // 이전 알림이 있으면 취소
  if (currentNotification) {
    currentNotification.cancel();
  }
  
  // 새 알림 표시
  currentNotification = figma.notify(message, options);
}

const loadFonts = async () => {
  showNotification(`Loading fonts...`)
  const fontStyles = ['Regular', 'Thin', 'ExtraLight', 'Light', 'Medium', 'SemiBold', 'Bold', 'ExtraBold', 'Black'];
  const results = await Promise.allSettled(fontStyles.map(style => figma.loadFontAsync({ family: fontName, style })));

  results.forEach((result, i) => {
    if (result.status === 'rejected') {
      console.log(`Failed to load ${fontStyles[i]}: ${result.reason}`);
    }
  });
}

async function processTextNode(textNode: TextNode): Promise<boolean> {
  try {
    if (textNode.fontWeight === figma.mixed || textNode.fontName === figma.mixed) {
      for (let i = 0; i < textNode.characters.length; i++) {
        const charWeight = Number(textNode.getRangeFontWeight(i, i+1));
        const newStyle = getFontStyle(charWeight);
        await figma.loadFontAsync({ family: fontName, style: newStyle });
        textNode.setRangeFontName(i, i+1, { family: fontName, style: newStyle });
      }
    } else {
      const cssWeight = Number(textNode.fontWeight);
      const newStyle = getFontStyle(cssWeight);
      await figma.loadFontAsync({ family: fontName, style: newStyle });
      textNode.fontName = { family: fontName, style: newStyle };
    }
    return true;
  } catch (error) {
    console.error(`Error processing text node: ${textNode.id}`, error);
    return false;
  }
}

loadFonts()
  .then(async () => {
    showNotification(`Fonts loaded.`)
    figma.notify(`Changing text in selected layers to ${fontName}.`, { timeout: 500})

    const selectedNodes = figma.currentPage.selection;
    if (selectedNodes.length === 0) {
      figma.closePlugin(`❌ No layers selected. Please select at least one layer and try again.`);
      return;
    }
    const textNodes = selectedNodes.flatMap(node => {
      if (node.type === 'TEXT') {
        return [node as TextNode];
      } else if ('findAll' in node) {
        return node.findAll((n: SceneNode) => n.type === 'TEXT') as TextNode[];
      }
      return [];
    });

    if (textNodes.length === 0) {
      console.log(`No text nodes found in the selected layers.`)
      figma.closePlugin(`❌ No text nodes found in the selected layers. Please select layers with text and try again.`);
      return;
    }
    showNotification(`Processing ${textNodes.length} text layers...`, { timeout: 500 })

    const results = await Promise.all(textNodes.map(processTextNode));
    const count = results.filter(Boolean).length;
    console.log(`All done. Processed ${count} nodes.`);
    figma.closePlugin(`✅ ${count} text layers have been updated.`)
  })
  .catch((error) => {
    console.error(`Failed to load fonts:`, error)
    figma.closePlugin(`❌ Failed to load fonts. Please check if ${fontName} is installed and try again.`)
  })

function getFontStyle(cssWeight: number) {
  if (cssWeight <= 149) return 'Thin';
  if (cssWeight < 250) return 'ExtraLight';
  if (cssWeight < 350) return 'Light';
  if (cssWeight < 450) return 'Regular';
  if (cssWeight < 550) return 'Medium';
  if (cssWeight < 650) return 'SemiBold';
  if (cssWeight < 750) return 'Bold';
  if (cssWeight < 850) return 'ExtraBold';
  return 'Black';
}
