// 아래의 순서대로 작동하는 figma의 Run Once 타입 플러그인 용 ts 코드를 작성해 줘.
// 1. 현재 page에서 "Pretendard Variable"의 모든 폰트가 로드되는 것을 기다립니다.
// 2. 현재 page에 있는 모든 text 요소를 가져옵니다.
// 3. 각 text 요소의 fontWeight의 값(예시:100~900)을 체크하고, fontWeight가 149이하는 “Pretendard Variable”폰트의 Thin, 150이상 250미만은 “Pretendard Variable”폰트의 ExtraLight, 250 이상 350미만은 “Pretendard Variable”폰트의 Light, 350이상 450미만은 “Pretendard Variable”폰트의 Regular, 450이상 550미만은 “Pretendard Variable”폰트의 Medium, 550이상 650미만은 “Pretendard Variable”폰트의 SemiBold, 650이상 750미만은 “Pretendard Variable”폰트의 Bold, 750이상 850미만은 “Pretendard Variable”폰트의 ExtraBold, 850이상은 “Pretendard Variable”폰트의 Black으로 지정한다.
// 4. 작업이 완료되면 플러그인을 종료합니다.

const font400 = figma.loadFontAsync({ family: "Pretendard Variable", style: "Regular" })
const font100 = figma.loadFontAsync({ family: "Pretendard Variable", style: "Thin" })
const font200 = figma.loadFontAsync({ family: "Pretendard Variable", style: "ExtraLight" })
const font300 = figma.loadFontAsync({ family: "Pretendard Variable", style: "Light" })
const font500 = figma.loadFontAsync({ family: "Pretendard Variable", style: "Medium" })
const font600 = figma.loadFontAsync({ family: "Pretendard Variable", style: "SemiBold" })
const font700 = figma.loadFontAsync({ family: "Pretendard Variable", style: "Bold" })
const font800 = figma.loadFontAsync({ family: "Pretendard Variable", style: "ExtraBold" })
const font900 = figma.loadFontAsync({ family: "Pretendard Variable", style: "Black" })

Promise.all([font400, font100, font200, font300, font500, font600, font700, font800, font900])
  .then(() => {
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
        // 한 글자씩 family에 "Pretendard Variable", style에는 checkFontWeight의 string 리턴값을 넣어준다.
        // for (let i = 0; i < textNode.characters.length; i++) {
        //   const cssWeight = Number(textNode.getRangeFontName(i, i + 1)[0].style)
        //   textNode.setRangeFontName(i, i + 1, { family: "Pretendard Variable", style: String(checkFontWeight(cssWeight)) })
        // }
        count++

        continue
      }

      const cssWeight = Number(textNode.fontWeight)
      //family에 "Pretendard Variable", style에는 checkFontWeight의 string 리턴값을 넣어준다.
      textNode.fontName = { family: "Pretendard Variable", style: String(checkFontWeight(cssWeight)) }

      count++
      
    }
    // 4. 작업이 완료되면 작업이 끝났음을 notify하고 플러그인을 종료합니다.
    figma.notify(`All ${count} text layers have been updated.`)
    figma.closePlugin()
  })

  function setFontName (textNode: { type: "TEXT" } & TextNode, cssWeight: number) {
    if (cssWeight <= 149) {
      textNode.fontName = { family: "Pretendard Variable", style: "Thin" }
    } else if (cssWeight >= 150 && cssWeight < 250) {
      textNode.fontName = { family: "Pretendard Variable", style: "ExtraLight" }
    } else if (cssWeight >= 250 && cssWeight < 350) {
      textNode.fontName = { family: "Pretendard Variable", style: "Light" }
    } else if (cssWeight >= 350 && cssWeight < 450) {
      textNode.fontName = { family: "Pretendard Variable", style: "Regular" }
    } else if (cssWeight >= 450 && cssWeight < 550) {
      textNode.fontName = { family: "Pretendard Variable", style: "Medium" }
    } else if (cssWeight >= 550 && cssWeight < 650) {
      textNode.fontName = { family: "Pretendard Variable", style: "SemiBold" }
    } else if (cssWeight >= 650 && cssWeight < 750) {
      textNode.fontName = { family: "Pretendard Variable", style: "Bold" }
    } else if (cssWeight >= 750 && cssWeight < 850) {
      textNode.fontName = { family: "Pretendard Variable", style: "ExtraBold" }
    } else if (cssWeight >= 850) {
      textNode.fontName = { family: "Pretendard Variable", style: "Black" }
    }
  }
  
  // 위의 setFontName의 코드를 참고하여, style만 반환하는 checkFontWeight 함수를 만들어보세요.
  // return값은 string type입니다.
  function checkFontWeight (cssWeight: number) {
    if (cssWeight <= 149) {
      return "Thin"
    } else if (cssWeight >= 150 && cssWeight < 250) {
      return "ExtraLight"
    } else if (cssWeight >= 250 && cssWeight < 350) {
      return "Light"
    } else if (cssWeight >= 350 && cssWeight < 450) {
      return "Regular"
    } else if (cssWeight >= 450 && cssWeight < 550) {
      return "Medium"
    } else if (cssWeight >= 550 && cssWeight < 650) {
      return "SemiBold"
    } else if (cssWeight >= 650 && cssWeight < 750) {
      return "Bold"
    } else if (cssWeight >= 750 && cssWeight < 850) {
      return "ExtraBold"
    } else if (cssWeight >= 850) {
      return "Black"
    }
  }
