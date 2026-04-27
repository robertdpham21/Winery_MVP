const NOTIFICATION_EVENT = 'winery-notification'

export const notify = (type, message) => {
  if (!message) return

  window.dispatchEvent(
    new CustomEvent(NOTIFICATION_EVENT, {
      detail: { type, message },
    })
  )
}

export const notifySuccess = (message) => notify('success', message)

export const notifyError = (message) => notify('error', message)