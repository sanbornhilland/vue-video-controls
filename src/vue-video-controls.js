const template =
`<div class="video-wrapper clickable" @mouseover="showControls" @mouseleave="hideControls" @click="togglePlay">

  <slot></slot>

  <div class="controls-wrapper" v-bind:class="{ show: show }" @click.stop="">
    <div class="progress-bar clickable" @click="seek($event)">
      <div class="progress-bar-total"></div>
      <div class="progress-bar-buffered" :style="{ width: bufferedPercentage + '%' }"></div>
      <div class="progress-bar-played" :style="{ width: playedPercentage + '%'}">
        <div class="progress-bar-scrubber" @mousedown.stop="startSeek" ></div>
      </div>
    </div>

    <div class="buttons">

      <div class="buttons-left-side-wrapper">

        <div class="control-element-wrapper">
          <div class="play-pause-button clickable"
              :class="video && video.paused ? 'play' : 'pause'"
              @click="togglePlay">
          </div>
        </div>

        <div class="volume-slider-wrapper control-element-wrapper clickable">
          <div class="volume-slider">
            <div class="volume-slider-volume" :style="{ width: volumePercentage + '%' }">
              <div class="volume-scrubber" @mousedown.stop="startVolumeScrubbing"></div>
            </div>
            <div class="volume-slider-total"></div>
          </div>
        </div>

        <div class="time control-element-wrapper">
          {{ video && video.currentTime | timestamp }} / {{ video && video.duration | timestamp }}
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

    this.video.addEventListener('pause', this.showControls)

    this.setVolume()
    this.video.addEventListener('volumechange', this.setVolume)

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
      bufferedPercentage: 0,
      runningTime: 0,
      totalTime: 0,
      volumePercentage: 0
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
        console.log('Your shitty half-baked polyfill does not work in this browser')
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
    },

    startVolumeScrubbing () {
      document.addEventListener('mousemove', this.setVolumeByScrubberPosition)
      document.addEventListener('mouseup', () => {
        document.removeEventListener('mousemove', this.setVolumeByScrubberPosition)
      })
    },

    setVolumeByScrubberPosition (event) {
      const volumeTotal = this.$el.querySelector('.volume-slider-total')
      const volumeTotalLeft = volumeTotal.getBoundingClientRect().left
      const mouseFromVolumeTotalLeft = event.clientX - volumeTotalLeft
      const volume = mouseFromVolumeTotalLeft / volumeTotal.offsetWidth

      if (volume >= 0 && volume <= 1)
        this.video.volume = volume
    },

    setVolume () {
      this.volumePercentage = this.video.muted ? 0 : this.video.volume * 100
    }
  }
})

Vue.filter('timestamp', (time) => {
  const durationInMinutes = time / 60
  let seconds = Math.floor((time % 60)) || 0

  seconds = seconds < 10 ? `0${seconds}` : seconds

  const minutes = Math.floor(durationInMinutes) || 0

  return `${minutes}:${seconds}`
})

const videoControls = new Vue({
  el: '#vue-mount'
})
