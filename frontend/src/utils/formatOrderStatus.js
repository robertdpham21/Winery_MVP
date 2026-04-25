const ORDER_STATUS_STYLES = {
  pending: { label: 'Pending', className: 'order-status--pending' },
  ready_for_pickup: { label: 'Ready for Pickup', className: 'order-status--ready' },
  picked_up: { label: 'Picked Up', className: 'order-status--picked' },
  cancelled: { label: 'Cancelled', className: 'order-status--cancelled' },
  completed: { label: 'Completed', className: 'order-status--completed' },
}

export const formatOrderStatus = (status) => {
  const normalizedStatus = String(status || '').toLowerCase()
  return ORDER_STATUS_STYLES[normalizedStatus] || {
    label: status ? String(status) : 'Unknown',
    className: 'order-status--default',
  }
}
