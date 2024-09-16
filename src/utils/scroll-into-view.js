export function scrollIntoViewIfNeeded(element, scrollOptions) {
  if (typeof element === "string") element = document.querySelector(element)
  if (!element) return
  const rect = element.getBoundingClientRect()
  const isInViewport = (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
  if (!isInViewport) {
    element.scrollIntoView({ block: "center", inline: "nearest", ...scrollOptions });
  }
}