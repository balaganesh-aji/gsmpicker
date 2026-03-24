import gsap from 'gsap'

/**
 * Stagger children into view with arc + follow-through
 * Staging: elements arrive sequentially, most important first
 */
export function staggerCards(els, { delay = 0, stagger = 0.06 } = {}) {
  if (!els || !els.length) return
  gsap.fromTo(els,
    { opacity: 0, y: 28, x: 8, rotation: 1.5 },
    {
      opacity: 1, y: 0, x: 0, rotation: 0,
      duration: 0.55,
      stagger,
      delay,
      ease: 'power3.out',
      clearProps: 'transform,opacity',
    }
  )
}

/**
 * Stagger a container's direct children
 */
export function staggerChildren(containerEl, { delay = 0, stagger = 0.07, y = 20 } = {}) {
  if (!containerEl) return
  const children = Array.from(containerEl.children)
  if (!children.length) return
  gsap.fromTo(children,
    { opacity: 0, y, x: 6 },
    {
      opacity: 1, y: 0, x: 0,
      duration: 0.5,
      stagger,
      delay,
      ease: 'power3.out',
      clearProps: 'transform,opacity',
    }
  )
}

/**
 * Header section slides down and fades in (staging — appears before content)
 */
export function headerEnter(el, delay = 0) {
  if (!el) return
  gsap.fromTo(el,
    { opacity: 0, y: -16 },
    { opacity: 1, y: 0, duration: 0.5, delay, ease: 'power3.out', clearProps: 'transform,opacity' }
  )
}

/**
 * Bottom sheet slides up with arc (slight rotation overshoot = follow-through)
 */
export function sheetEnter(el) {
  if (!el) return
  gsap.fromTo(el,
    { y: '100%', opacity: 0 },
    { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out' }
  )
}

/**
 * Button press — exaggeration: compress then spring back past 1
 */
export function buttonPress(el) {
  if (!el) return
  gsap.killTweensOf(el)
  const tl = gsap.timeline()
  tl.to(el, { scale: 0.9, duration: 0.1, ease: 'power2.in' })
    .to(el, { scale: 1, duration: 0.45, ease: 'back.out(2.5)' })
}

/**
 * Tab icon bounce — exaggeration: icon hops up with arc
 */
export function tabBounce(iconEl) {
  if (!iconEl) return
  gsap.killTweensOf(iconEl)
  gsap.fromTo(iconEl,
    { y: 0, scale: 1 },
    {
      keyframes: [
        { y: -6, scale: 1.25, duration: 0.15, ease: 'power2.out' },
        { y: 0, scale: 1, duration: 0.3, ease: 'back.out(3)' },
      ]
    }
  )
}

/**
 * Success pick — exaggeration flash scale
 */
export function pickSuccess(el) {
  if (!el) return
  gsap.fromTo(el,
    { scale: 1 },
    {
      keyframes: [
        { scale: 1.06, duration: 0.12, ease: 'power2.out' },
        { scale: 1, duration: 0.3, ease: 'back.out(2)' },
      ]
    }
  )
}

/**
 * Animate bar chart bars from 0 height — stagger + overshoot (exaggeration)
 */
export function animateBars(barEls, heights) {
  if (!barEls || !barEls.length) return
  gsap.fromTo(barEls,
    { scaleY: 0, transformOrigin: 'bottom' },
    {
      scaleY: 1,
      duration: 0.55,
      stagger: 0.05,
      delay: 0.15,
      ease: 'back.out(1.4)',
      clearProps: 'transform',
    }
  )
}

/**
 * Count-up number animation
 */
export function countUp(el, from, to, duration = 0.8, delay = 0) {
  if (!el) return
  const obj = { val: from }
  gsap.to(obj, {
    val: to,
    duration,
    delay,
    ease: 'power2.out',
    onUpdate: () => { el.textContent = Math.round(obj.val) }
  })
}

/**
 * Progress bar fill — slow in/slow out
 */
export function fillProgressBar(el, pct, delay = 0.3) {
  if (!el) return
  gsap.fromTo(el,
    { width: '0%' },
    { width: `${pct}%`, duration: 0.9, delay, ease: 'power3.inOut' }
  )
}

/**
 * Screen entrance — content fades + rises from slight offset (arc: slight x too)
 */
export function screenEnter(el, delay = 0) {
  if (!el) return
  gsap.fromTo(el,
    { opacity: 0, y: 18, x: 4 },
    { opacity: 1, y: 0, x: 0, duration: 0.45, delay, ease: 'power3.out', clearProps: 'transform,opacity' }
  )
}
