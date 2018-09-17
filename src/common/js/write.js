/* eslint-disable */
export function writeInto() {
  var fso
  try {
    // fso = new ActiveXObject('Scripting.FileSystemObject')
    fso = new ActiveXObject("Scripting.FileSystemObject")
  } catch (e) {
    alert('当前浏览器不支持')
    return
  }
  var f1 = fso.createtextfile('C:\\1.txt', true)
  return f1
}
