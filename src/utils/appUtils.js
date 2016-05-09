export const isTouchDevice = () => {
  return (('ontouchstart' in window)
  || (navigator.MaxTouchPoints > 0)
  || (navigator.msMaxTouchPoints > 0));
}

export const swap = (arr, from, to) => {
  const tmp = arr[to]
  arr[to] = arr[from]
  arr[from] = tmp
  return arr
}

export const checkWin = (order) => {
  return _.every(order, (value, index, array)=>
    index === 0 || array[index - 1] < value
  )
}