const template =
`<div class="video-wrapper" v-on:mouseover="show = true" v-on:mouseleave="show = false">

  <slot></slot>

  <div class="controls-wrapper" v-bind:class="{ show: show }"></div>
 </div>`

Vue.component('video-controls', {

  template: template,

  data () {
    return {
      show: false
    };
  }

});

const videoControls = new Vue({
  el: '#vue-mount'
});
