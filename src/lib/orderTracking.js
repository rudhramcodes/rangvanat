const stages = [
  ['received', 'Order received'],
  ['in_stitching', 'Preparing your order'],
  ['dispatched', 'Dispatched'],
  ['delivered', 'Delivered'],
];

export function trackingSteps(status) {
  if (status === 'cancelled') return [{label: 'Order cancelled', state: 'cancelled', description: 'This order will not be fulfilled.'}];
  const current = stages.findIndex(([id]) => id === status);
  return stages.map(([id, label], index) => {
    const state = index < current || (id === 'delivered' && status === id)
      ? 'complete' : index === current ? 'current' : 'upcoming';
    return {label, state, description: state === 'complete' ? 'Complete' : state === 'current' ? 'In progress' : 'Awaiting update'};
  });
}
