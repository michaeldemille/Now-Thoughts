
export class EngageUtil {

  static isHexColor(color) {
    return color.search('#') > -1;
  }

  static isRgbColor(color) {
    return color.search('rgb') > -1;
  }

  static handleContext(context, which?): any {
    if (!context && which === 'style') return {};
    else if (!context && which == 'class') return '';

    if(this.isHexColor(context) || this.isRgbColor(context)) {
      return {
        backgroundColor: context
      }
    } else {
      return context + '';
    }
  }

}
