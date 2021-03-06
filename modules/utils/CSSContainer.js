import prefixer from './prefixer'
import cssifyObject from './cssifyObject'

export default class CSSContainer {
  constructor() {
    this.CSSRules = new Map()
    this.keyframes = new Map()
    this.mediaQueries = new Map()
    this.fontFaces = new Set()
    this._listener = new Set()
  }

  addSelector(selector, styles) {
    if (!this.CSSRules.has(selector)) {
      this.CSSRules.set(selector, styles)
      this._executeListener()
    }
  }

  removeSelector(selector) {
    if (this.CSSRules.has(selector)) {
      this.CSSRules.delete(selector)
      this._executeListener()
    }
  }

  addFontFace(fontFace) {
    const fontFaceString = '@font-face {' + cssifyObject(fontFace) + '}'
    if (this.fontFaces.has(fontFaceString)) {
      this.fontFaces.add(fontFaceString)
      this._executeListener()
    }
  }

  addKeyframes(animationName, frames) {
    if (!this.keyframes.has(animationName)) {
      this.keyframes.set(animationName, frames)
      this._executeListener()
    }
  }

  removeKeyframes(animationName) {
    if (this.keyframes.has(animationName)) {
      this.keyframes.delete(animationName)
      this._executeListener()
    }
  }

  addMediaQuery(media, selector, styles) {
    if (!this.mediaQueries.has(media)) {
      this.mediaQueries.set(media, new Map())
    }
    if (!this.mediaQueries.get(media).has(selector)) {
      this.mediaQueries.get(media).set(selector, styles)
      this._executeListener()
    }
  }

  removeMediaQuery(media, selector) {
    if (this.mediaQueries.has(media)) {
      if (this.mediaQueries.get(media).has(selector)) {
        this.mediaQueries.get(media).remove(selector)
        this._executeListener()
      }
    }
  }

  getCSSString(userAgent) {
    let CSSString = ''

    const prefixedKeyframes = prefixer(userAgent).prefixedKeyframes
    this.CSSRules.forEach((styles, selector) => CSSString += selector + '{' + cssifyObject(styles, false, userAgent) + '}\n')
    this.keyframes.forEach((frames, name) => CSSString += '@' + prefixedKeyframes + ' ' + name + '{' + cssifyObject(frames, false, userAgent) + '}\n')
    this.fontFaces.forEach(font => CSSString += font + '\n')
    this.mediaQueries.forEach((selectors, media) => {
      CSSString += '@media ' + media + '{'
      selectors.forEach((styles, selector) => CSSString += selector + '{' + cssifyObject(styles, true, userAgent) + '}\n')
      CSSString += '}'
    })

    return CSSString
  }

  subscribe(listener) {
    this._listener.add(listener)

    const remove = () => this.unsubscribe(listener)
    return remove
  }

  unsubscribe(listener) {
    this._listener.delete(listener)
  }

  _executeListener() {
    this._listener.forEach(listener => listener())
  }
}
