import { InlineMath, BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'

interface Props {
  math: string
  block?: boolean
  className?: string
}

export function MathLabel({ math, block, className }: Props) {
  if (block) return <div className={className}><BlockMath math={math} /></div>
  return <span className={className}><InlineMath math={math} /></span>
}
