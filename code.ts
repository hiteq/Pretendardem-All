// 아래의 순서대로 작동하는 figma의 Run Once 타입 플러그인 용 ts 코드를 작성해 줘.
// 1. 현재 page에서 `Pretendard Variable`의 모든 폰트가 로드되는 것을 기다립니다.
// 2. 현재 page에 있는 모든 text 요소를 가져옵니다.
// 3. 각 text 요소의 fontWeight의 값(예시:100~900)을 체크하고, fontWeight가 149이하는 “Pretendard Variable”폰트의 Thin, 150이상 250미만은 “Pretendard Variable”폰트의 ExtraLight, 250 이상 350미만은 “Pretendard Variable”폰트의 Light, 350이상 450미만은 “Pretendard Variable”폰트의 Regular, 450이상 550미만은 “Pretendard Variable”폰트의 Medium, 550이상 650미만은 “Pretendard Variable”폰트의 SemiBold, 650이상 750미만은 “Pretendard Variable”폰트의 Bold, 750이상 850미만은 “Pretendard Variable”폰트의 ExtraBold, 850이상은 “Pretendard Variable”폰트의 Black으로 지정한다.
// 4. 작업이 완료되면 플러그인을 종료합니다.

// 1. 현재 page에서 `Pretendard Variable`의 모든 폰트가 로드되는 것을 기다립니다.
// font400이 1000ms 이내에 로드되지 않으면 에러를 띄웁니다.

const loadFonts = async () => {
  console.log(`Awaiting the fonts.`)
  await figma.loadFontAsync({ family: `Pretendard Variable`, style: `Regular` })
  await figma.loadFontAsync({ family: `Pretendard Variable`, style: `Thin` })
  await figma.loadFontAsync({ family: `Pretendard Variable`, style: `ExtraLight` })
  await figma.loadFontAsync({ family: `Pretendard Variable`, style: `Light` })
  await figma.loadFontAsync({ family: `Pretendard Variable`, style: `Medium` })
  await figma.loadFontAsync({ family: `Pretendard Variable`, style: `SemiBold` })
  await figma.loadFontAsync({ family: `Pretendard Variable`, style: `Bold` })
  await figma.loadFontAsync({ family: `Pretendard Variable`, style: `ExtraBold` })
  await figma.loadFontAsync({ family: `Pretendard Variable`, style: `Black` })
}

loadFonts()
  .then(() => {
    console.log(`Fonts loaded.`)
    figma.notify(`Change all the text layers on the current page to Pretendard Variable.`, { timeout: 500})

    // 2. 현재 page에 있는 모든 text 요소를 가져옵니다.
    const textNodes = figma.currentPage.findAllWithCriteria({ types: ['TEXT'] })
    let count = 0
    let ignored = 0
    // 처리해야할 레이어의 수를 textNodes.length로 알려줍니다.
    // onDequeue되는 경우 즉시 종료되는 것을 방지하기 위해 timeout을 0으로 설정합니다.
    figma.notify(`Processing ${textNodes.length} layers...`, { timeout: 500 })

    // 3. 각 text 요소의 font-weight를 체크하고 그에 맞는 Pretendard Variable 폰트로 지정합니다.
    for (const textNode of textNodes) {

      // textNode의 fontWeight가 figma.mixed일 경우, 아래에 cssWeight로 처리하는것을 무시하고 fontWeight를 출력한다.
      if (textNode.fontWeight === figma.mixed) {
        // figma.mixed일 경우, 한 글자씩 checkFontWeight를 실행한다.        
        count++

        continue
      }

      const cssWeight = Number(textNode.fontWeight)
      //family에 `Pretendard Variable`, style에는 checkFontWeight의 string 리턴값을 넣어준다.
      textNode.fontName = { family: `Pretendard Variable`, style: String(checkFontWeight(cssWeight)) }

      count++

    }
    // 4. 작업이 완료되면 작업이 끝났음을 notify하고 플러그인을 종료합니다.
    console.log(`All done.`)
    figma.closePlugin(`All ${count} text layers have been updated.`)
  })
  .catch((error) => {
    console.log(error)
    figma.closePlugin(`Failed to load fonts. Please check if the Pretendard Variable is installed and try again.`)
    
  })

function checkFontWeight(cssWeight: number) {
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
  }
}
