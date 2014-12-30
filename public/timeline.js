function Frame (duration, data) {
  this.duration = duration   
  this.data     = data
}

function Timeline (frames) {
  this.frames   = frames 
  this.index    = 0
  this.timeLeft = frames[0].duration

  Object.defineProperty(this, "currentFrame", {
    get: function () { return this.frames[this.index] }
  })
}

function updateTimeline (dT, timeline) {
  var maxIndex      = timeline.frames.length - 1
  var overshoot     = timeline.timeLeft - dT
  var shouldAdvance = overshoot <= 0
  var nextIndex     = timeline.index >= maxIndex ? 0 : timeline.index + 1
  
  if (shouldAdvance) {
    timeline.index    = nextIndex
    timeline.timeLeft = timeline.frames[nextIndex].duration + overshoot
  } else {
    timeline.timeLeft = overshoot
  }
}
