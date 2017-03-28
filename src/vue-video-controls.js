const template =
`<div class="video-wrapper clickable" @mouseover="showControls" @mouseleave="hideControls" @click="togglePlay">

  <slot></slot>

  <div class="controls-wrapper" v-bind:class="{ show: show }" @click.stop="">
    <div class="progress-bar clickable" @click="seek($event)">
      <div class="progress-bar-total"></div>
      <div class="progress-bar-buffered" :style="progressBarBufferedStyle"></div>
      <div class="progress-bar-played" :style="progressBarPlayedStyle">
        <div class="progress-bar-scrubber" @mousedown.stop="onSlide(seek)" ></div>
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
            <div class="volume-slider-volume" :style="volumeSliderStyle">
              <div class="volume-scrubber"
                   @mousedown.stop="onSlide(setVolumeByScrubberPosition)"></div>
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

  computed: {
    progressBarBufferedStyle () {
      return {
        width: `${this.bufferedPercentage}%`
      }
    },

    progressBarPlayedStyle () {
      return {
        width: `${this.playedPercentage}%`
      }
    },

    volumeSliderStyle () {
      return {
        width: `${this.volumePercentage}%`
      }
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

    onSlide (callback) {
      document.addEventListener('mousemove', callback)
      document.addEventListener('mouseup', () => {
        document.removeEventListener('mousemove', callback)
      })
    },

    seek (event) {
      const playFromPercent =
          this.getMousePositionFromLeftInPercentage('.progress-bar-total', event.clientX)

      this.video.currentTime = this.video.duration * playFromPercent
    },

    setVolumeByScrubberPosition (event) {
      const volume =
          this.getMousePositionFromLeftInPercentage('.volume-slider-total', event.clientX)

      if (volume >= 0 && volume <= 1)
        this.video.volume = volume
    },

    setVolume () {
      this.volumePercentage = this.video.muted ? 0 : this.video.volume * 100
    },

    getMousePositionFromLeftInPercentage (selector, clientX) {
      const element = this.$el.querySelector(selector)
      const mouseFromElementLeft =
          this.getMousePositionFromLeftInPixels(element, clientX)
      const positionFromLeftInPercentage = mouseFromElementLeft / element.offsetWidth

      return positionFromLeftInPercentage
    },

    getMousePositionFromLeftInPixels (element, clientX) {
      const elementLeft = element.getBoundingClientRect().left
      const mouseFromElementLeft = clientX - elementLeft

      return mouseFromElementLeft
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
