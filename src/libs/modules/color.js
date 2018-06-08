
/**
 * 支持三种新建形式
 * new Color(0xFF, 0, 0);
 * new Color(0xFF0000);
 * new Color("#FFFF00");
 */
class Color{
    constructor(r, g, b){
        if (typeof r == 'string' && r.startsWith('#')){
            let col = parseInt(r.slice(1), 16);
            let cr = (col & 0xFF0000) >> 16;
            let cg = (col & 0x00FF00) >> 8;
            let cb = (col & 0x0000FF);
            this.color = cr | (cg << 8) | (cb << 16);
            this.color_str = r;
        } else if (typeof r == 'number'){
            if (typeof g == 'number' && typeof b == 'number') {
                this.color = r | (g << 8) | (b << 16);
                let c = b | (g << 8) | (r << 16);
                this.color_str = '#' + c.toString(16).padStart(6, '0');
            } else {
                let cr = (r & 0xFF0000) >> 16;
                let cg = (r & 0x00FF00) >> 8;
                let cb = r & 0x0000FF;
                this.color = cr | (cg << 8) | (cb << 16);
                this.color_str = '#' + r.toString(16).padStart(6, '0');
            }
        }
    }
    toJSON(){
        return this.color;
    }
    toString(){
        return this.color_str;
    }
}

const RED = new Color(0xFF, 0, 0);
const GREEN = new Color(0, 0xFF, 0);
const BLUE = new Color(0, 0, 0xFF);
const CYAN = new Color(0, 0xFF, 0xFF);
const BLACK = new Color(0, 0, 0);
const WHITE = new Color(0xFF, 0xFF, 0xFF);
const GRAY = new Color(0x80, 0x80, 0x80);
const MAGENTA = new Color(0xFF, 0, 0xFF);
const YELLOW = new Color(0xFF, 0xFF, 0);
const LIGHTGRAY = new Color(0xD3, 0xD3, 0xD3);
const LIGHTRED = new Color(0xF0, 0x80, 0x80);
const LIGHTGREEN = new Color(0x90, 0xEE, 0x90);
const LIGHTBLUE = new Color(0x8C, 0xCE, 0xFA);