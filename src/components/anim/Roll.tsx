/** Text that rolls up to a duplicate on hover — used inside links and buttons. */
export default function Roll({ children }: { children: string }) {
  return (
    <span className="roll" data-text={children}>
      <span className="roll-a">{children}</span>
      <span className="roll-b" aria-hidden="true">
        {children}
      </span>
    </span>
  )
}
