/**
 * Check if the given object is empty or not. 
 * 
 * @param {Object} obj 
 */
function isEmptyObject(obj) {
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        return false;
      }
    }
    return true;
  }
  
  
  module.exports = isEmptyObject;