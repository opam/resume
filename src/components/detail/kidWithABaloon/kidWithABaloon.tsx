import * as React from 'react';
import './kidWithABaloon.css';
import './kidWithABaloon_mobile.css';
import Kid from './kid';

export default class KidWithABaloon extends React.Component<{
  name: string;
}, {}> {

  SCROLL_KID = false;

  baloon: HTMLElement;
  line:HTMLElement;
  kidPlaceholder:HTMLElement;
  baloonTimeout: any;

  isResizing = false;
  resizeTimer:any;
  resizeListener: any;
  resizeCallback = (event) => {
    this.setBaloonAndLinePosition(this.baloon, 0, 0, null);

    if(this.SCROLL_KID === true) {
      const pushDown = this.getScrollPositionOfKidWhenMoreThanScrolLimit();
      this.calculatePositionForAKid(this.baloon, this.kidPlaceholder, pushDown === -1 ? 0 : pushDown);
    } else {
      this.calculatePositionForAKid(this.baloon, this.kidPlaceholder);
    }

    // on end of resize
    this.isResizing = true;
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.isResizing = false;
    }, 100);
  }

  isScrolling = false;
  scrollListener: any;
  scrollCallback = (event) => {

    const pushDown = this.getScrollPositionOfKidWhenMoreThanScrolLimit();
    if(pushDown !== -1)
      this.calculatePositionForAKid(this.baloon, this.kidPlaceholder, pushDown);

    // on end of scroll
    this.isScrolling = true;
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.isScrolling = false;
    }, 100);
  }

  getScrollPositionOfKidWhenMoreThanScrolLimit():number {
    const SCROLL_MIN_LIMIT = 200;

    const scrollTop = this.getWindowScrollTopPosition();
    if(scrollTop > SCROLL_MIN_LIMIT) {
        return scrollTop - SCROLL_MIN_LIMIT;
    } else
      return -1;
  }

  getWindowScrollTopPosition():number {
    const doc = document.documentElement;
    return (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
  }

  componentDidMount() {
    this.flyBaloon(this.baloon, this.line, this.kidPlaceholder);
    this.calculatePositionForAKid(this.baloon, this.kidPlaceholder);
    this.resizeListener = this.installResizeListener( this.resizeCallback);

    if(this.SCROLL_KID === true)
      this.scrollListener = this.installScrollListener( this.scrollCallback);
  }

  componentWillUnmount() {
    this.stopFlyBaloon();
    this.resizeListener = this.removeResizeListener(this.resizeCallback);

    if(this.SCROLL_KID === true)
      this.scrollListener = this.removeScrollListener(this.scrollCallback);
  }

  calculatePositionForAKid(baloon:any, kid:any, pushDown:number = 0) {
    if(baloon === undefined || kid === undefined) {
      return;
    }

    const bubbleNode = this.findAncestor(baloon, 'bubble');
    const bubblesNode = this.findAncestor(baloon, 'bubbles'); /* must have position relative ! */

    // fix kid 20px from right edge
    const bubbleLeft = bubbleNode.offsetLeft;
    const bubblesWidth = bubblesNode.offsetWidth;
    const kidWidth = kid.childNodes[0].offsetWidth; /* must take child, because kid is just a placeholder with size 1x1px and inside is real kid */
    const PUSH_KID_FROM_RIGHT_SIDE = 10;
    const kidLeft = bubblesWidth - bubbleLeft - kidWidth - PUSH_KID_FROM_RIGHT_SIDE; /* we want to be 100 px from right */
    kid.style.left = kidLeft + 'px';

    this.setTopPositionOfKid(baloon, kid, pushDown);
  }

  setTopPositionOfKid(baloon:any, kid:any, pushDown:number) {
    const bubbleNode = this.findAncestor(baloon, 'bubble');
    const bubblesNode = this.findAncestor(baloon, 'bubbles'); /* must have position relative ! */

    // fix kid 150px below container of bubbles
    const bubbleTop = bubbleNode.offsetTop;
    const bubblesHeight = bubblesNode.offsetHeight;
    const PUSH_KID_FROM_TOP_SIDE = 145;
    const kidTop = bubblesHeight - bubbleTop + PUSH_KID_FROM_TOP_SIDE + pushDown; /* we want to be 100 px from right */
    kid.style.top = kidTop + 'px';
    this.setBaloonAndLinePosition(baloon, this.getNumValue(baloon.style.top), this.getNumValue(baloon.style.left), null);
  }

  canFly = true;
  stopFlyBaloon = () => {
    if(!!this.baloonTimeout) {
      this.canFly = false;
      clearTimeout(this.baloonTimeout);
    }
  }

  flyBaloonAway = () => {
    this.stopFlyBaloon();
    if(!this.baloon) {
      return;
    }
    this.line.style.display = 'none';
    setTimeout( ()=> {
      this.baloon.className = this.baloon.className + ' flyAway';
      this.kidPlaceholder.className = this.kidPlaceholder.className + ' waveHand noclickhere';
      this.baloon.style.top =  '-500px';
      this.baloon.style.left = '-500px';
      this.baloon.style.opacity = '0';
      setTimeout( ()=> {
          if(this.kidPlaceholder !== null) {
            this.kidPlaceholder.className = this.kidPlaceholder.className + ' sad';
          }
      },5000);
    },300);
  }

  flyBaloon = (baloon:any, line:any, kid:any) => {
    let TIMEOUT = 4 * 100; // minimum 100 ms
    const fly = () => {
      if(baloon === undefined || line === undefined || kid === undefined) {
        return;
      }

      const BALOON_MOVEMENT = 1; /* if you want to use more have to set transition for line and baloon */
      let left = this.getNewRandomPosition(baloon.style.left, BALOON_MOVEMENT);
      let  top = this.getNewRandomPosition(baloon.style.top, BALOON_MOVEMENT);

      const repeatMovement:number = TIMEOUT/100 - 1;
      const SUBTIMEOUT = TIMEOUT/(repeatMovement+1);
      const addTop = this.getRandomBoolean();
      const addLeft = this.getRandomBoolean();
      for(let i=0; i<repeatMovement;i++) {
        // set position and repeat X times
        if(!!this.baloonTimeout) {
          this.setBaloonAndLinePosition(baloon, top, left, repeatMovement, BALOON_MOVEMENT, addTop, addLeft, SUBTIMEOUT);
        }
      }
    };
    this.baloonTimeout = setInterval( ()=> {
      if(this.canFly === true && this.isResizing === false && this.isScrolling === false) {
      fly();
      }
    }, TIMEOUT);
  }



  setBaloonAndLinePosition(baloon:any, top:number, left:number, repeat:number|null, step?:number, addTop?:boolean, addLeft?:boolean, timeout?:number) {
    if(!this.baloonTimeout)
      return;

    baloon.style.left = left + 'px';
    baloon.style.top = top + 'px';
    const bottomForLine = this.getNumValue(top + baloon.offsetHeight);
    const leftForLine =  this.getNumValue( (left + (baloon.offsetWidth  / 2)).toString() );
    this.adjustBaloonLine([ bottomForLine, leftForLine ]);

    if(repeat === null)
      return;

    if(repeat > 0) {
      setTimeout(() => {
        top   = addTop  ? top   + step   : top - step;
        left  = addLeft ? left  + step   : left - step;
        repeat = repeat -1;
        this.setBaloonAndLinePosition(baloon, top, left, repeat, step, addTop, addLeft, timeout);
      }, timeout);
    }
  }

  findAncestor(element: HTMLElement, classOnAncestor:string) {
    while ((element = element.parentElement) && !element.classList.contains(classOnAncestor));
    return element;
  }

  getNumValue(stringValue: string): number {
    let value = parseInt(stringValue,10);
    return isNaN(value) ? 0 : value;
  }

  getNewNegativePosition(currentNumber:string|null):string {
    if(currentNumber === null) {

      return '';
    }
    let current:number = parseInt(currentNumber,10);
    const r = isNaN(current) ? '0px' : (current - 10)+'px';
    return r;
  }

  getNewRandomPosition(currentNumber:string, tolerance:number):number {
    const current = this.getNumValue(currentNumber);
    const randomNumber = this.randomIntFromInterval(current-tolerance, current+tolerance);
    return randomNumber >= 0 ? randomNumber : current;
  }
  randomIntFromInterval(min:number, max:number):number {
    return Math.floor(Math.random()*(max-min+1)+min);
  }

  adjustBaloonLine(setThisPositions: [number, number]) {
    if(!this.line || !this.baloon || !this.kidPlaceholder) {
      return;
    }
    this.adjustLine(this.baloon, this.kidPlaceholder, this.line, setThisPositions);
  }

  adjustLine(from:any, to:any, line:any, setThisPositions:[number, number]) {

    const  fT = setThisPositions[0];
    const  fL = setThisPositions[1]
    const  tT = to.offsetTop 	 + to.offsetHeight/2;
    const  tL = to.offsetLeft 	 + to.offsetWidth/2;

    const CA   = Math.abs(tT - fT);
    const CO   = Math.abs(tL - fL);
    const H    = Math.sqrt(CA*CA + CO*CO);
    let ANG  = 180 / Math.PI * Math.acos( CA/H );
    let top = (tT > fT) ? (tT-fT)/2 + fT : (fT-tT)/2 + tT;
    let left = (tL > fL) ? (tL-fL)/2 + fL : (fL-tL)/2 + tL;

    if(( fT < tT && fL < tL) || ( tT < fT && tL < fL) || (fT > tT && fL > tL) || (tT > fT && tL > fL)) {
      ANG *= -1;
    }
    top-= H/2;

    line.style['-webkit-transform'] = 'rotate('+ ANG +'deg)';
    line.style['-moz-transform'] = 'rotate('+ ANG +'deg)';
    line.style['-ms-transform'] = 'rotate('+ ANG +'deg)';
    line.style['-o-transform'] = 'rotate('+ ANG +'deg)';
    line.style['-transform'] = 'rotate('+ ANG +'deg)';
    line.style.top    = this.getNumValue(top)+'px';
    line.style.left   = this.getNumValue(left)+'px';
    line.style.height = (H) + 'px';
  }

  getRandomBoolean(): boolean {
    return Math.random() >= 0.5;
  }

  installResizeListener(callback:any): void {
    return window.addEventListener("resize", callback);
  }
  removeResizeListener(callback: any):null {
    window.removeEventListener("resize", callback);
    return null;
  }

  installScrollListener(callback:any): void {
    return window.addEventListener("scroll", callback);
  }
  removeScrollListener(callback: any):null {
    window.removeEventListener("scroll", callback);
    return null;
  }

  offsetRelativeToDocument(el: HTMLElement): { top:number, left:number } {
    var rect = el.getBoundingClientRect(),
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
  }

  render() {
    if(! this.props.name || this.props.name==='') {
        return '';
    }
    return (
      <div className="baloon-container" >
          <div className="line"   ref={(elem) => {this.line  = elem}} />
          <div className="baloon" ref={(elem) => {this.baloon = elem}}>
            <div
              className="heart-container"
              onClick={()=>{ this.flyBaloonAway(); }}
            >
              <div className="heart">
                {this.props.name}
                <div className="leftTop"/>
                <div className="rightTop"/>
                <div className="bottomMiddle"/>
              </div>
            </div>
          </div>
          <div
            className="kid-placeholder"
            ref={(elem) => {this.kidPlaceholder  = elem}}
            onClick={()=>{ this.flyBaloonAway() }}
          >
            <Kid />
          </div>
    </div>
    );

  }
}
