function Frame (duration, easingFunction, data) {
  this.duration       = duration   
  this.easingFunction = easingFunction
  this.data           = data
}

function Timeline (frames) {
  this.frames   = frames 
  this.index    = 0
  this.oldIndex = 0
  this.timeLeft = frames[0].duration

  Object.defineProperty(this, "currentFrame", {
    get: function () { return this.frames[this.index] }
  })

  Object.defineProperty(this, "previousFrame", {
    get: function () { return this.frames[this.oldIndex] } 
  })
}

function updateTimeline (dT, timeline) {
  var maxIndex      = timeline.frames.length - 1
  var overshoot     = timeline.timeLeft - dT
  var shouldAdvance = overshoot <= 0
  var nextIndex     = timeline.index >= maxIndex ? 0 : timeline.index + 1
  
  if (shouldAdvance) {
    timeline.oldIndex = timeline.index
    timeline.index    = nextIndex
    timeline.timeLeft = timeline.frames[nextIndex].duration + overshoot
  } else {
    timeline.timeLeft = overshoot
  }
}

function tweenTimeline (timeline, startVal, endVal) {
  var frame     = timeline.currentFrame
  var timeLeft  = timeline.timeLeft
  var totalTime = frame.duration
  var fn        = frame.easingFunction

  return fn(timeLeft, totalTime, startVal, endVal)
}

//linear easing function
function linear (timeLeft, totalTime, startVal, endVal) {
  return ((totalTime - timeLeft) / totalTime) * (endVal - startVal) + startVal
}
