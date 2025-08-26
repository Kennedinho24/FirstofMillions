export default {
  myVar1: [],
  myVar2: {},

  myFun1() {
    this.myVar1 = [1, 2, 3];
  },

  async myFun2() {
    await storeValue('varName', 'hello world');
  },

  focusNextInput() {
    const inputs = document.querySelectorAll("input");
    const active = document.activeElement;
    const index = Array.from(inputs).indexOf(active);
    if (index >= 0 && index < inputs.length - 1) {
      inputs[index + 1].focus();
    }
  }
}
