webpackJsonp([1],{134:function(t,e,n){"use strict";function o(t,e){window.googleAnalytics&&window.googleAnalytics("send","event",t,e)}n(135);var i=n(18),l=function(){return!(!window.webkitAudioContext&&!window.AudioContext)},a=function(){var t=document.createElement("canvas");try{return window.WebGLRenderingContext&&(t.getContext("webgl")||t.getContext("experimental-webgl"))}catch(t){return!1}};(0,function(t){return t&&t.__esModule?t:{default:t}}(i).default)(function(){l()&&a()?o("init","supported"):(document.querySelector("#fallback").classList.add("visible"),o("init","unsupported"))})},135:function(t,e,n){var o=n(136);"string"==typeof o&&(o=[[t.i,o,""]]);n(11)(o,{});o.locals&&(t.exports=o.locals)},136:function(t,e,n){e=t.exports=n(10)(),e.push([t.i,"#fallback{position:absolute;top:0;left:0;width:100%;height:100%;background-color:#000;color:#fff;font-family:sans-serif;display:none}#fallback #text{line-height:30px;position:absolute;top:50%;left:50%;width:300px;font-size:20px;text-align:center;-webkit-transform:translate(-50%,-50%);transform:translate(-50%,-50%)}#fallback #text a{color:#fff}#fallback.visible{display:block}",""])}},[134]);