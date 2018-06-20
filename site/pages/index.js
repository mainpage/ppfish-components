export default {
  documents: {
    'quick-start': require('./quick-start'),
    'changelog': require('./changelog'),
    'contributing': require('./contributing'),
    'resource': require('./resource'),
  },
  components: {
    'Basic': {
      'color': require('./color'),
      'typography': require('./typography'),
      'icon': require('./icon'),
      'button': require('./button')
    },
    'Form': {
      'radio': require('./radio'),
      'checkbox': require('./checkbox'),
    },
    'Test': {
      'animationImageLoader': require('./animationImageLoader')
    }
  }
};