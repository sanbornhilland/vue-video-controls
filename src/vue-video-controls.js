const template =
`<div class="video-wrapper"
      v-on:mouseover="showControls"
      v-on:mouseleave="hideControls"
      v-on:click="togglePlay">

  <slot></slot>

  <div class="controls-wrapper" v-bind:class="{ show: show }"></div>
 </div>`

Vue.component('video-controls', {

  template: template,

  mounted () {
    this.video = this.$slots.default[0].elm // There has to be a better way to do this

    window.video = this.video; // Attach for easy debugging.

    video.addEventListener('play', this.hideControls);
    video.addEventListener('pause', this.showControls);
  },

  data () {
    return {
      show: true,
      video: undefined
    }
  },

  methods: {
    showControls () {
      this.show = true
    },

    hideControls () {
      if (this.video.paused)
        return

      this.show = false
    },

    togglePlay () {
      this.video.paused ? this.video.play() : this.video.pause();
    }
  }

})

const videoControls = new Vue({
  el: '#vue-mount'
})
