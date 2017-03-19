const template =
`<div class="video-wrapper" @mouseover="showControls" @mouseleave="hideControls" @click="togglePlay">

  <slot></slot>

  <div class="controls-wrapper" v-bind:class="{ show: show }">
    <div class="progress-bar clickable">
      <div class="progress-bar-total"></div>
      <div class="progress-bar-buffered" :style="{ width: bufferedPercentage + '%' }"></div>
      <div class="progress-bar-played" :style="{ width: playedPercentage + '%'}">
        <div class="progress-bar-scrubber" @mousedown.stop="startSeek" ></div>
      </div>
    </div>

    <div class="buttons">

      <div class="buttons-left-side-wrapper">

        <div class="control-element-wrapper">
          <div class="play-pause-button clickable" :class="video && video.paused ? 'play' : 'pause'"> </div>
        </div>

      </div>

      <div class="buttons-right-side-wrapper">

        <div class="control-element-wrapper fullscreen-wrapper" @click="toggleFullscreen">
          <div class="fullscreen clickable">
            <div v-for="item in new Array(4)" class="corner"></div>
          </div>
        </div>

      </div>

    </div>
  </div>
 </div>`

Vue.component('video-controls', {

  template: template,

  mounted () {
    this.video = this.$slots.default[0].elm // There has to be a better way to do this

    window.video = this.video; // Attach for easy debugging.

    video.addEventListener('pause', this.showControls);

    // Seems a little blunt but timeupdate doesn't fire that
    // often so this seems to produce a smoother slider.
    setInterval(() => {
      this.updatePlayedPercentage()
      this.updateBufferedPercentage()
    }, 100);
  },

  data () {
    return {
      show: true,
      video: undefined,
      playedPercentage: 0,
      bufferedPercentage: 0
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
      this.video.paused ? this.video.play() : this.video.pause()
    },

    toggleFullscreen () {
      if (document.fullscreenElement)
        document.exitFullscreen()
      else if (document.webkitFullscreenElement)
        document.webkitExitFullscreen()
      else if (this.$el.requestFullscreen)
        this.$el.requestFullscreen()
      else if (this.$el.webkitRequestFullscreen)
        this.$el.webkitRequestFullscreen()
      else
        console.log('Your shitty half-baked polyfill doesn not work in this browser')
    },

    updatePlayedPercentage () {
      const progress = this.video.currentTime / this.video.duration
      this.playedPercentage =  progress * 100
    },

    updateBufferedPercentage () {
      try {
        let progress = vid.buffered.end(0) / vid.duration
      } catch (error) {
        return
      }

      this.bufferedPercentage = progress * 100
    },

    startSeek () {
      document.addEventListener('mousemove', this.seek)
      document.addEventListener('mouseup', () => {
        document.removeEventListener('mousemove', this.seek)
      })
    },

    seek (event) {
      const timeline = this.$el.querySelector('.progress-bar-total')
      const timelineLeft = timeline.getBoundingClientRect().left
      const mouseFromTimelineLeft = event.clientX - timelineLeft
      const playFromPercent = mouseFromTimelineLeft / timeline.offsetWidth
      this.video.currentTime = this.video.duration * playFromPercent
    }
  }

})

const videoControls = new Vue({
  el: '#vue-mount'
})
