export default class EventPrototype {
  constructor () {
    this.handlers = {}
  }

  once (eventType, handler) {
    (this.handlers[eventType] || (this.handlers[eventType] = [])).push({
      once: true,
      func: handler
    })
  }

  addEventListener (eventType, handler) {
    (this.handlers[eventType] || (this.handlers[eventType] = [])).push({
      once: false,
      func: handler
    })
  }

  removeEventListener (eventType, handler) {
    if (!Array.isArray(this.handlers[eventType])) return
    let handlers = this.handlers[eventType]
    for (let i = 0; i < handlers.length; i++) {
      if (handlers[i]['func'] === handler) {
        this.handlers[eventType].splice(i, 1)
        break
      }
    }
    if (this.handlers[eventType].length === 0) {
      delete this.handlers[eventType]
    }
  }

  fire (eventType, payload) {
    if (!Array.isArray(this.handlers[eventType])) return
    let handlers = this.handlers[eventType].slice()
    for (let i = 0; i < handlers.length; i++) {
      handlers[i]['func'].call(this, payload)
      if (handlers[i]['once']) {
        this.removeEventListener(eventType, handlers[i]['func'])
      }
    }
  }
}
