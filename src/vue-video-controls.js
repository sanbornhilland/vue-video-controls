const template =
`<div class="video-wrapper">

  <slot></slot>

  <div class="controls-wrapper show"></div>
 </div>`

Vue.component('video-controls', {

  template: template

});

const videoControls = new Vue({
  el: '#vue-mount'
});
