"use strict";var __extends=this&&this.__extends||function(){var r=function(t,e){return(r=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&(t[o]=e[o])})(t,e)};return function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Class extends value "+String(e)+" is not a constructor or null");function o(){this.constructor=t}r(t,e),t.prototype=null===e?Object.create(e):(o.prototype=e.prototype,new o)}}(),__importDefault=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};Object.defineProperty(exports,"__esModule",{value:!0});var Validator_1=__importDefault(require("./Validator")),constants_1=require("../constants"),MaxLengthValidator=function(e){function t(t){return void 0===t&&(t=constants_1.DEFAULT_ERROR_MESSAGES.MAX_LENGTH),e.call(this,constants_1.ValidationKeys.MAX_LENGTH,t)||this}return __extends(t,e),t.prototype.hasErrors=function(t,e,o){if(void 0!==t)return t.length>e?this.getMessage(o||this.message,e):void 0},t}(Validator_1.default);exports.default=MaxLengthValidator;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhbGlkYXRpb24vVmFsaWRhdG9ycy9NYXhMZW5ndGhWYWxpZGF0b3IuanMiLCJ2YWxpZGF0aW9uL1ZhbGlkYXRvcnMvTWF4TGVuZ3RoVmFsaWRhdG9yLnRzIl0sIm5hbWVzIjpbIl9fZXh0ZW5kcyIsInRoaXMiLCJleHRlbmRTdGF0aWNzIiwiT2JqZWN0Iiwic2V0UHJvdG90eXBlT2YiLCJBcnJheSIsImQiLCJiIiwiX19wcm90b19fIiwicCIsInByb3RvdHlwZSIsImhhc093blByb3BlcnR5IiwiY2FsbCIsIlR5cGVFcnJvciIsIlN0cmluZyIsImNvbnN0cnVjdG9yIiwiY3JlYXRlIiwiX18iLCJfX2ltcG9ydERlZmF1bHQiLCJtb2QiLCJfX2VzTW9kdWxlIiwiZGVmYXVsdCIsImRlZmluZVByb3BlcnR5IiwiZXhwb3J0cyIsInZhbHVlIiwiVmFsaWRhdG9yXzEiLCJyZXF1aXJlIiwiY29uc3RhbnRzXzEiLCJNYXhMZW5ndGhWYWxpZGF0b3IiLCJfc3VwZXIiLCJtZXNzYWdlIiwiREVGQVVMVF9FUlJPUl9NRVNTQUdFUyIsIk1BWF9MRU5HVEgiLCJWYWxpZGF0aW9uS2V5cyIsImhhc0Vycm9ycyIsIm1heGxlbmd0aCIsInVuZGVmaW5lZCIsImxlbmd0aCIsImdldE1lc3NhZ2UiXSwibWFwcGluZ3MiOiJhQUNBLElBQUlBLFVBQWFDLE1BQVFBLEtBQUtELFdBQWUsV0FBekNBLElBQUFBLEVBQXFCLFNBQUtBLEVBQUFBLEdBR2pCLE9BRkxFLEVBQWdCQyxPQUFBQyxnQkFDaEJGLENBQUFBLFVBQXNCLGNBQU5HLE9BQ1gsU0FBQUMsRUFBQUMsR0FBQUQsRUFBQUUsVUFBQUQsSUFBRUMsU0FBV0YsRUFBQUMsR0FBQSxJQUFBLElBQUFFLEtBQUFGLEVBQUFKLE9BQUFPLFVBQUFDLGVBQUFDLEtBQUFMLEVBQUFFLEtBQUFILEVBQUFHLEdBQUFGLEVBQUFFLE1BQXlCSCxFQUFBQyxJQUFvQyxPQUMzRSxTQUFBRCxFQUFBQyxHQUFrQixHQUFpQixtQkFBakJBLEdBQXNDSSxPQUFWRCxFQUZsRCxNQUFBLElBQUFHLFVBQUEsdUJBQUFDLE9BQUFQLEdBQUEsaUNBR0EsU0FBT0wsSUFBYUQsS0FBQWMsWUFBcEJULEVBS0FKLEVBQWNJLEVBQUdDLEdBVHJCRCxFQUFBSSxVQUFBLE9BQUFILEVBQUFKLE9BQUFhLE9BQUFULElBQUFVLEVBQUFQLFVBQUFILEVBQUFHLFVBQUEsSUFBQU8sSUFEeUMsR0FRckNDLGdCQUFpQmpCLE1BQWJBLEtBQTRCaUIsaUJBQ3RCLFNBQUFDLEdBQ1ZqQixPQUFBQSxHQUFhaUIsRUFBYkMsV0FBQUQsRUFBQSxDQUFBRSxRQUFBRixJQUNBaEIsT0FBQW1CLGVBQWNDLFFBQUEsYUFBQSxDQUFBQyxPQUFBLElDWHRCLElBQUFDLFlBQUFQLGdCQUFBUSxRQUFBLGdCQUNBQyxZQUFBRCxRQUFBLGdCQVNBRSxtQkFBQSxTQUFBQyxHQUNJLFNBQUFELEVBQVlFLEdEY1IsWUNkUSxJQUFBQSxJQUFBQSxFQUFrQkgsWUFBQUksdUJBQXVCQyxZQUNqREgsRUFBQWpCLEtBQUFYLEtBQU0wQixZQUFBTSxlQUFlRCxXQUFZRixJQUFRN0IsS0FRakQsT0FWZ0RELFVBQUE0QixFQUFBQyxHQUs1Q0QsRUFBQWxCLFVBQUF3QixVQUFBLFNBQVVWLEVBQWVXLEVBQW1CTCxHQUN4QyxRQUFjTSxJQUFWWixFQUVKLE9BQU9BLEVBQU1hLE9BQVNGLEVBQVlsQyxLQUFLcUMsV0FBV1IsR0FBVzdCLEtBQUs2QixRQUFTSyxRQUFhQyxHQUVoR1IsRUFWQSxDQUFnREgsWUFBQUosU0RRSEUsUUFBN0NGLFFBQUFPIiwiZmlsZSI6InZhbGlkYXRpb24vVmFsaWRhdG9ycy9NYXhMZW5ndGhWYWxpZGF0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZXh0ZW5kU3RhdGljcyA9IGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcbiAgICAgICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcbiAgICAgICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChiLCBwKSkgZFtwXSA9IGJbcF07IH07XG4gICAgICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYiAhPT0gXCJmdW5jdGlvblwiICYmIGIgIT09IG51bGwpXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2xhc3MgZXh0ZW5kcyB2YWx1ZSBcIiArIFN0cmluZyhiKSArIFwiIGlzIG5vdCBhIGNvbnN0cnVjdG9yIG9yIG51bGxcIik7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG4gICAgfTtcbn0pKCk7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgVmFsaWRhdG9yXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vVmFsaWRhdG9yXCIpKTtcbnZhciBjb25zdGFudHNfMSA9IHJlcXVpcmUoXCIuLi9jb25zdGFudHNcIik7XG52YXIgTWF4TGVuZ3RoVmFsaWRhdG9yID0gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICBfX2V4dGVuZHMoTWF4TGVuZ3RoVmFsaWRhdG9yLCBfc3VwZXIpO1xuICAgIGZ1bmN0aW9uIE1heExlbmd0aFZhbGlkYXRvcihtZXNzYWdlKSB7XG4gICAgICAgIGlmIChtZXNzYWdlID09PSB2b2lkIDApIHsgbWVzc2FnZSA9IGNvbnN0YW50c18xLkRFRkFVTFRfRVJST1JfTUVTU0FHRVMuTUFYX0xFTkdUSDsgfVxuICAgICAgICByZXR1cm4gX3N1cGVyLmNhbGwodGhpcywgY29uc3RhbnRzXzEuVmFsaWRhdGlvbktleXMuTUFYX0xFTkdUSCwgbWVzc2FnZSkgfHwgdGhpcztcbiAgICB9XG4gICAgTWF4TGVuZ3RoVmFsaWRhdG9yLnByb3RvdHlwZS5oYXNFcnJvcnMgPSBmdW5jdGlvbiAodmFsdWUsIG1heGxlbmd0aCwgbWVzc2FnZSkge1xuICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgcmV0dXJuIHZhbHVlLmxlbmd0aCA+IG1heGxlbmd0aCA/IHRoaXMuZ2V0TWVzc2FnZShtZXNzYWdlIHx8IHRoaXMubWVzc2FnZSwgbWF4bGVuZ3RoKSA6IHVuZGVmaW5lZDtcbiAgICB9O1xuICAgIHJldHVybiBNYXhMZW5ndGhWYWxpZGF0b3I7XG59KFZhbGlkYXRvcl8xLmRlZmF1bHQpKTtcbmV4cG9ydHMuZGVmYXVsdCA9IE1heExlbmd0aFZhbGlkYXRvcjsiLCJpbXBvcnQge0Vycm9yc30gZnJvbSBcIi4uL3R5cGVzXCI7XG5pbXBvcnQgVmFsaWRhdG9yIGZyb20gXCIuL1ZhbGlkYXRvclwiO1xuaW1wb3J0IHtWYWxpZGF0aW9uS2V5cywgREVGQVVMVF9FUlJPUl9NRVNTQUdFU30gZnJvbSBcIi4uL2NvbnN0YW50c1wiO1xuXG4vKipcbiAqIE1heCBMZW5ndGggVmFsaWRhdG9yXG4gKlxuICogQGNsYXNzIE1heExlbmd0aFZhbGlkYXRvclxuICogQGV4dGVuZHMgVmFsaWRhdG9yXG4gKiBAbWVtYmVyT2YgVmFsaWRhdG9yc1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNYXhMZW5ndGhWYWxpZGF0b3IgZXh0ZW5kcyBWYWxpZGF0b3Ige1xuICAgIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZyA9IERFRkFVTFRfRVJST1JfTUVTU0FHRVMuTUFYX0xFTkdUSCl7XG4gICAgICAgIHN1cGVyKFZhbGlkYXRpb25LZXlzLk1BWF9MRU5HVEgsIG1lc3NhZ2UpXG4gICAgfVxuXG4gICAgaGFzRXJyb3JzKHZhbHVlOiBzdHJpbmcsIG1heGxlbmd0aDogbnVtYmVyLCBtZXNzYWdlPzogc3RyaW5nKTogRXJyb3JzIHtcbiAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHJldHVybiB2YWx1ZS5sZW5ndGggPiBtYXhsZW5ndGggPyB0aGlzLmdldE1lc3NhZ2UobWVzc2FnZSB8fCB0aGlzLm1lc3NhZ2UsIG1heGxlbmd0aCkgOiB1bmRlZmluZWQ7XG4gICAgfVxufSJdfQ==